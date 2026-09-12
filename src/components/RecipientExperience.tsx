import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Experience,
  VisualScene,
  ExperienceResponse,
  ResponseAnswer,
  RecipientProfile,
  AnswerReward,
  ExperienceTheme,
  SessionProfile,
} from '../types';
import { SceneManager } from './SceneManager';
import { ProgressHearts } from './ProgressHearts';
import { WelcomeScreen } from './WelcomeScreen';
import { RecipientProfileSetup } from './RecipientProfileSetup';
import { PersonalGreeting } from './PersonalGreeting';
import { QuestionCard } from './QuestionCard';
import { AnswerRewardOverlay } from './AnswerRewardOverlay';
import { FinalReveal } from './FinalReveal';
import { FloatingHearts } from './FloatingHearts';
import { DodgingNoButton } from './DodgingNoButton';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { googleWorkspaceService } from '../services/googleWorkspace';
import { uploadRecipientPhoto } from '../services/photoStorage';
import { getThemeConfig } from '../data/themes';
import { getSceneConfig } from '../data/sceneLibrary';
import { PersonalizationEngine } from '../services/personalizationEngine';
import { OPTIONAL_FREE_TEXT_QUESTION } from '../data/defaultQuestions';
import { ShieldCheck, Sparkles } from 'lucide-react';

// Re-export DodgingNoButton for convenience and modular usage across experiences
export { DodgingNoButton };

interface RecipientExperienceProps {
  experience: Experience;
  isLoading?: boolean;
  onExit?: () => void;
}

type ExperienceStage =
  | 'welcome'
  | 'profile-setup'
  | 'greeting'
  | 'questions'
  | 'completed';

export const RecipientExperience: React.FC<RecipientExperienceProps> = ({
  experience,
  isLoading = false,
  onExit,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stage, setStage] = useState<ExperienceStage>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ResponseAnswer>>({});
  const [startedAt, setStartedAt] = useState<string>('');
  const [sessionId] = useState<string>(
    () => `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );
  const [savedResponse, setSavedResponse] = useState<ExperienceResponse | null>(null);
  const [heartBurstKey, setHeartBurstKey] = useState<number>(0);

  // Recipient mini-profile state
  const [recipientProfile, setRecipientProfile] = useState<RecipientProfile>({
    name: experience.recipientName || 'You',
    nickname: '',
    lovelyName: 'Sweetheart',
    selectedTheme: (experience.theme as ExperienceTheme) || 'midnight-rose',
  });

  // Active answer reward overlay state
  const [activeReward, setActiveReward] = useState<AnswerReward | null>(null);

  // Mature mode confirmation state (for Midnight / Flirty vibes)
  const isMidnightVibe = experience.vibe === 'Midnight';
  const [matureConsentGiven, setMatureConsentGiven] = useState<boolean>(!isMidnightVibe);
  const [showMatureModal, setShowMatureModal] = useState<boolean>(false);

  // Derive base questions with optional dynamic questions
  const baseQuestions = useMemo(() => {
    let list = [...experience.questions];
    if (
      experience.dynamicConfig?.enableFreeTextQuestion &&
      !list.some((q) => q.type === 'text-input')
    ) {
      const last = list[list.length - 1];
      const rest = list.slice(0, -1);
      list = [...rest, OPTIONAL_FREE_TEXT_QUESTION, last];
    }
    return list;
  }, [experience.questions, experience.dynamicConfig?.enableFreeTextQuestion]);

  // Derive dynamic SessionProfile from recipient profile and accumulated answers
  const sessionProfile: SessionProfile = useMemo(() => {
    return PersonalizationEngine.extractSessionProfile(
      recipientProfile,
      answers,
      experience.vibe || 'Romantic'
    );
  }, [recipientProfile, answers, experience.vibe]);

  // Adapt current question text, subtitle, and visual scene based on prior answers & tags
  const rawCurrentQuestion = baseQuestions[currentQuestionIndex];
  const currentQuestion = useMemo(() => {
    if (!rawCurrentQuestion) return rawCurrentQuestion;
    return PersonalizationEngine.resolveAdaptiveQuestion(
      rawCurrentQuestion,
      sessionProfile,
      experience.dynamicConfig
    );
  }, [rawCurrentQuestion, sessionProfile, experience.dynamicConfig]);

  const questions = baseQuestions;

  // Active theme is driven by recipient's choice, falling back to creator's default
  const activeTheme: ExperienceTheme =
    recipientProfile.selectedTheme || (experience.theme as ExperienceTheme) || 'midnight-rose';
  const themeConfig = getThemeConfig(activeTheme);

  // Restore partial session progress & recipient profile on initial load
  useEffect(() => {
    try {
      const storageKey = `closer_progress_${experience.id}`;
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) {
          setRecipientProfile(parsed.profile);
        }
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (typeof parsed.currentQuestionIndex === 'number') {
            setCurrentQuestionIndex(
              Math.min(parsed.currentQuestionIndex, questions.length - 1)
            );
          }
          if (parsed.stage && parsed.stage !== 'completed') {
            setStage(parsed.stage);
          }
          if (parsed.startedAt) {
            setStartedAt(parsed.startedAt);
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }, [experience.id, questions.length]);

  // Initial luxury shimmer transition on mount/experience change
  useEffect(() => {
    setIsInitializing(true);
    setHeartBurstKey((prev) => prev + 1);
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [experience.id]);

  // Save partial progress
  useEffect(() => {
    if (stage === 'questions' && Object.keys(answers).length > 0) {
      try {
        const storageKey = `closer_progress_${experience.id}`;
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            stage,
            currentQuestionIndex,
            answers,
            startedAt,
            profile: recipientProfile,
          })
        );
      } catch {}
    }
  }, [experience.id, stage, currentQuestionIndex, answers, startedAt, recipientProfile]);

  // Count view on mount
  useEffect(() => {
    storageService.incrementViewCount(experience.id);
  }, [experience.id]);

  // Determine active visual scene
  const activeScene: VisualScene = useMemo(() => {
    if (stage === 'welcome' || stage === 'profile-setup') return 'sunset';
    if (stage === 'greeting') return 'golden-lights';
    if (stage === 'completed') return 'cinematic-finale';
    return currentQuestion ? currentQuestion.visualScene : 'sunset';
  }, [stage, currentQuestion]);

  // Determine next visual scene for proactive preloading
  const nextScene: VisualScene | undefined = useMemo(() => {
    if (stage === 'welcome') return 'sunset';
    if (stage === 'profile-setup') return 'golden-lights';
    if (stage === 'greeting') {
      return questions[0] ? questions[0].visualScene : 'sunset';
    }
    if (stage === 'questions') {
      const nextQ = questions[currentQuestionIndex + 1];
      return nextQ ? nextQ.visualScene : 'cinematic-finale';
    }
    return undefined;
  }, [stage, currentQuestionIndex, questions]);

  // Full scene visual config based on active theme
  const activeSceneConfig = useMemo(
    () => getSceneConfig(activeScene, activeTheme),
    [activeScene, activeTheme]
  );

  // Dynamic glow gradient tuned to visual scene
  const getSceneGlow = (scene?: VisualScene): string => {
    switch (scene) {
      case 'golden-lights':
        return 'from-amber-500/25 via-yellow-500/20 to-rose-500/20';
      case 'city-night':
        return 'from-indigo-500/25 via-purple-500/20 to-pink-500/20';
      case 'moonlight':
        return 'from-blue-500/20 via-indigo-500/20 to-violet-500/20';
      case 'dreamy-stars':
        return 'from-purple-500/25 via-fuchsia-500/20 to-pink-500/20';
      case 'rose-petals':
      case 'cinematic-finale':
        return 'from-rose-500/30 via-pink-500/25 to-rose-600/20';
      case 'food':
        return 'from-amber-500/25 via-rose-500/20 to-orange-500/15';
      case 'sunset':
      default:
        return 'from-rose-500/25 via-pink-500/20 to-purple-500/20';
    }
  };

  // Cinematic exit/enter variants with blur, subtle scale & perspective interpolation
  const cardTransitionVariants = {
    initial: {
      opacity: 0,
      y: 22,
      scale: 0.978,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -18,
      scale: 0.978,
      filter: 'blur(10px)',
      transition: {
        duration: 0.32,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const getDeviceCategory = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // 1. Recipient clicks "Begin" on welcome screen -> goes to Mini-Profile Setup
  const handleWelcomeStart = () => {
    setStartedAt(new Date().toISOString());
    setStage('profile-setup');
  };

  // 2. Recipient submits mini-profile -> goes to personalized Greeting
  const handleProfileComplete = async (profile: RecipientProfile) => {
    setRecipientProfile(profile);
    setHeartBurstKey((prev) => prev + 1);
    try {
      await storageService.saveActiveSessionProfile(experience.id, sessionId, profile);
    } catch (err) {
      console.warn('Profile save note:', err);
    }
    setStage('greeting');
  };

  // 3. Recipient begins questions from personalized Greeting
  const handleBeginQuestions = () => {
    if (isMidnightVibe && !matureConsentGiven) {
      setShowMatureModal(true);
      return;
    }
    setStage('questions');
    setCurrentQuestionIndex(0);
  };

  // 4. Answering a question: records answer, triggers reward overlay, then advances
  const handleAnswerQuestion = async (
    answerValue: string | string[],
    evasionCount?: number,
    reward?: AnswerReward
  ) => {
    if (!currentQuestion) return;

    const answerRecord: ResponseAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      category: currentQuestion.category,
      value: answerValue,
      evasionCount: evasionCount || 0,
      answeredAt: new Date().toISOString(),
    };

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: answerRecord,
    };
    setAnswers(updatedAnswers);

    // Contextual micro-reaction if no custom reward was explicitly passed
    let activeRew = reward;
    if (!activeRew && experience.dynamicConfig?.enableDynamicCopy !== false && currentQuestion) {
      const matchedOpt = currentQuestion.options?.find((o) =>
        Array.isArray(answerValue) ? answerValue.includes(o.label) : o.label === answerValue
      );
      const micro = PersonalizationEngine.getAnswerMicroReaction(
        matchedOpt,
        currentQuestion.category,
        sessionProfile
      );
      if (micro) {
        activeRew = {
          message: micro.message,
          visual: micro.visual || '✨',
          animationType: 'glow',
          duration: 1600,
        };
      }
    }

    // If an answer reward is provided, show the overlay first
    if (activeRew) {
      setActiveReward(activeRew);
    } else {
      proceedAfterAnswer(updatedAnswers);
    }
  };

  const handleRewardDismiss = () => {
    setActiveReward(null);
    proceedAfterAnswer(answers);
  };

  const proceedAfterAnswer = async (currentAnswers: Record<string, ResponseAnswer>) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions!
      // Immediately construct and persist response without blocking user transition
      const responseSessionId = sessionId;
      const initialPhotoUrl = recipientProfile.photoUrl;

      const updatedProfile: RecipientProfile = {
        ...recipientProfile,
        ...(initialPhotoUrl ? { photoUrl: initialPhotoUrl } : {}),
      };
      if (!initialPhotoUrl) {
        delete updatedProfile.photoUrl;
      }

      // Separate public answers from private answers (e.g. secret question, sensitive thoughts)
      const publicAnswers: Record<string, ResponseAnswer> = {};
      const privateAnswers: Record<string, ResponseAnswer> = {};

      Object.entries(currentAnswers).forEach(([qid, ans]) => {
        const qObj = baseQuestions.find((q) => q.id === qid);
        if (qObj?.isPrivate) {
          privateAnswers[qid] = ans;
        } else {
          publicAnswers[qid] = ans;
        }
      });

      // Generate deterministic personality snapshot
      const personalitySnapshot =
        experience.dynamicConfig?.enablePersonalitySnapshot !== false
          ? PersonalizationEngine.generatePersonalitySnapshot(sessionProfile, currentAnswers)
          : undefined;

      try {
        const responsePayload: Omit<ExperienceResponse, 'id' | 'completedAt'> = {
          experienceId: experience.id,
          ownerId: experience.ownerId,
          sessionId: responseSessionId,
          recipientName: recipientProfile.name || experience.recipientName,
          recipientProfile: updatedProfile,
          theme: activeTheme,
          vibe: experience.vibe || 'Romantic',
          completionState: 'completed',
          answers: publicAnswers,
          privateAnswers: Object.keys(privateAnswers).length > 0 ? privateAnswers : undefined,
          personalitySnapshot,
          startedAt: startedAt || new Date().toISOString(),
          deviceCategory: getDeviceCategory(),
          ...(initialPhotoUrl ? { photoUrl: initialPhotoUrl } : {}),
        };

        const finalResp = storageService.saveResponse(responsePayload);

        // Clear stored temporary progress
        try {
          sessionStorage.removeItem(`closer_progress_${experience.id}`);
        } catch {}

        setSavedResponse(finalResp);

        // Instantly advance to final reveal - zero wait!
        setIsSaving(false);
        setStage('completed');

        // Async background tasks - run silently in the background
        const currentUser = storageService.getCurrentUser();
        try {
          emailService.sendCompletionNotification(
            finalResp,
            currentUser.email,
            experience.title
          );
          googleWorkspaceService.sendGmailNotification(finalResp, experience.title);
          googleWorkspaceService.exportToGoogleSheets(finalResp);
        } catch (dispatchErr) {
          console.warn('Background notification dispatch note:', dispatchErr);
        }

        // Background photo upload to cloud if data URL present
        if (initialPhotoUrl && initialPhotoUrl.startsWith('data:')) {
          uploadRecipientPhoto(responseSessionId, initialPhotoUrl)
            .then((cloudUrl) => {
              if (cloudUrl && cloudUrl !== initialPhotoUrl) {
                storageService.updateResponsePhoto(finalResp.id, cloudUrl);
              }
            })
            .catch((e) => {
              console.warn('Background photo upload note:', e);
            });
        }
      } catch (err) {
        console.error('Error saving experience response:', err);
        setIsSaving(false);
        setStage('completed');
      }
    }
  };

  const handleReplay = () => {
    try {
      sessionStorage.removeItem(`closer_progress_${experience.id}`);
    } catch {}
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStage('welcome');
    setHeartBurstKey((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none">
      {/* Dynamic Visual Scene Manager applying background visuals, blur layers, and particle effects based on question index */}
      <SceneManager
        questionIndex={
          stage === 'questions'
            ? currentQuestionIndex
            : stage === 'completed'
            ? questions.length
            : -1
        }
        totalQuestions={questions.length}
        stage={stage}
        currentQuestion={currentQuestion}
        theme={activeTheme}
        customScene={activeScene}
        nextScene={nextScene}
      />

      {/* Floating Romantic Hearts Initialization & Ambient Stream */}
      <FloatingHearts
        triggerKey={`${experience.id}-${heartBurstKey}`}
        count={24}
        ambient={true}
      />

      {/* Reward Overlay Triggered after Question Answer */}
      {activeReward && (
        <AnswerRewardOverlay
          reward={activeReward}
          theme={activeTheme}
          recipientProfile={recipientProfile}
          onComplete={handleRewardDismiss}
        />
      )}

      {/* Mature Consent Confirmation Modal for Midnight / Flirty Vibe */}
      {showMatureModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border text-center relative overflow-hidden ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.cardShadow}`}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white font-normal mb-2">
              A Midnight Conversation
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
              This experience has a slightly more teasing, late-night vibe curated especially for you. Please confirm you are 18+ to enter.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMatureConsentGiven(true);
                  setShowMatureModal(false);
                  setStage('questions');
                  setCurrentQuestionIndex(0);
                }}
                className={`w-full py-3 px-5 rounded-xl bg-gradient-to-r ${themeConfig.primaryBtn} text-white text-xs sm:text-sm font-medium shadow-md cursor-pointer`}
              >
                Confirm 18+ & Enter ❤️
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatureConsentGiven(true);
                  setShowMatureModal(false);
                  setStage('questions');
                  setCurrentQuestionIndex(0);
                }}
                className="w-full py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Continue softly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header bar with progress hearts & recipient branding */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between z-10 pt-3 sm:pt-5 pb-2 px-3 sm:px-6">
        {stage === 'questions' ? (
          <div className="w-full flex items-center justify-between gap-4">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-white/55 font-medium font-sans flex items-center gap-1.5 shrink-0">
              <span className="text-white/85 font-semibold">Closer</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[#FF6B7F] truncate max-w-[140px] sm:max-w-[200px]">
                {recipientProfile.lovelyName || recipientProfile.nickname || recipientProfile.name || experience.recipientName}
              </span>
            </span>
            <ProgressHearts
              currentStep={currentQuestionIndex + 1}
              totalSteps={questions.length}
              theme={activeTheme}
              compact={true}
            />
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-white/55 font-medium font-sans flex items-center gap-1.5">
              <span className="text-white/85 font-semibold">Closer</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[#FF6B7F]">
                {recipientProfile.lovelyName || recipientProfile.nickname || recipientProfile.name || experience.recipientName}
              </span>
            </span>
          </div>
        )}
      </header>

      {/* Main Experience Interactive Stage Card with Cinematic CSS Perspective */}
      <main className="cinematic-stage-container w-full max-w-2xl mx-auto my-auto flex items-center justify-center z-10 py-3 sm:py-6 px-3 sm:px-6">
        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.div
              key="stage-saving"
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex items-center justify-center p-8 transform-gpu will-change-transform"
            >
              <div
                className={`p-8 sm:p-12 rounded-3xl backdrop-blur-xl border text-center max-w-md w-full transition-all duration-500 cinematic-theme-transition ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.cardShadow}`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr ${themeConfig.primaryBtn} flex items-center justify-center animate-pulse`}
                >
                  <span className="text-3xl">🌹</span>
                </div>
                <h3 className="text-2xl font-serif text-white font-normal mb-2">
                  Saving your moments…
                </h3>
                <p className="text-sm text-white/70 font-light">
                  One quiet moment while we prepare your final reveal ❤️
                </p>
              </div>
            </motion.div>
          ) : stage === 'welcome' ? (
            <motion.div
              key="stage-welcome"
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-2xl relative flex items-center justify-center transform-gpu will-change-transform"
            >
              {/* Romantic ambient glow with subtle breathing pulse */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-purple-500/15 blur-2xl pointer-events-none -z-10 cinematic-pulse-aura"
              />
              <WelcomeScreen
                onStart={handleWelcomeStart}
                senderName={experience.senderName}
                theme={activeTheme}
              />
            </motion.div>
          ) : stage === 'profile-setup' ? (
            <motion.div
              key="stage-profile-setup"
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-2xl relative flex items-center justify-center transform-gpu will-change-transform"
            >
              {/* Ambient atmospheric aura */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-purple-500/20 via-rose-500/20 to-pink-500/15 blur-2xl pointer-events-none -z-10 cinematic-pulse-aura"
              />
              <RecipientProfileSetup
                senderName={experience.senderName || 'your sender'}
                experienceId={experience.id}
                sessionId={sessionId}
                initialRecipientName={experience.recipientName}
                initialNickname={recipientProfile?.nickname || ''}
                initialTheme={activeTheme}
                onComplete={handleProfileComplete}
              />
            </motion.div>
          ) : stage === 'greeting' ? (
            <motion.div
              key="stage-greeting"
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-2xl relative flex items-center justify-center transform-gpu will-change-transform"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-pink-500/20 blur-2xl pointer-events-none -z-10 cinematic-pulse-aura"
              />
              <PersonalGreeting
                recipientName={experience.recipientName}
                recipientProfile={recipientProfile}
                theme={activeTheme}
                senderName={experience.senderName}
                customGreeting={experience.customGreeting}
                onBegin={handleBeginQuestions}
              />
            </motion.div>
          ) : stage === 'questions' && currentQuestion ? (
            <motion.div
              key={`question-${currentQuestion.id}`}
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full relative flex items-center justify-center transform-gpu will-change-transform"
            >
              {/* Cinematic Ambient Glow Bloom */}
              <motion.div
                key={`glow-${currentQuestion.id}`}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{
                  opacity: [0, 0.45, 0.22],
                  scale: [0.88, 1.1, 1],
                }}
                exit={{
                  opacity: 0,
                  scale: 1.18,
                  filter: 'blur(36px)',
                }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                aria-hidden="true"
                className={`absolute -inset-4 sm:-inset-10 rounded-[2.5rem] bg-gradient-to-r ${getSceneGlow(
                  currentQuestion.visualScene
                )} blur-3xl pointer-events-none -z-10`}
              />

              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                recipientProfile={recipientProfile}
                recipientName={experience.recipientName}
                theme={activeTheme}
                layoutMode="floating-glass"
                onAnswer={handleAnswerQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
            </motion.div>
          ) : stage === 'completed' && savedResponse ? (
            <motion.div
              key="stage-completed"
              variants={cardTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full relative flex items-center justify-center transform-gpu will-change-transform"
            >
              {/* Finale grand romantic glow with breathing aura */}
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-rose-500/30 via-pink-500/30 to-amber-500/20 blur-3xl pointer-events-none -z-10 cinematic-pulse-aura"
              />
              <FinalReveal
                recipientName={experience.recipientName}
                recipientProfile={recipientProfile}
                theme={activeTheme}
                senderName={experience.senderName}
                personalNote={experience.personalNote}
                response={savedResponse}
                onReplay={handleReplay}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-2xl mx-auto text-center py-3 z-10 px-4">
        <p className="text-[11px] text-white/35 tracking-wider">
          Closer &bull; An intimate connection experience
        </p>
      </footer>
    </div>
  );
};
