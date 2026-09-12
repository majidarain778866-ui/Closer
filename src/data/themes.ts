import { ExperienceTheme } from '../types';

export interface ThemeConfig {
  id: ExperienceTheme;
  name: string;
  tagline: string;
  mood: string;
  // Background styling
  bgClass: string;
  bgGradient: string;
  vignette: string;
  ambientOrbs: {
    orb1: string;
    orb2: string;
    orbCenter: string;
  };
  // Glass cards
  cardBg: string;
  cardBorder: string;
  cardHighlight: string;
  cardShadow: string;
  // Typography accents
  accentText: string;
  accentGradientText: string;
  secondaryText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  // Buttons
  primaryBtn: string;
  primaryBtnHover: string;
  primaryBtnShadow: string;
  secondaryBtn: string;
  secondaryBtnHover: string;
  // Progress indicators
  progressActive: string;
  progressActiveGlow: string;
  progressInactive: string;
  // Particles & Visuals
  particlePalette: Array<{ r: number; g: number; b: number }>;
  particleType: 'petals' | 'moonbeams' | 'sunwarmth' | 'stardust' | 'goldflair';
  celebrationColors: string[];
}

export const THEMES: Record<ExperienceTheme, ThemeConfig> = {
  'midnight-rose': {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    tagline: 'Velvet crimson, deep romance & moonlit petals',
    mood: 'Intimate, alluring & deeply romantic',
    bgClass: 'bg-[#0A0709]',
    bgGradient: 'from-[#050407] via-[#21070B] to-[#0A0709]',
    vignette: 'rgba(5, 4, 7, 0.85)',
    ambientOrbs: {
      orb1: 'bg-[#8F1020]/25 from-[#D61F3A]/20 to-[#21070B]/10',
      orb2: 'bg-[#3A0B12]/45 from-[#8F1020]/25 to-transparent',
      orbCenter: 'bg-[#FF3657]/12',
    },
    cardBg: 'bg-[#21070B]/75 backdrop-blur-2xl',
    cardBorder: 'border-[rgba(255,70,95,0.18)]',
    cardHighlight: 'via-[#FF6B7F]/40',
    cardShadow: 'shadow-2xl shadow-[#050407]/90',
    accentText: 'text-[#FF3657]',
    accentGradientText: 'from-[#F8F2F3] via-[#FF6B7F] to-[#FF3657]',
    secondaryText: 'text-[#B8AEB1]',
    badgeBg: 'bg-[rgba(255,35,65,0.06)]',
    badgeBorder: 'border-[rgba(255,70,95,0.18)]',
    badgeText: 'text-[#FF6B7F]',
    primaryBtn: 'from-[#8F1020] via-[#D61F3A] to-[#FF3657]',
    primaryBtnHover: 'hover:from-[#D61F3A] hover:via-[#FF3657] hover:to-[#FF6B7F]',
    primaryBtnShadow: 'shadow-[#8F1020]/40 hover:shadow-[#D61F3A]/60',
    secondaryBtn: 'bg-[#21070B]/80 border-[rgba(255,70,95,0.18)] text-[#F8F2F3] hover:bg-[#3A0B12]',
    secondaryBtnHover: 'hover:border-[#FF3657]/40',
    progressActive: 'text-[#FF3657] fill-[#D61F3A]',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(255,24,55,0.45)]',
    progressInactive: 'text-[#726A6E]/30 fill-transparent',
    particlePalette: [
      { r: 255, g: 54, b: 87 },
      { r: 214, g: 31, b: 58 },
      { r: 255, g: 107, b: 127 },
      { r: 143, g: 16, b: 32 },
      { r: 58, g: 11, b: 18 },
    ],
    particleType: 'petals',
    celebrationColors: ['#FF3657', '#D61F3A', '#FF6B7F', '#8F1020', '#F8F2F3', '#21070B'],
  },

  moonlit: {
    id: 'moonlit',
    name: 'Moonlit',
    tagline: 'Quiet midnight indigo, silver starlight & gentle waves',
    mood: 'Serene, ethereal & magnetic',
    bgClass: 'bg-[#050814]',
    bgGradient: 'from-[#050713] via-[#0e162f] to-[#04060f]',
    vignette: 'rgba(4, 7, 18, 0.75)',
    ambientOrbs: {
      orb1: 'bg-blue-600/15 from-indigo-500/20 to-violet-700/10',
      orb2: 'bg-sky-500/10 from-blue-400/15 to-transparent',
      orbCenter: 'bg-indigo-400/6',
    },
    cardBg: 'bg-[#091024]/75',
    cardBorder: 'border-indigo-400/25',
    cardHighlight: 'via-indigo-300/50',
    cardShadow: 'shadow-2xl shadow-indigo-950/60',
    accentText: 'text-indigo-300',
    accentGradientText: 'from-blue-200 via-indigo-200 to-sky-300',
    secondaryText: 'text-indigo-100/70',
    badgeBg: 'bg-indigo-500/15',
    badgeBorder: 'border-indigo-400/30',
    badgeText: 'text-indigo-200',
    primaryBtn: 'from-blue-500 via-indigo-600 to-violet-700',
    primaryBtnHover: 'hover:from-blue-600 hover:via-indigo-700 hover:to-violet-800',
    primaryBtnShadow: 'shadow-indigo-600/35 hover:shadow-indigo-600/50',
    secondaryBtn: 'bg-indigo-950/40 border-indigo-400/20 text-indigo-100 hover:bg-indigo-900/40',
    secondaryBtnHover: 'hover:border-indigo-300/40',
    progressActive: 'text-indigo-300 fill-indigo-400',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(129,140,248,0.6)]',
    progressInactive: 'text-indigo-400/25 fill-transparent',
    particlePalette: [
      { r: 199, g: 210, b: 254 },
      { r: 165, g: 180, b: 252 },
      { r: 224, g: 231, b: 255 },
      { r: 147, g: 197, b: 253 },
      { r: 241, g: 245, b: 249 },
    ],
    particleType: 'moonbeams',
    celebrationColors: ['#818cf8', '#a5b4fc', '#93c5fd', '#c7d2fe', '#e0e7ff', '#ffffff'],
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Warm golden horizon, peach twilight & lingering whispers',
    mood: 'Warm, cozy & breathtakingly romantic',
    bgClass: 'bg-[#0d0710]',
    bgGradient: 'from-[#0e0711] via-[#240e1e] to-[#09050b]',
    vignette: 'rgba(12, 5, 12, 0.72)',
    ambientOrbs: {
      orb1: 'bg-amber-600/20 from-rose-500/25 to-orange-700/10',
      orb2: 'bg-orange-500/15 from-amber-400/15 to-transparent',
      orbCenter: 'bg-rose-500/8',
    },
    cardBg: 'bg-[#1b0d18]/75',
    cardBorder: 'border-amber-500/25',
    cardHighlight: 'via-amber-400/50',
    cardShadow: 'shadow-2xl shadow-rose-950/60',
    accentText: 'text-amber-300',
    accentGradientText: 'from-amber-200 via-rose-200 to-orange-300',
    secondaryText: 'text-amber-100/70',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-300',
    primaryBtn: 'from-amber-500 via-rose-500 to-pink-600',
    primaryBtnHover: 'hover:from-amber-600 hover:via-rose-600 hover:to-pink-700',
    primaryBtnShadow: 'shadow-rose-500/35 hover:shadow-rose-500/50',
    secondaryBtn: 'bg-amber-950/40 border-amber-500/20 text-amber-100 hover:bg-amber-900/40',
    secondaryBtnHover: 'hover:border-amber-400/40',
    progressActive: 'text-amber-400 fill-amber-500',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    progressInactive: 'text-amber-500/25 fill-transparent',
    particlePalette: [
      { r: 251, g: 146, b: 60 },
      { r: 244, g: 63, b: 94 },
      { r: 252, g: 211, b: 77 },
      { r: 253, g: 186, b: 116 },
      { r: 249, g: 115, b: 22 },
    ],
    particleType: 'sunwarmth',
    celebrationColors: ['#fb923c', '#f43f5e', '#fcd34d', '#fbbf24', '#f97316', '#fda4af'],
  },

  dreamy: {
    id: 'dreamy',
    name: 'Dreamy',
    tagline: 'Cosmic nebula, stardust shimmer & timeless wonder',
    mood: 'Playful, enchanted & endlessly curious',
    bgClass: 'bg-[#080516]',
    bgGradient: 'from-[#080516] via-[#1a0e30] to-[#060410]',
    vignette: 'rgba(7, 4, 18, 0.75)',
    ambientOrbs: {
      orb1: 'bg-purple-600/20 from-fuchsia-600/20 to-indigo-800/15',
      orb2: 'bg-pink-600/15 from-purple-500/15 to-transparent',
      orbCenter: 'bg-fuchsia-400/8',
    },
    cardBg: 'bg-[#140b24]/75',
    cardBorder: 'border-purple-400/25',
    cardHighlight: 'via-purple-300/50',
    cardShadow: 'shadow-2xl shadow-purple-950/60',
    accentText: 'text-fuchsia-300',
    accentGradientText: 'from-pink-200 via-fuchsia-200 to-purple-300',
    secondaryText: 'text-purple-100/70',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-400/30',
    badgeText: 'text-purple-200',
    primaryBtn: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    primaryBtnHover: 'hover:from-fuchsia-600 hover:via-purple-700 hover:to-indigo-800',
    primaryBtnShadow: 'shadow-purple-600/35 hover:shadow-purple-600/50',
    secondaryBtn: 'bg-purple-950/40 border-purple-400/20 text-purple-100 hover:bg-purple-900/40',
    secondaryBtnHover: 'hover:border-purple-300/40',
    progressActive: 'text-fuchsia-400 fill-fuchsia-500',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(217,70,239,0.6)]',
    progressInactive: 'text-purple-400/25 fill-transparent',
    particlePalette: [
      { r: 217, g: 70, b: 239 },
      { r: 168, g: 85, b: 247 },
      { r: 244, g: 114, b: 182 },
      { r: 255, g: 255, b: 255 },
      { r: 192, g: 132, b: 252 },
    ],
    particleType: 'stardust',
    celebrationColors: ['#d946ef', '#a855f7', '#f472b6', '#c084fc', '#e879f9', '#ffffff'],
  },

  'dark-luxury': {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    tagline: 'Onyx obsidian, champagne gold & prestigious elegance',
    mood: 'Sophisticated, mysterious & deeply captivating',
    bgClass: 'bg-[#080808]',
    bgGradient: 'from-[#080808] via-[#151410] to-[#050505]',
    vignette: 'rgba(6, 6, 6, 0.82)',
    ambientOrbs: {
      orb1: 'bg-amber-600/12 from-yellow-700/15 to-orange-900/8',
      orb2: 'bg-stone-700/10 from-amber-600/10 to-transparent',
      orbCenter: 'bg-amber-500/5',
    },
    cardBg: 'bg-[#12110e]/85',
    cardBorder: 'border-[#9E834D]/35',
    cardHighlight: 'via-[#c5a869]/60',
    cardShadow: 'shadow-2xl shadow-black/80',
    accentText: 'text-[#d4af37]',
    accentGradientText: 'from-[#f5e6be] via-[#d4af37] to-[#9E834D]',
    secondaryText: 'text-stone-300/70',
    badgeBg: 'bg-[#9E834D]/15',
    badgeBorder: 'border-[#9E834D]/35',
    badgeText: 'text-[#f0d898]',
    primaryBtn: 'from-[#9E834D] via-[#bfa05d] to-[#8a703d]',
    primaryBtnHover: 'hover:from-[#bfa05d] hover:via-[#d4af37] hover:to-[#9E834D]',
    primaryBtnShadow: 'shadow-[#9E834D]/30 hover:shadow-[#9E834D]/45',
    secondaryBtn: 'bg-stone-900/60 border-[#9E834D]/25 text-[#f5e6be] hover:bg-stone-800/60',
    secondaryBtnHover: 'hover:border-[#c5a869]/45',
    progressActive: 'text-[#d4af37] fill-[#d4af37]',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(212,175,55,0.6)]',
    progressInactive: 'text-[#9E834D]/25 fill-transparent',
    particlePalette: [
      { r: 212, g: 175, b: 55 },
      { r: 197, g: 168, b: 105 },
      { r: 245, g: 230, b: 190 },
      { r: 158, g: 131, b: 77 },
      { r: 254, g: 240, b: 138 },
    ],
    particleType: 'goldflair',
    celebrationColors: ['#d4af37', '#c5a869', '#f5e6be', '#9E834D', '#fef08a', '#e2d3ab'],
  },

  // Fallbacks for legacy themes:
  'velvet-violet': {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    tagline: 'Velvet crimson & moonlit petals',
    mood: 'Intimate & deeply romantic',
    bgClass: 'bg-[#0A0709]',
    bgGradient: 'from-[#050407] via-[#21070B] to-[#0A0709]',
    vignette: 'rgba(5, 4, 7, 0.85)',
    ambientOrbs: {
      orb1: 'bg-[#8F1020]/25 from-[#D61F3A]/20 to-[#21070B]/10',
      orb2: 'bg-[#3A0B12]/45 from-[#8F1020]/25 to-transparent',
      orbCenter: 'bg-[#FF3657]/12',
    },
    cardBg: 'bg-[#21070B]/75 backdrop-blur-2xl',
    cardBorder: 'border-[rgba(255,70,95,0.18)]',
    cardHighlight: 'via-[#FF6B7F]/40',
    cardShadow: 'shadow-2xl shadow-[#050407]/90',
    accentText: 'text-[#FF3657]',
    accentGradientText: 'from-[#F8F2F3] via-[#FF6B7F] to-[#FF3657]',
    secondaryText: 'text-[#B8AEB1]',
    badgeBg: 'bg-[rgba(255,35,65,0.06)]',
    badgeBorder: 'border-[rgba(255,70,95,0.18)]',
    badgeText: 'text-[#FF6B7F]',
    primaryBtn: 'from-[#8F1020] via-[#D61F3A] to-[#FF3657]',
    primaryBtnHover: 'hover:from-[#D61F3A] hover:via-[#FF3657] hover:to-[#FF6B7F]',
    primaryBtnShadow: 'shadow-[#8F1020]/40',
    secondaryBtn: 'bg-[#21070B]/80 border-[rgba(255,70,95,0.18)] text-[#F8F2F3] hover:bg-[#3A0B12]',
    secondaryBtnHover: 'hover:border-[#FF3657]/40',
    progressActive: 'text-[#FF3657] fill-[#D61F3A]',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(255,24,55,0.45)]',
    progressInactive: 'text-[#726A6E]/30 fill-transparent',
    particlePalette: [
      { r: 255, g: 54, b: 87 },
      { r: 214, g: 31, b: 58 },
      { r: 255, g: 107, b: 127 },
      { r: 143, g: 16, b: 32 },
      { r: 58, g: 11, b: 18 },
    ],
    particleType: 'petals',
    celebrationColors: ['#FF3657', '#D61F3A', '#FF6B7F', '#8F1020', '#F8F2F3', '#21070B'],
  },
  'golden-twilight': {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Warm golden horizon',
    mood: 'Warm & romantic',
    bgClass: 'bg-[#0d0710]',
    bgGradient: 'from-[#0e0711] via-[#240e1e] to-[#09050b]',
    vignette: 'rgba(12, 5, 12, 0.72)',
    ambientOrbs: {
      orb1: 'bg-amber-600/20 from-rose-500/25 to-orange-700/10',
      orb2: 'bg-orange-500/15 from-amber-400/15 to-transparent',
      orbCenter: 'bg-rose-500/8',
    },
    cardBg: 'bg-[#1b0d18]/75',
    cardBorder: 'border-amber-500/25',
    cardHighlight: 'via-amber-400/50',
    cardShadow: 'shadow-2xl shadow-rose-950/60',
    accentText: 'text-amber-300',
    accentGradientText: 'from-amber-200 via-rose-200 to-orange-300',
    secondaryText: 'text-amber-100/70',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-300',
    primaryBtn: 'from-amber-500 via-rose-500 to-pink-600',
    primaryBtnHover: 'hover:from-amber-600 hover:via-rose-600 hover:to-pink-700',
    primaryBtnShadow: 'shadow-rose-500/35',
    secondaryBtn: 'bg-amber-950/40 border-amber-500/20 text-amber-100 hover:bg-amber-900/40',
    secondaryBtnHover: 'hover:border-amber-400/40',
    progressActive: 'text-amber-400 fill-amber-500',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    progressInactive: 'text-amber-500/25 fill-transparent',
    particlePalette: [{ r: 251, g: 146, b: 60 }, { r: 244, g: 63, b: 94 }],
    particleType: 'sunwarmth',
    celebrationColors: ['#fb923c', '#f43f5e', '#fcd34d'],
  },
  'obsidian-star': {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    tagline: 'Onyx obsidian & champagne gold',
    mood: 'Prestige & elegance',
    bgClass: 'bg-[#080808]',
    bgGradient: 'from-[#080808] via-[#151410] to-[#050505]',
    vignette: 'rgba(6, 6, 6, 0.82)',
    ambientOrbs: {
      orb1: 'bg-amber-600/12 from-yellow-700/15 to-orange-900/8',
      orb2: 'bg-stone-700/10 from-amber-600/10 to-transparent',
      orbCenter: 'bg-amber-500/5',
    },
    cardBg: 'bg-[#12110e]/85',
    cardBorder: 'border-[#9E834D]/35',
    cardHighlight: 'via-[#c5a869]/60',
    cardShadow: 'shadow-2xl shadow-black/80',
    accentText: 'text-[#d4af37]',
    accentGradientText: 'from-[#f5e6be] via-[#d4af37] to-[#9E834D]',
    secondaryText: 'text-stone-300/70',
    badgeBg: 'bg-[#9E834D]/15',
    badgeBorder: 'border-[#9E834D]/35',
    badgeText: 'text-[#f0d898]',
    primaryBtn: 'from-[#9E834D] via-[#bfa05d] to-[#8a703d]',
    primaryBtnHover: 'hover:from-[#bfa05d] hover:via-[#d4af37] hover:to-[#9E834D]',
    primaryBtnShadow: 'shadow-[#9E834D]/30',
    secondaryBtn: 'bg-stone-900/60 border-[#9E834D]/25 text-[#f5e6be] hover:bg-stone-800/60',
    secondaryBtnHover: 'hover:border-[#c5a869]/45',
    progressActive: 'text-[#d4af37] fill-[#d4af37]',
    progressActiveGlow: 'shadow-[0_0_12px_rgba(212,175,55,0.6)]',
    progressInactive: 'text-[#9E834D]/25 fill-transparent',
    particlePalette: [{ r: 212, g: 175, b: 55 }, { r: 197, g: 168, b: 105 }],
    particleType: 'goldflair',
    celebrationColors: ['#d4af37', '#c5a869', '#f5e6be'],
  },
};

export const DEFAULT_THEME: ExperienceTheme = 'midnight-rose';

export function getThemeConfig(themeName?: string): ThemeConfig {
  if (themeName && themeName in THEMES) {
    return THEMES[themeName as ExperienceTheme];
  }
  return THEMES['midnight-rose'];
}
