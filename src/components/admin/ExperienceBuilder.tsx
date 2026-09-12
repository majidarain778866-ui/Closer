import React, { useState, useEffect, useMemo } from 'react';
import {
  Experience,
  ExperienceTheme,
  VibeMode,
  ExperienceType,
  Question,
} from '../../types';
import {
  DEFAULT_ROMANTIC_QUESTIONS,
  createExperienceQuestionSnapshot,
  OPTIONAL_LOCATION_QUESTION,
  OPTIONAL_FREE_TEXT_QUESTION,
} from '../../data/defaultQuestions';
import {
  validateExperienceQuestions,
  evaluateQuestionQuality,
} from '../../services/questionValidation';
import { QuestionLibraryModal } from './QuestionLibraryModal';
import { QuestionEditorModal } from './QuestionEditorModal';
import { SCENE_LIBRARY } from '../../data/sceneLibrary';
import { InteractiveQuestionPreview } from './InteractiveQuestionPreview';
import {
  X,
  Sparkles,
  Check,
  Heart,
  Plus,
  Trash2,
  Sliders,
  Lock,
  ArrowLeft,
  ArrowRight,
  Eye,
  Copy,
  AlertCircle,
  AlertTriangle,
  Edit3,
  MoveUp,
  MoveDown,
  Layers,
  BookOpen,
  CheckCircle2,
  User,
  Compass,
  Palette,
  MessageSquare,
  Share2,
  GripVertical,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';

interface ExperienceBuilderProps {
  initialExperience?: Experience | null;
  onSave: (exp: Omit<Experience, 'id' | 'createdAt' | 'viewCount'>) => Experience | void;
  onClose: () => void;
  onOpenExperience?: (exp: Experience) => void;
  onNavigateToResponses?: () => void;
}

type BuilderStep =
  | 'recipient'
  | 'type'
  | 'vibe'
  | 'theme'
  | 'questions'
  | 'messages'
  | 'preview'
  | 'share';

const STEPS: Array<{ id: BuilderStep; label: string; icon: any }> = [
  { id: 'recipient', label: '1. Recipient', icon: User },
  { id: 'type', label: '2. Intent', icon: Compass },
  { id: 'vibe', label: '3. Vibe', icon: Heart },
  { id: 'theme', label: '4. Theme', icon: Palette },
  { id: 'questions', label: '5. Questions', icon: Layers },
  { id: 'messages', label: '6. Messages', icon: MessageSquare },
  { id: 'preview', label: '7. Preview', icon: Eye },
  { id: 'share', label: '8. Share Link', icon: Share2 },
];

export const ExperienceBuilder: React.FC<ExperienceBuilderProps> = ({
  initialExperience,
  onSave,
  onClose,
  onOpenExperience,
  onNavigateToResponses,
}) => {
  // Navigation
  const [currentStep, setCurrentStep] = useState<BuilderStep>('recipient');

  // Step 1: Recipient Profile
  const [recipientName, setRecipientName] = useState(initialExperience?.recipientName || '');
  const [senderName, setSenderName] = useState(initialExperience?.senderName || 'Anonymous');
  const [nickname, setNickname] = useState('');
  const [lovelyName, setLovelyName] = useState('Sweetheart');
  const [photoUrl, setPhotoUrl] = useState('');

  // Step 2: Experience Type
  const [experienceType, setExperienceType] = useState<ExperienceType>(
    initialExperience?.experienceType || 'romantic'
  );

  // Step 3: Vibe Mode
  const [vibe, setVibe] = useState<VibeMode>(initialExperience?.vibe || 'Romantic');

  // Step 4: Theme
  const [theme, setTheme] = useState<ExperienceTheme>(initialExperience?.theme || 'midnight-rose');

  // Step 5: Questions (Snapshots)
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (initialExperience && initialExperience.questions.length > 0) {
      return initialExperience.questions.map((q) => ({
        ...q,
        sourceTemplateId: q.sourceTemplateId || q.id,
        questionInstanceId: q.questionInstanceId || q.id,
      }));
    }
    // Deep clone default questions to isolate from global templates
    return DEFAULT_ROMANTIC_QUESTIONS.map((t) => createExperienceQuestionSnapshot(t));
  });

  // Dynamic Engine settings
  const [enableDynamicCopy, setEnableDynamicCopy] = useState<boolean>(
    initialExperience?.dynamicConfig?.enableDynamicCopy !== false
  );
  const [enableAdaptiveScenes, setEnableAdaptiveScenes] = useState<boolean>(
    initialExperience?.dynamicConfig?.enableAdaptiveScenes !== false
  );
  const [enablePersonalitySnapshot, setEnablePersonalitySnapshot] = useState<boolean>(
    initialExperience?.dynamicConfig?.enablePersonalitySnapshot !== false
  );

  // Step 6: Personal Messages & Link details
  const [title, setTitle] = useState(
    initialExperience?.title ||
      (recipientName ? `A little conversation for ${recipientName}` : 'A private conversation')
  );
  const [customGreeting, setCustomGreeting] = useState(
    initialExperience?.customGreeting || 'Before you go… answer a few little questions for me.'
  );
  const [personalNote, setPersonalNote] = useState(
    initialExperience?.personalNote || 'I hope this made you smile. Dinner next week?'
  );
  const [slug, setSlug] = useState(
    initialExperience?.slug ||
      (recipientName
        ? `${recipientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-special`
        : 'connection')
  );
  const [active, setActive] = useState(initialExperience ? initialExperience.active : true);

  // Modal & Preview states
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [quickPreviewQuestion, setQuickPreviewQuestion] = useState<Question | null>(null);
  const [createdExperience, setCreatedExperience] = useState<Experience | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Draft persistence & Unsaved changes states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [draftBanner, setDraftBanner] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive full preview index
  const [previewQuestionIdx, setPreviewQuestionIdx] = useState(0);

  // Validation
  const validationResult = useMemo(() => validateExperienceQuestions(questions), [questions]);

  // Check for existing draft on mount (only if creating a brand new experience)
  useEffect(() => {
    if (!initialExperience) {
      try {
        const raw = localStorage.getItem('closer_experience_draft');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.recipientName || (parsed.questions && parsed.questions.length > 0))) {
            setDraftBanner(parsed);
          }
        }
      } catch (err) {
        console.error('Failed reading draft', err);
      }
    }
  }, [initialExperience]);

  // Autosave draft whenever significant fields change
  useEffect(() => {
    if (!createdExperience) {
      setHasUnsavedChanges(true);
      try {
        localStorage.setItem(
          'closer_experience_draft',
          JSON.stringify({
            recipientName,
            senderName,
            nickname,
            lovelyName,
            photoUrl,
            experienceType,
            vibe,
            theme,
            questions,
            enableDynamicCopy,
            enableAdaptiveScenes,
            enablePersonalitySnapshot,
            title,
            customGreeting,
            personalNote,
            slug,
            active,
            updatedAt: Date.now(),
          })
        );
      } catch {}
    }
  }, [
    recipientName,
    senderName,
    nickname,
    lovelyName,
    photoUrl,
    experienceType,
    vibe,
    theme,
    questions,
    enableDynamicCopy,
    enableAdaptiveScenes,
    enablePersonalitySnapshot,
    title,
    customGreeting,
    personalNote,
    slug,
    active,
    createdExperience,
  ]);

  const handleManualSaveDraft = () => {
    try {
      localStorage.setItem(
        'closer_experience_draft',
        JSON.stringify({
          recipientName,
          senderName,
          nickname,
          lovelyName,
          photoUrl,
          experienceType,
          vibe,
          theme,
          questions,
          enableDynamicCopy,
          enableAdaptiveScenes,
          enablePersonalitySnapshot,
          title,
          customGreeting,
          personalNote,
          slug,
          active,
          updatedAt: Date.now(),
        })
      );
      setToastMessage('Draft saved to this device ❤️');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {}
  };

  const handleRestoreDraft = () => {
    if (!draftBanner) return;
    if (draftBanner.recipientName) setRecipientName(draftBanner.recipientName);
    if (draftBanner.senderName) setSenderName(draftBanner.senderName);
    if (draftBanner.nickname) setNickname(draftBanner.nickname);
    if (draftBanner.lovelyName) setLovelyName(draftBanner.lovelyName);
    if (draftBanner.photoUrl) setPhotoUrl(draftBanner.photoUrl);
    if (draftBanner.experienceType) setExperienceType(draftBanner.experienceType);
    if (draftBanner.vibe) setVibe(draftBanner.vibe);
    if (draftBanner.theme) setTheme(draftBanner.theme);
    if (draftBanner.questions?.length) setQuestions(draftBanner.questions);
    if (draftBanner.title) setTitle(draftBanner.title);
    if (draftBanner.customGreeting) setCustomGreeting(draftBanner.customGreeting);
    if (draftBanner.personalNote) setPersonalNote(draftBanner.personalNote);
    if (draftBanner.slug) setSlug(draftBanner.slug);
    setDraftBanner(null);
    setToastMessage('Draft restored successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('closer_experience_draft');
    } catch {}
    setDraftBanner(null);
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges && !createdExperience) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  // Handle Recipient Change sync
  const handleRecipientChange = (val: string) => {
    setRecipientName(val);
    if (!initialExperience) {
      setTitle(val ? `A little conversation for ${val}` : 'A private conversation');
      setSlug(val ? `${val.toLowerCase().replace(/[^a-z0-9]/g, '-')}-special` : 'connection');
    }
  };

  // Question manipulation
  const handleAddQuestionFromLibrary = (snapshot: Question) => {
    setQuestions((prev) => [...prev, snapshot]);
  };

  const handleCreateCustomQuestion = () => {
    const instanceId = `q-custom-${Date.now()}`;
    const newCustom: Question = {
      id: instanceId,
      questionInstanceId: instanceId,
      sourceTemplateId: 'custom-user-creation',
      text: 'New Question for You…',
      subtitle: 'Answer honestly…',
      category: 'flirty',
      type: 'single-choice',
      visualScene: 'moonlight',
      options: [
        { id: 'opt-1', label: 'First choice', icon: '✨', rewardMessage: 'Noted! 👀' },
        { id: 'opt-2', label: 'Second choice', icon: '💫', rewardMessage: 'Good pick! 😏' },
      ],
      required: true,
      enabled: true,
    };
    setQuestions((prev) => [...prev, newCustom]);
    setEditingQuestion(newCustom);
  };

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuestion(null);
  };

  const handleDuplicateQuestion = (q: Question) => {
    const clone = createExperienceQuestionSnapshot(q);
    clone.text = `${q.text} (Copy)`;
    setQuestions((prev) => [...prev, clone]);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 2) {
      alert('An experience must have at least 2 questions.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const nextList = [...questions];
    const temp = nextList[idx];
    nextList[idx] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setQuestions(nextList);
  };

  const handleToggleQuestionEnabled = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, enabled: q.enabled === false ? true : false } : q))
    );
  };

  // Final Submit
  const handleSaveAndGenerate = () => {
    if (!recipientName.trim()) {
      alert('Please enter recipient name');
      setCurrentStep('recipient');
      return;
    }

    if (!validationResult.isValid) {
      alert(
        `Please fix configuration errors before generating the link:\n\n${validationResult.errors
          .map((e) => `• ${e.message}`)
          .join('\n')}`
      );
      setCurrentStep('questions');
      return;
    }

    const payload = {
      slug: slug.trim() || `${Date.now()}`,
      ownerId: 'user-demo-1',
      senderName: senderName.trim() || 'Someone special',
      recipientName: recipientName.trim(),
      title: title.trim() || `For ${recipientName}`,
      customGreeting: customGreeting.trim(),
      personalNote: personalNote.trim(),
      theme,
      vibe,
      experienceType,
      dynamicConfig: {
        enableDynamicCopy,
        enableAdaptiveScenes,
        enablePersonalitySnapshot,
        requireMatureConsent: vibe === 'Midnight',
      },
      questions,
      active,
    };

    const saved = onSave(payload);

    // Clear autosave draft once successfully saved
    try {
      localStorage.removeItem('closer_experience_draft');
    } catch {}

    setHasUnsavedChanges(false);

    if (saved) {
      setCreatedExperience(saved);
    } else {
      setCreatedExperience({
        ...payload,
        id: initialExperience?.id || `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }

    setCurrentStep('share');
  };

  // Vibe options
  const vibeOptions: Array<{ id: VibeMode; title: string; desc: string; emoji: string }> = [
    { id: 'Sweet', title: 'Sweet & Tender', desc: 'Gentle warmth, cozy romantic feelings', emoji: '🌸' },
    { id: 'Romantic', title: 'Romantic & Cinematic', desc: 'Deep connection, starry nights, candlelit scenes', emoji: '🌹' },
    { id: 'Flirty', title: 'Playful & Flirty', desc: 'Witty banter, magnetic smiles, teasing', emoji: '😏' },
    { id: 'Midnight', title: 'Midnight Chemistry', desc: '18+ opt-in, late night thoughts, electric spark', emoji: '🌙' },
  ];

  // Theme options
  const themeOptions: Array<{ id: ExperienceTheme; label: string; desc: string; colors: string }> = [
    { id: 'midnight-rose', label: 'Midnight Rose', desc: 'Deep violet, crimson petals, warm pink glow', colors: 'from-rose-900 via-pink-900 to-black' },
    { id: 'moonlit', label: 'Moonlit Serenade', desc: 'Silvery indigo, moonlight reflection, calm romance', colors: 'from-indigo-950 via-slate-900 to-black' },
    { id: 'sunset', label: 'Golden Sunset', desc: 'Amber warmth, twilight skies, intimate evening', colors: 'from-amber-950 via-orange-950 to-black' },
    { id: 'dreamy', label: 'Dreamy Starlight', desc: 'Soft pastel glow, luminous clouds, cosmic charm', colors: 'from-fuchsia-950 via-purple-900 to-black' },
    { id: 'dark-luxury', label: 'Dark Luxury Glass', desc: 'Polished obsidian, gold accents, ultra-sleek', colors: 'from-zinc-950 via-neutral-900 to-black' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in text-left"
    >
      <div className="relative w-full max-w-5xl bg-[#090612] border border-white/15 rounded-3xl shadow-2xl my-auto max-h-[96vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif text-white font-normal">
                {initialExperience ? 'Edit Experience' : 'Create New Closer Experience'}
              </h2>
              <p className="text-xs text-white/50">
                Crafting a personalized, cinematic romantic link for {recipientName || 'your recipient'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleManualSaveDraft}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Save draft to local storage"
            >
              <Save className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {/* Step navigation indicator */}
            <span className="hidden sm:inline-block text-xs font-medium text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Step {STEPS.findIndex((s) => s.id === currentStep) + 1} of {STEPS.length}
            </span>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              {toastMessage}
            </span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-rose-300/60 hover:text-rose-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Draft Restore Banner */}
        {draftBanner && !initialExperience && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-transparent border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-white/80">
                Unsaved draft found for <strong className="text-rose-300">{draftBanner.recipientName || 'your recipient'}</strong>. Would you like to restore it?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-2 py-1 text-white/50 hover:text-white text-xs cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Guided Step Navigator Pills */}
        <div className="px-4 py-2 border-b border-white/10 bg-black/20 overflow-x-auto scrollbar-none flex items-center gap-1">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* STEP 1: Recipient Profile */}
          {currentStep === 'recipient' && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-serif text-white font-medium">Recipient Profile</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Personalize the experience with their name, nickname, and special pet name.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Recipient’s Real Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    placeholder="e.g. Ayesha"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Your Name / Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Anonymous"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Playful Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Trouble, Dimples"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Lovely Name (Used in intimate moments)
                  </label>
                  <input
                    type="text"
                    value={lovelyName}
                    onChange={(e) => setLovelyName(e.target.value)}
                    placeholder="e.g. Sweetheart, Jaan"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                  Optional Photo URL (Subtly used in final reveal)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Photos are never displayed on question cards to keep the experience distraction-free.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Intent / Experience Type */}
          {currentStep === 'type' && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-serif text-white font-medium">Experience Intent</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  What is the nature of the message you want to send?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'romantic',
                    title: 'Romantic Connection',
                    desc: 'Express deep feelings, mutual affection, and growing romance.',
                    icon: '🌹',
                  },
                  {
                    id: 'secret-crush',
                    title: 'Secret Crush Reveal',
                    desc: 'Playfully break the ice and confess mutual chemistry with mystery.',
                    icon: '👀',
                  },
                  {
                    id: 'date-invitation',
                    title: 'Date Invitation',
                    desc: 'A charming interactive lead-up to asking them out for dinner or coffee.',
                    icon: '☕',
                  },
                  {
                    id: 'friendship',
                    title: 'Deep Friendship & Fondness',
                    desc: 'Celebrate shared humor, loyalty, and cherished memories.',
                    icon: '✨',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExperienceType(item.id as ExperienceType)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      experienceType === item.id
                        ? 'bg-rose-500/15 border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{item.icon}</span>
                    <h4 className="text-sm font-medium text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      {experienceType === item.id && <Check className="w-4 h-4 text-rose-400" />}
                    </h4>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Vibe Mode */}
          {currentStep === 'vibe' && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-serif text-white font-medium">Atmosphere & Vibe</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Controls the emotional temperature, teasing copy, and scene transitions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vibeOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVibe(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      vibe === item.id
                        ? 'bg-rose-500/15 border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{item.emoji}</span>
                    <h4 className="text-sm font-medium text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      {vibe === item.id && <Check className="w-4 h-4 text-rose-400" />}
                    </h4>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Theme */}
          {currentStep === 'theme' && (
            <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-serif text-white font-medium">Visual Theme</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Select the aesthetic glassmorphism palette and ambient lighting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`relative rounded-2xl p-4 border text-left overflow-hidden transition-all cursor-pointer ${
                      theme === t.id
                        ? 'border-rose-400 ring-2 ring-rose-500/30'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${t.colors} opacity-60 pointer-events-none`}
                    />
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{t.label}</span>
                        {theme === t.id && <Check className="w-4 h-4 text-rose-400" />}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Questions Sequence & Configuration */}
          {currentStep === 'questions' && (
            <div className="space-y-5 animate-fade-in">
              {/* Question list toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-serif text-white font-medium">
                      Question Sequence ({questions.length} questions)
                    </h3>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                        validationResult.overallScore === 'Strong'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : validationResult.overallScore === 'Good'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      Overall Quality: {validationResult.overallScore}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Click any question to edit options, evasions, rewards, or visual scenes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="py-2 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                    <span>Browse Library</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateCustomQuestion}
                    className="py-2 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-500/30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Custom</span>
                  </button>
                </div>
              </div>

              {/* Emotional Flow Banner */}
              {validationResult.emotionalFlowFeedback && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-2.5 text-xs text-white/70">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{validationResult.emotionalFlowFeedback}</p>
                </div>
              )}

              {/* Validation Warnings / Errors */}
              {validationResult.errors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                  <p className="font-semibold flex items-center gap-1 text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Action Required Before Generating Link:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-200/90 text-[11px]">
                    {validationResult.errors.map((e, idx) => (
                      <li key={idx}>{e.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions Cards List */}
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const sceneData = SCENE_LIBRARY[q.visualScene];
                  const hasBranching =
                    q.afterAnswerBehavior === 'branch' ||
                    !!q.nextQuestionId ||
                    (q.options && q.options.some((o) => o.nextAction === 'branch' || !!o.branchTargetQuestionId));
                  const rewardSummary =
                    q.type === 'yes-no'
                      ? (q.yesReward?.message ? `"${q.yesReward.message}"` : 'Rose / Heart Burst')
                      : q.defaultReward?.message
                      ? `"${q.defaultReward.message}"`
                      : q.options?.find((o) => o.rewardMessage)?.rewardMessage
                      ? `"${q.options.find((o) => o.rewardMessage)?.rewardMessage}"`
                      : 'Atmospheric Scene';

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                        q.enabled === false
                          ? 'bg-white/[0.01] border-white/5 opacity-50'
                          : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {/* Drag Handle & Question Index */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <GripVertical className="w-4 h-4 text-white/20 group-hover:text-white/50 cursor-grab shrink-0" />
                          <span className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/10 text-white font-medium text-xs flex items-center justify-center">
                            Q{idx + 1}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                              {q.category}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/50 border border-white/5 uppercase">
                              {q.type}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/60 border border-white/10">
                              {q.required !== false ? 'Required' : 'Optional'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                q.isPrivate
                                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                  : 'bg-white/[0.02] text-white/40 border-white/5'
                              }`}
                            >
                              {q.isPrivate ? 'Private: ON' : 'Public'}
                            </span>
                          </div>

                          <h4 className="text-sm font-medium text-white truncate group-hover:text-rose-200 transition-colors">
                            {q.text}
                          </h4>

                          {q.subtitle && (
                            <p className="text-xs text-white/40 truncate">{q.subtitle}</p>
                          )}

                          {/* Collapsed Configuration Summary Row (Section 27) */}
                          <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300/90 border border-rose-500/20 truncate max-w-[260px]">
                              Reward: {rewardSummary}
                            </span>
                            {sceneData && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-white/60 border border-white/10">
                                Scene: {sceneData.name}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              Branching: {hasBranching ? 'Configured' : 'Standard'}
                            </span>
                            {q.type === 'yes-no' && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Evasion: {q.noConfig?.dodgingIntensity || 'Playful'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Quick Preview Button */}
                        <button
                          type="button"
                          onClick={() => setQuickPreviewQuestion(q)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-rose-300 text-xs font-medium flex items-center gap-1 border border-white/10 cursor-pointer transition-colors"
                          title="Quick preview question sandbox"
                        >
                          <Eye className="w-3.5 h-3.5 text-rose-400" />
                          <span>Preview</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingQuestion(q)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium flex items-center gap-1 border border-rose-500/20 cursor-pointer transition-colors"
                          title="Edit question configuration"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(q)}
                          title="Duplicate question snapshot"
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          title="Move up"
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 cursor-pointer transition-colors"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === questions.length - 1}
                          title="Move down"
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 cursor-pointer transition-colors"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete question"
                          className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Personal Messages & Link Details */}
          {currentStep === 'messages' && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-serif text-white font-medium">Personal Touch & Link</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Set the opening words, final closing note, and private URL slug.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                  Experience Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A little conversation for Ayesha"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                  Opening Greeting Subtitle
                </label>
                <input
                  type="text"
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  placeholder="Before you go… answer a few little questions for me."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                  Closing Note (Displayed after the final reveal)
                </label>
                <textarea
                  rows={2}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="I hope this made you smile. Dinner next week?"
                  className="w-full py-2 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                  Unique Link Slug
                </label>
                <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2 text-sm text-white/50">
                  <span className="text-white/40 select-none">closer.app/f/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    className="w-full bg-transparent text-rose-300 font-medium focus:outline-none ml-0.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Full Experience Preview */}
          {currentStep === 'preview' && (
            <div className="max-w-xl mx-auto space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="text-left">
                  <h3 className="text-base font-serif text-white">Interactive Experience Simulator</h3>
                  <p className="text-xs text-white/50">
                    Step through the questions as {recipientName || 'Ayesha'} will experience them.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewQuestionIdx((prev) => Math.max(0, prev - 1))}
                    disabled={previewQuestionIdx === 0}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-white/60 px-1 font-medium">
                    {previewQuestionIdx + 1} / {questions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    disabled={previewQuestionIdx === questions.length - 1}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Single Question Sandbox */}
              {questions[previewQuestionIdx] && (
                <div className="h-[460px]">
                  <InteractiveQuestionPreview
                    question={questions[previewQuestionIdx]}
                    theme={theme}
                    recipientName={recipientName || 'Ayesha'}
                    senderName={senderName || 'Anonymous'}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Share Link Ready / Post-Creation (Section 29) */}
          {currentStep === 'share' && (
            <div className="max-w-xl mx-auto py-6 text-center space-y-6 animate-fade-in">
              {createdExperience ? (
                /* Post-Creation Screen (Section 29 Requirements) */
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500/25 via-pink-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/40 animate-pulse">
                    <Heart className="w-10 h-10 fill-rose-500/50" />
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal">
                      Experience created successfully ❤️
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-md mx-auto leading-relaxed">
                      Your personalized connection experience for{' '}
                      <span className="text-rose-300 font-medium">
                        {createdExperience.recipientName}
                      </span>{' '}
                      is live, isolated, and ready to send.
                    </p>
                  </div>

                  {/* Private Link Container */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2.5 shadow-xl">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                      Private Link
                    </p>
                    {(() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://closer.app';
                      const fullUrl = `${origin}/f/${createdExperience.slug}`;
                      return (
                        <>
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm">
                            <span className="text-rose-300 font-mono truncate">
                              {fullUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(fullUrl);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 3000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                            >
                              {copiedLink ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-white/40">
                            Share this private URL with {createdExperience.recipientName}. All responses stream directly to your Creator Studio.
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {/* 4 Action Buttons as explicitly mandated by Section 29 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* 1. Copy Link */}
                    <button
                      type="button"
                      onClick={() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://closer.app';
                        navigator.clipboard.writeText(`${origin}/f/${createdExperience.slug}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }}
                      className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs sm:text-sm font-medium border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Copy className="w-4 h-4 text-rose-400" />
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    {/* 2. Open Experience */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenExperience) {
                          onOpenExperience(createdExperience);
                        } else {
                          window.location.hash = `#/f/${createdExperience.slug}`;
                        }
                      }}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Experience</span>
                    </button>

                    {/* 3. Go to Responses */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToResponses) {
                          onNavigateToResponses();
                        } else {
                          onClose();
                        }
                      }}
                      className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs sm:text-sm font-medium border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Go to Responses</span>
                    </button>

                    {/* 4. Edit Experience */}
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedExperience(null);
                        setCurrentStep('questions');
                      }}
                      className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs sm:text-sm font-medium border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>Edit Experience</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Pre-Creation Confirmation Screen */
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif text-white">Generate Private Connection Link</h3>
                    <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto leading-relaxed">
                      Review and activate your customized experience for {recipientName || 'your recipient'}.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">Recipient:</span>
                      <span className="text-white font-medium">{recipientName || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">Vibe & Theme:</span>
                      <span className="text-rose-300 font-medium">
                        {vibe} &bull; {theme}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">Question Sequence:</span>
                      <span className="text-white font-medium">{questions.length} questions configured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Target URL:</span>
                      <span className="text-rose-300 font-mono">https://closer.app/f/{slug}</span>
                    </div>
                  </div>

                  {/* Validation warnings if any */}
                  {validationResult.errors.length > 0 ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 text-left">
                      <p className="font-medium flex items-center gap-1.5 mb-1 text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Please resolve errors before generating link:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/90">
                        {validationResult.errors.map((e, idx) => (
                          <li key={idx}>{e.message}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('questions')}
                        className="mt-2 text-xs text-rose-300 underline font-medium cursor-pointer"
                      >
                        Return to Questions Editor
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>All questions and scene transitions pass quality validation.</span>
                    </div>
                  )}

                  {/* Create & Generate Link CTA */}
                  <button
                    type="button"
                    onClick={handleSaveAndGenerate}
                    disabled={!validationResult.isValid}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 disabled:pointer-events-none text-white font-medium text-sm shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Create & Generate Link</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div>
            {currentStep !== 'recipient' && !createdExperience && (
              <button
                type="button"
                onClick={() => {
                  const currIdx = STEPS.findIndex((s) => s.id === currentStep);
                  if (currIdx > 0) setCurrentStep(STEPS[currIdx - 1].id);
                }}
                className="py-2 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAttemptClose}
              className="py-2 px-4 rounded-xl text-white/50 hover:text-white text-xs font-medium cursor-pointer"
            >
              {createdExperience ? 'Done' : 'Close'}
            </button>

            {currentStep !== 'share' ? (
              <button
                type="button"
                onClick={() => {
                  const currIdx = STEPS.findIndex((s) => s.id === currentStep);
                  if (currIdx < STEPS.length - 1) setCurrentStep(STEPS[currIdx + 1].id);
                }}
                className="py-2 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-md shadow-rose-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Library Browser Modal */}
      <QuestionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddQuestion={handleAddQuestionFromLibrary}
        existingQuestionTexts={questions.map((q) => q.text)}
      />

      {/* Advanced Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditorModal
          isOpen={true}
          question={editingQuestion}
          allQuestions={questions}
          theme={theme}
          recipientName={recipientName}
          senderName={senderName}
          onClose={() => setEditingQuestion(null)}
          onSave={handleUpdateQuestion}
        />
      )}

      {/* Quick Question Preview Sandbox Modal */}
      {quickPreviewQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-lg bg-[#0e0a1a] border border-white/20 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h4 className="text-sm font-serif text-white font-medium">Quick Question Preview</h4>
                <p className="text-xs text-white/40">
                  Test options, teasing animations, and dodging physics sandbox
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickPreviewQuestion(null)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-[440px]">
              <InteractiveQuestionPreview
                question={quickPreviewQuestion}
                theme={theme}
                recipientName={recipientName || 'Ayesha'}
                senderName={senderName || 'Anonymous'}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const target = quickPreviewQuestion;
                  setQuickPreviewQuestion(null);
                  setEditingQuestion(target);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Configure Question</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-[#0f0a1d] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-serif text-white font-medium">Unsaved Changes</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                You have unsaved changes in this experience. Would you like to save your draft before exiting?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleManualSaveDraft();
                  setShowUnsavedModal(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft & Exit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-medium cursor-pointer"
              >
                Discard & Exit
              </button>

              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="w-full py-2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
