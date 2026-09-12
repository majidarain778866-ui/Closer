export type QuestionType =
  | 'single-choice'
  | 'yes-no'
  | 'multiple-choice'
  | 'text-input'
  | 'location';

export type QuestionCategory =
  | 'cute'
  | 'fun'
  | 'food'
  | 'personal'
  | 'attraction'
  | 'playful'
  | 'flirty'
  | 'teasing'
  | 'spicy'
  | 'deep'
  | 'romantic'
  | 'final';

export type VisualScene =
  | 'sunset'
  | 'food'
  | 'golden-lights'
  | 'city-night'
  | 'rose-petals'
  | 'moonlight'
  | 'dreamy-stars'
  | 'cinematic-finale'
  | 'candlelit-cafe'
  | 'ocean-dusk';

export type LayoutMode = 'center-cinematic' | 'split-cinematic' | 'floating-glass';

export interface ScenicFocalFocus {
  tag: string;
  title: string;
  caption: string;
  quote?: string;
}

export interface SceneConfig {
  sceneId: VisualScene;
  name: string;
  description: string;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  overlay: string;
  vignette: string;
  accent: string;
  blurAmount?: string;
  parallaxIntensity: number;
  particlePreset: 'bokeh' | 'petals' | 'stars' | 'fireflies' | 'champagne';
  transitionStyle: 'crossfade' | 'blur-zoom' | 'soft-curtain';
  layoutMode: LayoutMode;
  theme: ExperienceTheme;
  questionCategory: QuestionCategory;
  desktopPanelPosition?: 'left' | 'right' | 'center';
  scenicFocalFocus?: ScenicFocalFocus;
}

export interface AnswerReward {
  message: string;
  visual: string;
  animationType?: 'pop' | 'glow' | 'heart-burst' | 'float';
  duration?: number;
  transition?: 'dissolve' | 'fade-zoom';
}

export type AfterAnswerBehavior =
  | 'continue'
  | 'reward-continue'
  | 'special-scene'
  | 'branch'
  | 'end';

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
  subtitle?: string;
  rewardMessage?: string;
  rewardVisual?: string;
  rewardScene?: VisualScene;
  animation?: 'pop' | 'glow' | 'heart-burst' | 'float';
  duration?: number;
  transition?: 'dissolve' | 'fade-zoom' | 'crossfade';
  nextAction?: AfterAnswerBehavior;
  branchTargetQuestionId?: string;
  personalityEffect?: string;
  memoryKey?: string;
  tags?: string[];
}

export interface YesConfig {
  label: string;
  reactionMessage: string;
  visualScene?: VisualScene;
  animation?: 'pop' | 'glow' | 'heart-burst' | 'float';
  nextAction?: AfterAnswerBehavior;
}

export interface NoConfig {
  label?: string;
  dodgingEnabled: boolean;
  dodgingIntensity: 'gentle' | 'playful' | 'very-playful';
  mobileShake: boolean;
  morphToYes: boolean;
  morphMessage: string;
  teaseResponses: string[];
  maxEvasions?: number;
}

export interface AdaptiveQuestionVariant {
  conditionTag?: string;
  conditionAnswerKey?: string;
  conditionValue?: string;
  conditionVibe?: VibeMode;
  text?: string;
  subtitle?: string;
  visualScene?: VisualScene;
  rewardMessage?: string;
}

export interface Question {
  id: string;
  sourceTemplateId?: string;
  questionInstanceId?: string;
  text: string;
  subtitle?: string;
  category: QuestionCategory;
  type: QuestionType;
  options?: QuestionOption[];
  visualScene: VisualScene;
  required?: boolean;
  enabled?: boolean;
  placeholder?: string;
  teaseResponses?: string[];
  yesLabel?: string;
  noLabel?: string;
  yesConfig?: YesConfig;
  noConfig?: NoConfig;
  yesReward?: AnswerReward;
  defaultReward?: AnswerReward;
  phase?: number;
  emotionalStage?: number;
  isPrivate?: boolean;
  afterAnswerBehavior?: AfterAnswerBehavior;
  branchTargetQuestionId?: string;
  qualityScore?: 'Strong' | 'Good' | 'Needs refinement';
  qualityFeedback?: string;
  memoryKey?: string;
  adaptiveKey?: string;
  adaptiveVariants?: AdaptiveQuestionVariant[];
  allowCustomTime?: boolean;
}

export type ExperienceType = 'romantic' | 'friendship' | 'secret-crush' | 'date-invitation';

export type ExperienceTheme =
  | 'midnight-rose'
  | 'moonlit'
  | 'sunset'
  | 'dreamy'
  | 'dark-luxury'
  | 'velvet-violet'
  | 'golden-twilight'
  | 'obsidian-star';

export type VibeMode = 'Sweet' | 'Flirty' | 'Romantic' | 'Midnight';
export type ExperienceVibe = VibeMode;

export interface DynamicExperienceConfig {
  enableDynamicCopy?: boolean;
  enableAnswerMemory?: boolean;
  enableAdaptiveQuestions?: boolean;
  enablePersonalitySnapshot?: boolean;
  enablePrivateQuestion?: boolean;
  enableFreeTextQuestion?: boolean;
  deepQuestionId?: string;
  requireMatureConsent?: boolean;
}

export interface PersonalityTrait {
  label: string;
  icon: string;
  note: string;
}

export interface PersonalitySnapshot {
  title: string;
  traits: PersonalityTrait[];
  romanticSummary: string;
  dominantTags: string[];
  vibeMode?: VibeMode;
}

export interface SessionProfile {
  name: string;
  nickname?: string;
  lovelyName?: string;
  theme: ExperienceTheme;
  vibe: VibeMode;
  favoriteFood?: string;
  favoritePlace?: string;
  eveningPreference?: string;
  attractionPreference?: string;
  connectionPreference?: string;
  romanticInterest?: string;
  flirtyComfort?: string;
  secretAnswer?: string;
  customMessage?: string;
  collectedTags: string[];
}

export interface RecipientProfile {
  name: string;
  nickname: string;
  lovelyName: string;
  photoUrl?: string;
  selectedTheme: ExperienceTheme;
}

export interface Experience {
  id: string;
  slug: string;
  ownerId: string;
  senderName: string;
  recipientName: string;
  title: string;
  customGreeting?: string;
  personalNote?: string;
  theme: ExperienceTheme;
  vibe?: VibeMode;
  experienceType?: ExperienceType;
  dynamicConfig?: DynamicExperienceConfig;
  questions: Question[];
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  viewCount: number;
}

export interface ResponseAnswer {
  questionId: string;
  questionText: string;
  category: QuestionCategory;
  value: string | string[];
  selectedOptions?: string[];
  evasionCount?: number;
  rewardMessage?: string;
  answeredAt: string;
}

export interface LocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  granted: boolean;
  formatted?: string;
}

export interface ExperienceResponse {
  id: string;
  experienceId: string;
  ownerId?: string;
  sessionId: string;
  recipientName: string;
  recipientProfile?: RecipientProfile;
  theme?: ExperienceTheme;
  vibe?: VibeMode;
  answers: Record<string, ResponseAnswer>;
  privateAnswers?: Record<string, ResponseAnswer>;
  personalitySnapshot?: PersonalitySnapshot;
  location?: LocationData;
  photoUrl?: string;
  startedAt: string;
  completedAt: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  notified?: boolean;
  sheetsExported?: boolean;
  completionState?: 'in-progress' | 'completed';
}

export interface SenderUser {
  userId: string;
  email: string;
  name: string;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  recipientName: string;
  experienceTitle: string;
  answersSummary: Array<{
    question: string;
    answer: string;
  }>;
  completedAt: string;
  location?: string;
  responseId: string;
  theme?: string;
  nickname?: string;
}
