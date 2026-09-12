import React, { useEffect, useState } from 'react';
import { AnswerReward, ExperienceTheme, RecipientProfile } from '../types';
import { getThemeConfig } from '../data/themes';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnswerRewardOverlayProps {
  reward: AnswerReward;
  theme?: ExperienceTheme;
  recipientProfile?: RecipientProfile;
  onComplete: () => void;
}

export const AnswerRewardOverlay: React.FC<AnswerRewardOverlayProps> = ({
  reward,
  theme = 'midnight-rose',
  recipientProfile,
  onComplete,
}) => {
  // Snappy reaction duration - fast by default (max 1100ms)
  const duration = Math.min(reward.duration || 1100, 1100);
  const [progress, setProgress] = useState(0);
  const themeConfig = getThemeConfig(theme);

  // Substitute {name}, {nickname}, {lovelyName}
  const formatMessage = (msg: string) => {
    let result = msg;
    if (recipientProfile) {
      result = result
        .replace(/\{name\}/g, recipientProfile.name)
        .replace(/\{nickname\}/g, recipientProfile.nickname || recipientProfile.name)
        .replace(/\{lovelyName\}/g, recipientProfile.lovelyName || recipientProfile.name);
    }
    return result;
  };

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const animationClass =
    reward.animationType === 'heart-burst'
      ? 'animate-bounce'
      : reward.animationType === 'glow'
      ? 'animate-pulse'
      : 'animate-scale-in';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onComplete}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer select-none active:scale-[0.99] transition-transform"
    >
      <div
        onClick={onComplete}
        className={`relative w-full max-w-md rounded-3xl p-7 sm:p-9 border text-center transition-all duration-200 hover:border-white/30 cursor-pointer ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.cardShadow} animate-scale-in`}
      >
        {/* Radial ambient glow behind orb */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#D61F3A]/25 blur-3xl pointer-events-none"
        />

        {/* Illuminated Glass Orb */}
        <div className="relative mx-auto mb-5 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-white/[0.08] border border-[rgba(255,70,95,0.25)] shadow-xl shadow-[#D61F3A]/20 backdrop-blur-lg">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          <span className={`text-4xl sm:text-5xl ${animationClass}`}>
            {reward.visual || '✨'}
          </span>
        </div>

        {/* Tease badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${themeConfig.badgeBg} ${themeConfig.badgeBorder} ${themeConfig.badgeText} border mb-3`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vibe check passed</span>
        </div>

        {/* Personalized Message */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-white font-normal leading-relaxed mb-6">
          {formatMessage(reward.message)}
        </h3>

        {/* Countdown Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className={`h-full bg-gradient-to-r ${themeConfig.primaryBtn} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 px-3 py-1.5 rounded-full"
        >
          <span>Tap to continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
