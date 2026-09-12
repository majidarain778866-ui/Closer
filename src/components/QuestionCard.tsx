import React, { useState, useEffect } from 'react';
import { Question, QuestionCategory, ExperienceTheme, RecipientProfile, AnswerReward, LayoutMode } from '../types';
import { ChoiceCard } from './ChoiceCard';
import { DodgingNoButton } from './DodgingNoButton';
import { LocationQuestion } from './LocationQuestion';
import { ProgressHearts } from './ProgressHearts';
import { Sparkles, ArrowRight, Heart, Lock } from 'lucide-react';
import { getThemeConfig } from '../data/themes';
import { replaceTokens } from '../services/questionValidation';

interface QuestionCardProps {
  question: Question;
  recipientProfile?: RecipientProfile;
  recipientName: string;
  theme?: ExperienceTheme;
  layoutMode?: LayoutMode;
  onAnswer: (
    answer: string | string[],
    evasionCount?: number,
    reward?: AnswerReward
  ) => void;
  questionNumber: number;
  totalQuestions?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  recipientProfile,
  recipientName,
  theme = 'midnight-rose',
  layoutMode = 'floating-glass',
  onAnswer,
  questionNumber,
  totalQuestions = 9,
}) => {
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const themeConfig = getThemeConfig(theme);

  // Substitute {name}, {{name}}, {lovelyName}, etc. in question texts
  const formatText = (txt: string) => {
    return replaceTokens(txt, {
      name: recipientProfile?.name || recipientName,
      nickname: recipientProfile?.nickname || recipientName,
      lovelyName: recipientProfile?.lovelyName || recipientName,
    });
  };

  // Reset state when question changes
  useEffect(() => {
    setSelectedSingle(null);
    setCustomText('');
    setIsTransitioning(false);
  }, [question.id]);

  const handleSingleSelect = (label: string, optionId?: string) => {
    setSelectedSingle(label);
    setIsTransitioning(true);

    // Find the option's specific reward
    const matchedOption = question.options?.find(
      (o) => o.id === optionId || o.label === label
    );

    let reward: AnswerReward | undefined = undefined;
    if (matchedOption?.rewardMessage) {
      reward = {
        message: matchedOption.rewardMessage,
        visual: matchedOption.rewardVisual || '✨',
        animationType: 'pop',
        duration: 1000,
      };
    } else if (question.defaultReward) {
      reward = {
        ...question.defaultReward,
        duration: Math.min(question.defaultReward.duration || 1000, 1000),
      };
    }

    setTimeout(() => {
      onAnswer(label, 0, reward);
    }, 100);
  };

  const handleYesNoAnswer = (evasionCount: number) => {
    setIsTransitioning(true);
    const recordedValue =
      evasionCount > 0
        ? `${question.yesLabel || 'Haan ❤️'} (after ${evasionCount} playful evasions)`
        : question.yesLabel || 'Haan ❤️';

    const reward: AnswerReward = question.yesReward || question.defaultReward || {
      message: 'Mujhe lagta tha jawab yahi hoga… ❤️',
      visual: '🌹',
      animationType: 'heart-burst',
      duration: 1800,
    };

    setTimeout(() => {
      onAnswer(recordedValue, evasionCount, reward);
    }, 110);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setIsTransitioning(true);
    setTimeout(() => {
      onAnswer(customText.trim(), 0, question.defaultReward);
    }, 100);
  };

  const getConversationalEyebrow = (qNum: number): string => {
    if (qNum === 1) return 'Sab se pehle ek sach batao… 👀';
    if (qNum === 2) return 'Pakki friendship… koi parda nahi 🤝';
    if (qNum === 3) return 'Sukoon aur trust ki baat 🤍';
    if (qNum === 4) return 'Pehli nazar aur dhyan… 👀';
    if (qNum === 5) return 'Thodi si personal baat… 😏';
    if (qNum === 6) return 'Kahan mil sakte hain… ❤️';
    if (qNum === 7) return 'Kab milna pasand karogi… 🌇';
    if (qNum === 8) return 'Khana kya hoga… 🍕';
    if (qNum >= 9) return 'Aakhri sawaal… dil se ❤️';
    return 'Acha… ab ek aur baat batao 👀';
  };

  return (
    <div
      key={question.id}
      className={`w-full max-w-2xl mx-auto p-6 sm:p-8 md:p-10 rounded-3xl backdrop-blur-2xl border relative overflow-hidden transition-all duration-500 cinematic-theme-transition transform-gpu shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ${
        themeConfig.cardBg
      } ${themeConfig.cardBorder} ${themeConfig.cardShadow} ${
        isTransitioning ? 'opacity-40 scale-[0.985] blur-[2px]' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      {/* Top ambient sheen highlight with cinematic light sweep */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden pointer-events-none"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent cinematic-light-sweep" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
        {question.isPrivate && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border mb-2 text-[#FF6B7F] border-[rgba(255,70,95,0.25)] bg-[rgba(255,35,65,0.06)] shadow-sm animate-fade-in">
            <Lock className="w-3 h-3 text-[#FF3657]" />
            <span>Private &bull; Shared only with your sender</span>
          </div>
        )}

        {/* Conversational transition & Step indicator */}
        <div className="w-full flex items-center justify-between gap-3 mb-4 sm:mb-5 px-1">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#FF6B7F] tracking-wide">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FF3657]" />
            <span>{getConversationalEyebrow(questionNumber)}</span>
          </div>
          <span className="text-xs font-medium text-[#B8AEB1]/60 tracking-wider">
            {questionNumber} / {totalQuestions}
          </span>
        </div>

        {/* Question Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#F8F2F3] font-serif font-normal leading-tight tracking-tight max-w-lg">
          {formatText(question.text)}
        </h2>

        {/* Subtitle */}
        {question.subtitle && (
          <p className="mt-2.5 text-sm sm:text-base text-[#B8AEB1] max-w-md font-light leading-relaxed">
            {formatText(question.subtitle)}
          </p>
        )}
      </div>

      {/* Question Body by Type */}
      <div className="w-full mt-2">
        {/* Type: single-choice with responsive balanced grid */}
        {question.type === 'single-choice' && question.options && (
          <div
            className={`grid gap-3.5 ${
              question.options.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : question.options.length === 4
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {question.options.map((option, idx) => (
              <ChoiceCard
                key={option.id}
                option={option}
                selected={selectedSingle === option.label}
                onSelect={() => handleSingleSelect(option.label, option.id)}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Optional custom time input for questions with allowCustomTime */}
        {question.type === 'single-choice' && question.allowCustomTime && (
          <div className="mt-4 pt-3 border-t border-[rgba(255,70,95,0.15)] flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
            <input
              type="text"
              placeholder="Ya koi specific time? (e.g. 10:30 PM) ✨"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white/[0.04] border border-[rgba(255,70,95,0.2)] text-sm text-[#F8F2F3] placeholder-[#726A6E] focus:outline-none focus:border-[#FF3657] transition-all"
            />
            {customText.trim() && (
              <button
                type="button"
                onClick={() => {
                  handleSingleSelect(customText.trim(), 'custom-time');
                }}
                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-[#8F1020] via-[#D61F3A] to-[#FF3657] text-white text-xs font-medium cursor-pointer shadow-md hover:opacity-95"
              >
                Set Time
              </button>
            )}
          </div>
        )}

        {/* Type: yes-no (Dodging physics signature interaction) */}
        {question.type === 'yes-no' && (
          <DodgingNoButton
            onConfirmYes={handleYesNoAnswer}
            teasePhrases={question.noConfig?.teaseResponses || question.teaseResponses}
            yesLabel={question.yesLabel || 'Haan ❤️'}
            noLabel={question.noLabel || 'Nahi 😏'}
            intensity={question.noConfig?.dodgingIntensity || 'playful'}
            dodgingEnabled={question.noConfig?.dodgingEnabled ?? true}
            mobileShake={question.noConfig?.mobileShake ?? true}
            morphToYes={question.noConfig?.morphToYes ?? true}
            morphMessage={question.noConfig?.morphMessage || 'Ye jawab mujhe bilkul pasand nahi aya 😏❤️'}
            theme={theme}
            lovelyName={recipientProfile?.lovelyName || recipientName}
          />
        )}

        {/* Type: location */}
        {question.type === 'location' && (
          <LocationQuestion
            options={question.options}
            onConfirm={(escape, loc) => {
              const summary = loc?.formatted ? `${escape} (${loc.formatted})` : escape;
              const reward = question.defaultReward || {
                message: 'That sounds like a breathtaking escape ✨',
                visual: '✈️',
                animationType: 'pop',
                duration: 1800,
              };
              onAnswer(summary, 0, reward);
            }}
            onSkip={() => {
              onAnswer('A surprise getaway spot ✨', 0, {
                message: 'A surprise it is… let’s see where the road takes us 😉',
                visual: '✨',
                animationType: 'glow',
                duration: 1800,
              });
            }}
          />
        )}

        {/* Type: text-input */}
        {question.type === 'text-input' && (
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-4">
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={question.placeholder || 'Write your thoughts here...'}
              className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-white placeholder-white/30 text-base focus:outline-none focus:border-rose-400/50 focus:bg-white/[0.07] transition-all resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <div>
                {!question.required && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        onAnswer('Skipped', 0, {
                          message: 'No pressure, always at your own pace 🤍',
                          visual: '🤍',
                          animationType: 'glow',
                          duration: 1500,
                        });
                      }, 100);
                    }}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    Skip this question
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {customText.length > 0 && (
                  <span className="text-[11px] text-white/40 font-mono">
                    {customText.length} characters
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className={`py-2.5 px-6 rounded-xl bg-gradient-to-r ${themeConfig.primaryBtn} text-white font-medium text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Recipient hint footer - No robotic 'Question X/8' label */}
      <div className="mt-8 pt-4 border-t border-[rgba(255,70,95,0.18)] flex items-center justify-between text-[11px] sm:text-xs text-[#B8AEB1]/70 font-light">
        <span className="flex items-center gap-1.5">
          <Heart className={`w-3 h-3 ${themeConfig.accentText} fill-current/30`} />
          <span>Made especially for {recipientProfile?.lovelyName || recipientProfile?.nickname || recipientName}</span>
        </span>
        <span className="text-[11px] text-[#FF6B7F]/80 font-serif italic">
          {questionNumber === totalQuestions ? 'Aakhri sawaal ❤️' : 'Closer'}
        </span>
      </div>
    </div>
  );
};
