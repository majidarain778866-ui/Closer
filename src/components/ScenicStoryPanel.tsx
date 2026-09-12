import React from 'react';
import { SceneConfig, ExperienceTheme, RecipientProfile } from '../types';
import { Sparkles, Heart, Compass } from 'lucide-react';
import { getThemeConfig } from '../data/themes';

interface ScenicStoryPanelProps {
  sceneConfig: SceneConfig;
  theme: ExperienceTheme;
  recipientProfile?: RecipientProfile;
  recipientName: string;
  questionNumber: number;
  totalQuestions: number;
}

export const ScenicStoryPanel: React.FC<ScenicStoryPanelProps> = ({
  sceneConfig,
  theme,
  recipientProfile,
  recipientName,
  questionNumber,
  totalQuestions,
}) => {
  const themeConfig = getThemeConfig(theme);
  const lovely = recipientProfile?.lovelyName || recipientProfile?.nickname || recipientName;
  const focal = sceneConfig.scenicFocalFocus;

  return (
    <div className="hidden lg:flex flex-col justify-center h-full max-w-lg pr-4 animate-fade-in select-none">
      {/* Visual Scene Badge */}
      <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md mb-6 shadow-sm">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: sceneConfig.accent }}
        />
        <span className="text-[11px] font-medium tracking-widest uppercase text-white/75">
          {focal?.tag || sceneConfig.name}
        </span>
      </div>

      {/* Narrative Headline */}
      <h3 className="text-3xl xl:text-4xl font-serif text-[#F8F2F3] font-normal leading-tight tracking-tight mb-4">
        {focal?.title || sceneConfig.description}
      </h3>

      {/* Atmospheric Caption */}
      <p className="text-base text-[#B8AEB1] font-light leading-relaxed mb-8">
        {focal?.caption || 'Take a breath, listen to the mood, and answer honestly.'}
      </p>

      {/* Intimate Storytelling Quote */}
      {focal?.quote && (
        <div className="relative p-5 rounded-2xl bg-[rgba(255,35,65,0.06)] border border-[rgba(255,70,95,0.18)] backdrop-blur-xl mb-8">
          <div
            aria-hidden="true"
            className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <p className="text-sm font-serif italic text-[#FF6B7F] leading-relaxed">
            {focal.quote}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#726A6E]">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-[#726A6E]" />
              <span>Cinematic Atmosphere</span>
            </span>
            <span className="capitalize">{sceneConfig.name}</span>
          </div>
        </div>
      )}

      {/* Personalization Touchpoint */}
      <div className="flex items-center gap-3 text-xs text-[#B8AEB1] font-light">
        <div className="w-7 h-7 rounded-full bg-[rgba(255,35,65,0.1)] border border-[rgba(255,70,95,0.25)] flex items-center justify-center text-[#FF3657] shrink-0">
          <Heart className="w-3.5 h-3.5 fill-current/30" />
        </div>
        <div>
          <p className="text-[#F8F2F3] font-medium">Curated especially for {lovely}</p>
          <p className="text-[11px] text-[#726A6E]">
            Chapter {questionNumber} of {totalQuestions} &bull; {sceneConfig.name}
          </p>
        </div>
      </div>
    </div>
  );
};
