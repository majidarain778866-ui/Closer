import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { ExperienceTheme } from '../types';
import { getThemeConfig } from '../data/themes';

interface WelcomeScreenProps {
  onStart: () => void;
  senderName?: string;
  theme?: ExperienceTheme;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  senderName,
  theme = 'midnight-rose',
}) => {
  const themeConfig = getThemeConfig(theme);

  return (
    <div
      className={`w-full max-w-lg mx-auto p-8 sm:p-10 md:p-12 rounded-3xl backdrop-blur-xl border relative overflow-hidden text-center flex flex-col items-center transition-all duration-500 cinematic-theme-transition transform-gpu ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.cardShadow}`}
    >
      {/* Top subtle glow line with cinematic light sweep */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden pointer-events-none"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent cinematic-light-sweep" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />

      {/* Floating gentle icon badge */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${themeConfig.primaryBtn} border border-white/20 flex items-center justify-center mb-6 shadow-xl animate-soft-float`}
      >
        <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white/40" />
      </div>

      {/* Little intro tag */}
      <div
        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium border mb-4 ${themeConfig.badgeBg} ${themeConfig.badgeBorder} ${themeConfig.badgeText}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ek pyari si private mulakat ❤️</span>
      </div>

      {/* Main heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F8F2F3] font-normal tracking-tight leading-tight mb-3">
        Suno na… 👀
      </h1>

      {/* Supporting text */}
      <p className="text-base sm:text-lg text-[#B8AEB1] font-light max-w-sm mb-8 leading-relaxed">
        {senderName ? `${senderName} ne tumhare liye kuch dil ki baatein aur chote sawal chhore hain.` : 'Kisi ne tumhare liye kuch dil ki baatein aur chote sawal chhore hain.'}
      </p>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={onStart}
        className={`group relative w-full sm:w-auto min-w-[220px] py-4 px-8 rounded-2xl bg-gradient-to-r ${themeConfig.primaryBtn} ${themeConfig.primaryBtnHover} text-white font-semibold text-base sm:text-lg shadow-xl ${themeConfig.primaryBtnShadow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/20 flex items-center justify-center gap-3 cursor-pointer`}
      >
        <span>Aage Barhein ❤️</span>
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Privacy Notice */}
      <p className="mt-8 text-[11px] sm:text-xs text-[#726A6E] max-w-xs leading-relaxed">
        Bas 60–90 seconds. Tumhare answers usi person ke saath share honge jis ne ye link bheja hai.
      </p>
    </div>
  );
};
