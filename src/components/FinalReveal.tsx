import React, { useEffect } from 'react';
import { RotateCcw, Heart, Sparkles, CheckCircle2, MessageSquare, Palette, User, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExperienceResponse, ResponseAnswer, ExperienceTheme, RecipientProfile } from '../types';
import { getThemeConfig } from '../data/themes';

interface FinalRevealProps {
  recipientName: string;
  recipientProfile?: RecipientProfile;
  theme?: ExperienceTheme;
  senderName?: string;
  personalNote?: string;
  response: ExperienceResponse;
  onReplay: () => void;
}

export const FinalReveal: React.FC<FinalRevealProps> = ({
  recipientName,
  recipientProfile,
  theme = 'midnight-rose',
  senderName,
  personalNote,
  response,
  onReplay,
}) => {
  const themeConfig = getThemeConfig(theme);

  // Trigger celebratory confetti with theme-specific colors
  useEffect(() => {
    try {
      const colors = themeConfig.celebrationColors || ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#e11d48'];
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.55 },
        colors,
        disableForReducedMotion: true,
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 600);

      return () => clearTimeout(timer);
    } catch {
      // Fallback gracefully
    }
  }, [themeConfig]);

  const answerEntries: ResponseAnswer[] = Object.values(response.answers) as ResponseAnswer[];
  const photo = recipientProfile?.photoUrl || response.photoUrl;

  const displayName = recipientProfile?.name || recipientName;
  const displayNickname = recipientProfile?.nickname || displayName;
  const displayLovely = recipientProfile?.lovelyName || 'Sweetheart';

  // Extract key choices for the summary cards
  const foodAns =
    response.answers['q8-food']?.value ||
    response.answers['q2-food']?.value;
  const placeAns =
    response.answers['q6-meeting-place']?.value ||
    response.answers['q6-place']?.value;
  const timeAns =
    response.answers['q7-meeting-time']?.value ||
    response.answers['q7-time']?.value;
  const interestAns =
    response.answers['q4-personal-interest']?.value ||
    response.answers['q4-attention']?.value;

  return (
    <div
      className={`w-full max-w-xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl backdrop-blur-2xl border text-center flex flex-col items-center relative overflow-hidden transition-all duration-500 cinematic-theme-transition transform-gpu ${themeConfig.cardBg} ${themeConfig.cardBorder} ${themeConfig.cardShadow}`}
    >
      {/* Top glowing ambient beam with cinematic light sweep */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none"
      >
        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#FF6B7F] to-transparent cinematic-light-sweep" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#FF3657]/50 to-transparent shadow-lg"
      />

      {/* RECIPIENT PHOTO (Circular Glass Frame if supplied) or Pulsing Heart Emblem */}
      {photo ? (
        <div className="relative mb-6 group animate-fade-in">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#8F1020] via-[#D61F3A] to-[#FF6B7F] shadow-2xl shadow-[#D61F3A]/40">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#21070B] bg-[#050407]">
              <img
                src={photo}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#D61F3A] text-white border-2 border-[#21070B] shadow-md animate-pulse">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mb-6">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${themeConfig.primaryBtn} border border-[rgba(255,70,95,0.25)] flex items-center justify-center shadow-2xl animate-pulse`}
          >
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white/50" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/90 border-2 border-[#050407] flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Theme & Status Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium ${themeConfig.badgeBg} ${themeConfig.badgeBorder} ${themeConfig.badgeText} border shadow-sm`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hamara safar mukammal hua ❤️</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-[rgba(255,70,95,0.18)] text-[#B8AEB1]">
          <Palette className="w-3.5 h-3.5 text-[#FF6B7F]" />
          <span>{themeConfig.name}</span>
        </div>
      </div>

      {/* Primary Recipient Heading utilizing Name and Lovely Name */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F8F2F3] font-normal tracking-tight leading-tight mb-2">
        Tum yahan tak pohanch gayi, {displayLovely || displayName} <span className="text-[#FF3657] inline-block">🌹</span>
      </h1>

      <p className="text-sm sm:text-base text-[#B8AEB1] font-light max-w-md mb-4 leading-relaxed">
        {displayLovely !== displayNickname ? `${displayLovely} — ` : ''}har ek jawab bohot pyara aur dil ke kareeb tha.
      </p>

      {/* SUMMARY OF CHOICES: "Tumhari choice ❤️" */}
      <div className="w-full my-3 p-5 rounded-2xl bg-[#21070B]/60 border border-[rgba(255,70,95,0.22)] text-left relative backdrop-blur-md overflow-hidden animate-fade-in shadow-xl">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-36 h-36 bg-[#FF3657]/10 rounded-full blur-2xl pointer-events-none"
        />
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#8F1020]/40 border border-[rgba(255,70,95,0.3)] text-[#FF6B7F] shadow-sm">
            <Heart className="w-3.5 h-3.5 text-[#FF3657] fill-[#FF3657]" />
            <span>Tumhari choice ❤️</span>
          </div>
        </div>

        {/* Highlighted Choice Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {foodAns && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-[rgba(255,70,95,0.15)] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#B8AEB1]/70 block mb-1">Khana</span>
              <span className="text-sm font-medium text-[#F8F2F3]">{String(foodAns)}</span>
            </div>
          )}
          {placeAns && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-[rgba(255,70,95,0.15)] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#B8AEB1]/70 block mb-1">Jagah</span>
              <span className="text-sm font-medium text-[#F8F2F3]">{String(placeAns)}</span>
            </div>
          )}
          {timeAns && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-[rgba(255,70,95,0.15)] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#B8AEB1]/70 block mb-1">Waqt</span>
              <span className="text-sm font-medium text-[#F8F2F3]">{String(timeAns)}</span>
            </div>
          )}
        </div>

        {/* Romantic Highlight Closing sentence */}
        <div className="pt-3 border-t border-[rgba(255,70,95,0.15)] text-center">
          <p className="text-base sm:text-lg text-[#F8F2F3] font-serif italic leading-relaxed">
            “Baaki baat… shayad mil kar karte hain. 😉❤️”
          </p>
        </div>
      </div>

      {/* Clear closing message */}
      <div className="my-3 p-3.5 px-5 rounded-2xl bg-[rgba(255,35,65,0.08)] border border-[rgba(255,70,95,0.22)] text-center max-w-md">
        <p className="text-xs sm:text-sm text-[#FF6B7F] font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-[#FF3657]" />
          <span>Tumhare answers secretly mere paas pohanch chuke hain ✨</span>
        </p>
      </div>

      {/* Personal closing note from sender */}
      {personalNote && (
        <div className="w-full my-3 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-left relative backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-rose-300">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>A quiet note from {senderName || 'someone special'}:</span>
          </div>
          <p className="text-sm sm:text-base text-white/95 italic font-serif leading-relaxed">
            "{personalNote}"
          </p>
        </div>
      )}

      {/* Highlights recap */}
      <div className="w-full my-3 p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 text-left backdrop-blur-md">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center justify-between">
          <span>Moments Captured</span>
          <span className="text-[10px] text-white/40 normal-case">{answerEntries.length} answers</span>
        </h4>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {answerEntries.map((ans, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-xs sm:text-sm py-1.5 border-b border-white/5 last:border-0"
            >
              <span className="text-white/60 line-clamp-1">{ans.questionText}</span>
              <span className={`font-medium text-right shrink-0 ${themeConfig.accentText}`}>
                {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Replay CTA Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4">
        <button
          type="button"
          onClick={onReplay}
          className="min-h-[48px] w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium text-sm border border-white/15 backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4 text-white/70" />
          <span>Replay experience</span>
        </button>
      </div>

      <p className="mt-6 text-[11px] text-white/40">
        Curated with care by {senderName || 'someone'} for {displayName}
      </p>
    </div>
  );
};
