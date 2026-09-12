import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ExperienceTheme, RecipientProfile } from '../types';
import { getThemeConfig } from '../data/themes';

interface PersonalGreetingProps {
  recipientName: string;
  recipientProfile?: RecipientProfile;
  theme?: ExperienceTheme;
  senderName?: string;
  customGreeting?: string;
  onBegin: () => void;
}

export const PersonalGreeting: React.FC<PersonalGreetingProps> = ({
  recipientName,
  recipientProfile,
  theme = 'midnight-rose',
  senderName,
  customGreeting,
  onBegin,
}) => {
  const themeConfig = getThemeConfig(theme);
  const displayName = recipientProfile?.nickname || recipientProfile?.name || recipientName;
  const lovelyHint = recipientProfile?.lovelyName ? ` (${recipientProfile.lovelyName})` : '';

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

      {/* Recipient tag */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-5 ${themeConfig.badgeBg} ${themeConfig.badgeBorder} ${themeConfig.badgeText}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Sirf tumhare liye banaya gaya hai{lovelyHint}</span>
      </div>

      {/* Main personalized title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F8F2F3] font-normal tracking-tight leading-tight mb-4">
        Suno {displayName} <span className="text-[#FF3657] inline-block">❤️</span>
      </h2>

      {/* Custom greeting or default copy */}
      <p className="text-base sm:text-lg text-[#B8AEB1] font-light max-w-md mb-8 leading-relaxed">
        {customGreeting || 'Duniya se do minute door… bas dil se jawab dena.'}
      </p>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onBegin}
        className={`group relative w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-2xl bg-gradient-to-r ${themeConfig.primaryBtn} ${themeConfig.primaryBtnHover} text-white font-semibold text-base sm:text-lg shadow-xl ${themeConfig.primaryBtnShadow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/20 flex items-center justify-center gap-2.5 cursor-pointer`}
      >
        <span>Shuru Karte Hain ❤️</span>
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </button>

      {senderName && (
        <p className="mt-8 text-xs text-[#726A6E] tracking-wider">
          Sent with care by {senderName}
        </p>
      )}
    </div>
  );
};
