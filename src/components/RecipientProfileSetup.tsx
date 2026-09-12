import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { RecipientProfile, ExperienceTheme } from '../types';
import { THEMES } from '../data/themes';
import { storageService } from '../services/storageService';
import { compressImageClientSide } from '../services/photoStorage';
import {
  Sparkles,
  Camera,
  Heart,
  Upload,
  X,
  Lock,
  User,
  Smile,
  Palette,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';

interface RecipientProfileSetupProps {
  senderName: string;
  experienceId?: string;
  sessionId?: string;
  initialRecipientName?: string;
  initialNickname?: string;
  initialTheme?: ExperienceTheme;
  onComplete: (profile: RecipientProfile) => void | Promise<void>;
}

const THEME_OPTIONS: Array<{
  id: ExperienceTheme;
  name: string;
  mood: string;
  previewGradient: string;
  colors: string[];
}> = [
  {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    mood: 'Velvet midnight with soft rose glow',
    previewGradient: 'from-rose-950 via-purple-950 to-neutral-950',
    colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#E11D48'],
  },
  {
    id: 'moonlit',
    name: 'Moonlit Indigo',
    mood: 'Starlit deep blue & quiet intimacy',
    previewGradient: 'from-indigo-950 via-slate-950 to-neutral-950',
    colors: ['#6366F1', '#818CF8', '#A5B4FC', '#38BDF8'],
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    mood: 'Warm amber glow & dusk horizon',
    previewGradient: 'from-amber-950 via-rose-950 to-neutral-950',
    colors: ['#F59E0B', '#FB923C', '#F43F5E', '#FBBF24'],
  },
  {
    id: 'dreamy',
    name: 'Dreamy Lavender',
    mood: 'Celestial violet shimmer & soft pastel',
    previewGradient: 'from-purple-950 via-fuchsia-950 to-neutral-950',
    colors: ['#A855F7', '#C084FC', '#E879F9', '#F472B6'],
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    mood: 'Obsidian noir with subtle champagne gold',
    previewGradient: 'from-neutral-950 via-stone-900 to-black',
    colors: ['#D4AF37', '#E5C07B', '#FFFFFF', '#A3A3A3'],
  },
];

export const RecipientProfileSetup: React.FC<RecipientProfileSetupProps> = ({
  senderName,
  experienceId,
  sessionId,
  initialRecipientName = '',
  initialNickname = '',
  initialTheme = 'midnight-rose',
  onComplete,
}) => {
  const [name, setName] = useState(initialRecipientName);
  const [nickname, setNickname] = useState(initialNickname);
  const [lovelyName, setLovelyName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ExperienceTheme>(initialTheme);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentThemeConfig = THEMES[selectedTheme] || THEMES['midnight-rose'];

  // Compress and read uploaded photo into optimized Data URL (<300 KB, EXIF stripped)
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo size should be under 10MB.');
      return;
    }
    setError(null);

    try {
      const compressedDataUrl = await compressImageClientSide(file, {
        maxWidth: 480,
        maxHeight: 480,
        quality: 0.82,
        format: 'image/webp',
      });
      setPhotoUrl(compressedDataUrl);
    } catch {
      setError('Unable to process photo. Please try a different image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim() || initialRecipientName.trim() || 'You';
    const trimmedNickname = nickname.trim() || trimmedName;
    const trimmedLovelyName = lovelyName.trim() || trimmedNickname || trimmedName;

    const profileData: RecipientProfile = {
      name: trimmedName,
      nickname: trimmedNickname,
      lovelyName: trimmedLovelyName,
      selectedTheme,
      ...(photoUrl ? { photoUrl } : {}),
    };

    setIsSaving(true);
    setError(null);

    try {
      // Persist to Firestore linked to the active session ID
      if (experienceId && sessionId) {
        await storageService.saveActiveSessionProfile(
          experienceId,
          sessionId,
          profileData
        );
      }
      await onComplete(profileData);
    } catch (err) {
      console.warn('Profile completion notice:', err);
      // Gracefully advance so recipient is never stuck
      await onComplete(profileData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-4 sm:py-8 z-20">
      {/* Primary Luxury Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`relative rounded-3xl p-6 sm:p-9 backdrop-blur-2xl border transition-all duration-500 cinematic-theme-transition transform-gpu shadow-2xl ${currentThemeConfig.cardBg} ${currentThemeConfig.cardBorder} ${currentThemeConfig.cardShadow}`}
      >
        {/* Cinematic Light Sweep Sheen */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden pointer-events-none rounded-t-3xl"
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#FF6B7F] to-transparent cinematic-light-sweep" />
        </div>

        {/* Soft atmospheric ambient glow */}
        <div
          aria-hidden="true"
          className="absolute -top-14 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-gradient-to-r from-[#8F1020]/25 via-[#D61F3A]/20 to-[#FF3657]/20 blur-3xl pointer-events-none"
        />

        {/* Card Header */}
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium ${currentThemeConfig.badgeBg} ${currentThemeConfig.badgeBorder} ${currentThemeConfig.badgeText} border mb-1`}
          >
            <Sparkles className="w-3.5 h-3.5 text-current" />
            <span>Curated with love by {senderName}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F8F2F3] font-normal tracking-wide">
            Shuru Karne Se Pehle ✨
          </h2>
          <p className="text-xs sm:text-sm text-[#B8AEB1] max-w-sm mx-auto leading-relaxed">
            Ek pyari si mulakat se pehle apna naam aur vibe set kar lo...
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OPTIONAL PROFILE PHOTO */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium uppercase tracking-wider text-[#F8F2F3]/75 mb-2.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#FF6B7F]" />
              <span>Aapki Tasveer <span className="text-[#B8AEB1] normal-case">(Optional)</span></span>
            </span>

            <div className="relative group">
              {photoUrl ? (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#8F1020] via-[#D61F3A] to-[#FF6B7F] shadow-lg shadow-[#D61F3A]/30">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-black/80 bg-black/60">
                    <img
                      src={photoUrl}
                      alt="Your avatar preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    aria-label="Remove uploaded photo"
                    className="absolute -top-1 -right-1 p-1.5 rounded-full bg-[#8F1020] text-white hover:bg-[#D61F3A] shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-[#FF6B7F] bg-[#FF3657]/20 scale-105'
                      : 'border-white/20 bg-white/[0.04] hover:border-[#FF6B7F]/60 hover:bg-white/[0.08]'
                  }`}
                >
                  <Upload className="w-6 h-6 text-white/50 group-hover:text-[#FF6B7F] transition-colors mb-1" />
                  <span className="text-[10px] text-white/60 group-hover:text-white/90 transition-colors">
                    Add photo
                  </span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {error && <p className="text-xs text-[#FF6B7F] mt-2">{error}</p>}
          </div>

          {/* NAME, NICKNAME & LOVELY NAME (Glassmorphic input card) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#050407]/40 border border-[rgba(255,70,95,0.18)] space-y-4">
            {/* NAME FIELD */}
            <div>
              <label
                htmlFor="recipient-name-input"
                className="block text-xs font-medium uppercase tracking-wider text-[#F8F2F3]/80 mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#FF6B7F]" />
                <span>Aapka Naam <span className="text-[#FF3657]">*</span></span>
              </label>
              <input
                id="recipient-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aapka naam kya hai?"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[rgba(255,70,95,0.2)] text-[#F8F2F3] placeholder-[#726A6E] text-sm focus:outline-none focus:border-[#FF3657] focus:ring-2 focus:ring-[#FF3657]/20 focus:bg-white/[0.1] transition-all"
              />
            </div>

            {/* NICKNAME FIELD */}
            <div>
              <label
                htmlFor="recipient-nickname-input"
                className="block text-xs font-medium uppercase tracking-wider text-[#F8F2F3]/80 mb-1.5 flex items-center gap-1.5"
              >
                <Smile className="w-3.5 h-3.5 text-[#FF6B7F]" />
                <span>Nickname <span className="text-[#B8AEB1] normal-case">(optional)</span></span>
              </label>
              <input
                id="recipient-nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Friends kis naam se pukarte hain?"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[rgba(255,70,95,0.2)] text-[#F8F2F3] placeholder-[#726A6E] text-sm focus:outline-none focus:border-[#FF3657] focus:ring-2 focus:ring-[#FF3657]/20 focus:bg-white/[0.1] transition-all"
              />
            </div>

            {/* LOVELY NAME FIELD */}
            <div>
              <label
                htmlFor="recipient-lovelyname-input"
                className="block text-xs font-medium uppercase tracking-wider text-[#F8F2F3]/80 mb-1.5 flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-[#FF3657]" />
                <span>Lovely Name <span className="text-[#B8AEB1] normal-case">(special, optional)</span></span>
              </label>
              <input
                id="recipient-lovelyname-input"
                type="text"
                value={lovelyName}
                onChange={(e) => setLovelyName(e.target.value)}
                placeholder="Kis pyare naam se pukara jaye? (e.g. Cutie, Pari, Sweetheart)"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[rgba(255,70,95,0.2)] text-[#F8F2F3] placeholder-[#726A6E] text-sm focus:outline-none focus:border-[#FF3657] focus:ring-2 focus:ring-[#FF3657]/20 focus:bg-white/[0.1] transition-all"
              />
            </div>
          </div>

          {/* THEME PREFERENCE (Interactive Glass Cards) */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#F8F2F3]/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#FF6B7F]" />
                <span>Theme / Vibe Preference</span>
              </span>
              <span className="text-[11px] text-[#B8AEB1] font-normal lowercase">optional</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((themeOption) => {
                const isSelected = selectedTheme === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    type="button"
                    onClick={() => setSelectedTheme(themeOption.id)}
                    className={`relative text-left p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-[rgba(255,35,65,0.12)] border-[#FF3657]/60 shadow-xl ring-2 ring-[#FF3657]/40 scale-[1.01]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">
                        {themeOption.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#D61F3A] flex items-center justify-center text-white shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/65 line-clamp-1 leading-snug mb-2">
                      {themeOption.mood}
                    </p>
                    {/* Visual Color Swatches */}
                    <div className="flex items-center gap-1.5">
                      {themeOption.colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRIVACY & SHARING BADGE */}
          <div className="p-3.5 rounded-2xl bg-[rgba(255,35,65,0.06)] border border-[rgba(255,70,95,0.18)] flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#FF6B7F] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-[#B8AEB1] leading-relaxed">
              Tumhare answers usi person ke saath share honge jis ne ye link bheja hai.
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${currentThemeConfig.primaryBtn} ${currentThemeConfig.primaryBtnHover} text-white font-semibold text-base shadow-xl ${currentThemeConfig.primaryBtnShadow} hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing your story…</span>
              </>
            ) : (
              <>
                <span>Shuru Karein ❤️</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
