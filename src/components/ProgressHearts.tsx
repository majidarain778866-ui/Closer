import React from 'react';
import { ExperienceTheme } from '../types';
import { getThemeConfig } from '../data/themes';

interface ProgressHeartsProps {
  currentStep: number;
  totalSteps: number;
  theme?: ExperienceTheme;
  compact?: boolean;
}

export const ProgressHearts: React.FC<ProgressHeartsProps> = ({
  currentStep,
  totalSteps,
  theme = 'midnight-rose',
  compact = false,
}) => {
  const themeConfig = getThemeConfig(theme);

  const getHeartIcon = (isFilled: boolean) => {
    if (!isFilled) return '♡';
    switch (theme) {
      case 'dark-luxury':
        return '💛';
      case 'moonlit':
        return '💙';
      case 'sunset':
        return '🧡';
      case 'dreamy':
        return '💜';
      case 'midnight-rose':
      default:
        return '❤️';
    }
  };

  return (
    <div
      role="progressbar"
      aria-label={`Progress: ${currentStep} of ${totalSteps}`}
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      className={`inline-flex items-center justify-center ${
        compact
          ? 'gap-1 py-1 px-2.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm'
          : 'gap-1.5 sm:gap-2 py-1.5 px-3.5 sm:px-4 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md mx-auto max-w-fit shadow-md'
      } select-none ${themeConfig.cardBorder}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isFilled = index < currentStep;
        const isCurrent = index === currentStep - 1;

        return (
          <span
            key={index}
            aria-hidden="true"
            className={`inline-flex items-center justify-center ${
              compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
            } transition-all duration-300 ${
              isFilled
                ? `${themeConfig.accentText} opacity-100`
                : 'text-[#726A6E]/60 opacity-40'
            } ${isCurrent ? 'scale-125 animate-pulse' : 'scale-100'}`}
            style={
              isFilled
                ? { filter: 'drop-shadow(0 0 6px rgba(255, 24, 55, 0.45))' }
                : undefined
            }
          >
            {getHeartIcon(isFilled)}
          </span>
        );
      })}
    </div>
  );
};
