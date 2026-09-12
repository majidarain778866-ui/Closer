import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { ExperienceTheme } from '../types';
import { getThemeConfig } from '../data/themes';

export interface DodgingNoButtonProps {
  onConfirmYes: (evasionCount: number) => void;
  teasePhrases?: string[];
  yesLabel?: string;
  noLabel?: string;
  theme?: ExperienceTheme;
  lovelyName?: string;
  intensity?: 'gentle' | 'playful' | 'very-playful';
  maxEvasions?: number;
  morphMessage?: string;
  dodgingEnabled?: boolean;
  mobileShake?: boolean;
  morphToYes?: boolean;
}

const DEFAULT_TEASES = [
  'Achaa… nice try 😏',
  'Dobara socho…',
  'Tum bhi na… 👀',
  'Dil mein to Haan hi hai na? ❤️',
  'Itni asani se peecha nahi chhootega 😏',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  char: string;
}

export const DodgingNoButton: React.FC<DodgingNoButtonProps> = ({
  onConfirmYes,
  teasePhrases = DEFAULT_TEASES,
  yesLabel = 'Haan ❤️',
  noLabel = 'Nahi 😏',
  theme = 'midnight-rose',
  lovelyName,
  intensity = 'playful',
  maxEvasions = 5,
  morphMessage,
  dodgingEnabled = true,
  mobileShake = true,
  morphToYes = true,
}) => {
  const [evasionCount, setEvasionCount] = useState(0);
  const [currentTease, setCurrentTease] = useState<string | null>(null);
  const [isConverted, setIsConverted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAutoConfirming, setIsAutoConfirming] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastTeaseTime = useRef<number>(0);
  const hasTriggeredConfirm = useRef<boolean>(false);
  const autoConfirmTimer = useRef<NodeJS.Timeout | null>(null);

  const themeConfig = getThemeConfig(theme);

  // Framer Motion spring physics with useSpring & useMotionValue
  // Provides fluid 60/120fps reverse-magnetic evasion without React re-render overhead
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRotate = useMotionValue(0);

  // High-performance spring configuration: responsive repulsion with gentle magnetic damping
  const springConfig = {
    stiffness: 300,
    damping: 24,
    mass: 0.55,
  };

  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const rotate = useSpring(rawRotate, {
    stiffness: 280,
    damping: 22,
    mass: 0.5,
  });

  // Touch device detection
  useEffect(() => {
    const checkTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);
    setIsTouchDevice(checkTouch);
  }, []);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (autoConfirmTimer.current) {
        clearTimeout(autoConfirmTimer.current);
      }
    };
  }, []);

  const spawnParticles = useCallback((count = 8, chars = ['❤️', '✨', '💖', '🌹']) => {
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: (Math.random() - 0.5) * 90,
      y: -25 - Math.random() * 50,
      scale: 0.65 + Math.random() * 0.75,
      char: chars[Math.floor(Math.random() * chars.length)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 950);
  }, []);

  // Format tease copy replacing {lovelyName}
  const getTeasePhrase = useCallback(
    (count: number) => {
      const phrases = teasePhrases.map((phrase) =>
        lovelyName ? phrase.replace('{lovelyName}', lovelyName) : phrase
      );
      const idx = (count - 1) % phrases.length;
      return phrases[idx];
    },
    [teasePhrases, lovelyName]
  );

  // Desktop Reverse-Magnetic Cursor Evasion Effect
  // Continuous reverse-magnetic field repelling the button away from the cursor
  const handleReverseMagneticEvasion = useCallback(
    (pointerX: number, pointerY: number) => {
      if (!dodgingEnabled || isTouchDevice || isConverted || isShaking) return;

      const button = noButtonRef.current;
      const container = containerRef.current;
      if (!button || !container) return;

      const btnRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Current visual center of the button
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      // Displacement vector from cursor to button center
      const dx = btnCenterX - pointerX;
      const dy = btnCenterY - pointerY;
      const dist = Math.hypot(dx, dy);

      // Magnetic field radius dynamically calibrated based on intensity
      const MAGNETIC_RADIUS =
        intensity === 'gentle' ? 110 : intensity === 'very-playful' ? 175 : 140;

      if (dist < MAGNETIC_RADIUS) {
        // Safe container boundary calculation
        const currentX = rawX.get();
        const currentY = rawY.get();
        const padding = 16;

        // Button boundaries without displacement
        const originLeft = btnRect.left - currentX;
        const originRight = btnRect.right - currentX;
        const originTop = btnRect.top - currentY;
        const originBottom = btnRect.bottom - currentY;

        const minX = containerRect.left + padding - originLeft;
        const maxX = containerRect.right - padding - originRight;
        const minY = containerRect.top + padding - originTop;
        const maxY = containerRect.bottom - padding - originBottom;

        // Reverse magnetic repulsion strength
        const proximityRatio = Math.max(0, (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS);
        const intensityFactor =
          intensity === 'gentle' ? 48 : intensity === 'very-playful' ? 105 : 75;
        const pushForce = Math.pow(proximityRatio, 1.15) * intensityFactor;

        // Unit repulsion direction vector (away from cursor)
        const safeDist = dist || 1;
        const ux = dx / safeDist;
        const uy = dy / safeDist;

        // Compute new magnetic destination
        let targetX = currentX + ux * pushForce;
        let targetY = currentY + uy * pushForce;

        // Magnetic wall deflection (glides smoothly along boundary if blocked)
        if (targetX < minX) {
          targetX = minX;
          targetY += (uy >= 0 ? 1 : -1) * (pushForce * 0.6);
        } else if (targetX > maxX) {
          targetX = maxX;
          targetY += (uy >= 0 ? 1 : -1) * (pushForce * 0.6);
        }

        if (targetY < minY) {
          targetY = minY;
          targetX += (ux >= 0 ? 1 : -1) * (pushForce * 0.6);
        } else if (targetY > maxY) {
          targetY = maxY;
          targetX += (ux >= 0 ? 1 : -1) * (pushForce * 0.6);
        }

        // Final boundary clamping to ensure button never escapes container
        const clampedX = Math.max(minX, Math.min(maxX, targetX));
        const clampedY = Math.max(minY, Math.min(maxY, targetY));

        // Subtle dynamic rotation based on repulsion vector
        const targetRotate = Math.max(-14, Math.min(14, dx / 9 + (Math.random() - 0.5) * 4));

        // Dispatch continuous spring movement
        rawX.set(Math.round(clampedX));
        rawY.set(Math.round(clampedY));
        rawRotate.set(Math.round(targetRotate));

        // Close-call tease trigger (when cursor gets uncomfortably close)
        const now = Date.now();
        if (dist < 65 && now - lastTeaseTime.current > 350) {
          lastTeaseTime.current = now;
          setEvasionCount((prev) => {
            const next = prev + 1;
            setCurrentTease(getTeasePhrase(next));

            // If evaded repeatedly on desktop, playfully convert into YES
            if (morphToYes && next >= maxEvasions) {
              setIsConverted(true);
              spawnParticles(10);
              const customTease =
                morphMessage ||
                (lovelyName
                  ? `Haan hi kehna tha na, ${lovelyName}? 😏❤️`
                  : 'Haan hi kehna tha na? 😏❤️');
              setCurrentTease(customTease);
              rawX.set(0);
              rawY.set(0);
              rawRotate.set(0);
            }
            return next;
          });
        }
      } else if (dist > MAGNETIC_RADIUS + 70) {
        // When cursor is far away, gently relax rotation
        rawRotate.set(0);
      }
    },
    [
      dodgingEnabled,
      intensity,
      isTouchDevice,
      isConverted,
      isShaking,
      rawX,
      rawY,
      rawRotate,
      getTeasePhrase,
      morphToYes,
      maxEvasions,
      morphMessage,
      lovelyName,
      spawnParticles,
    ]
  );

  // Track cursor movement on window for continuous reverse-magnetic field
  useEffect(() => {
    if (isTouchDevice || isConverted) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleReverseMagneticEvasion(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleReverseMagneticEvasion, isTouchDevice, isConverted]);

  // Handle window resizing: keep motion values within updated boundary box
  useEffect(() => {
    const handleResize = () => {
      const button = noButtonRef.current;
      const container = containerRef.current;
      if (!button || !container) return;

      const btnRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const padding = 16;

      const currentX = rawX.get();
      const currentY = rawY.get();
      const originLeft = btnRect.left - currentX;
      const originRight = btnRect.right - currentX;
      const originTop = btnRect.top - currentY;
      const originBottom = btnRect.bottom - currentY;

      const minX = containerRect.left + padding - originLeft;
      const maxX = containerRect.right - padding - originRight;
      const minY = containerRect.top + padding - originTop;
      const maxY = containerRect.bottom - padding - originBottom;

      if (currentX < minX || currentX > maxX) {
        rawX.set(Math.max(minX, Math.min(maxX, currentX)));
      }
      if (currentY < minY || currentY > maxY) {
        rawY.set(Math.max(minY, Math.min(maxY, currentY)));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rawX, rawY]);

  // Mobile Tap Sequence: Click -> Shake -> Convert into YES -> Automatically Clicked/Confirmed!
  const handleNoClickMobileOrAction = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isShaking || isConverted || hasTriggeredConfirm.current) return;

    // Trigger haptic vibration if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 45, 35]);
      } catch {
        // Ignore haptics errors if disabled by browser
      }
    }

    const nextCount = evasionCount + 1;
    setEvasionCount(nextCount);

    // 1. Shake animation starts (if enabled)
    if (mobileShake) {
      setIsShaking(true);
    }
    spawnParticles(8, ['❤️', '✨', '🌹', '💖']);

    const friendlyMessage =
      morphMessage ||
      (lovelyName ? `Lagta hai tumhara matlab Haan tha, ${lovelyName} ❤️` : 'Lagta hai tumhara matlab Haan tha… ❤️');
    setCurrentTease(friendlyMessage);

    // 2. Convert to YES after shake completes (~420ms)
    if (morphToYes) {
      setTimeout(() => {
        setIsShaking(false);
        setIsConverted(true);
        setIsAutoConfirming(true);
        spawnParticles(10, ['❤️', '✨', '💖']);

        // Reset spring offsets to center the converted YES button cleanly
        rawX.set(0);
        rawY.set(0);
        rawRotate.set(0);

        // 3. Automatically trigger YES confirmation
        autoConfirmTimer.current = setTimeout(() => {
          if (!hasTriggeredConfirm.current) {
            hasTriggeredConfirm.current = true;
            onConfirmYes(nextCount);
          }
        }, 750);
      }, mobileShake ? 420 : 100);
    } else {
      setTimeout(() => setIsShaking(false), 420);
    }
  };

  const handleImmediateYes = () => {
    if (hasTriggeredConfirm.current) return;
    hasTriggeredConfirm.current = true;
    if (autoConfirmTimer.current) {
      clearTimeout(autoConfirmTimer.current);
    }
    onConfirmYes(evasionCount);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full min-h-[175px] py-3 select-none"
    >
      {/* Playful Teasing Banner with Spring Entrance */}
      <AnimatePresence mode="wait">
        {currentTease && (
          <motion.div
            key={currentTease}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            role="status"
            aria-live="polite"
            className={`mb-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border backdrop-blur-md shadow-md ${themeConfig.badgeBg} ${themeConfig.badgeBorder} ${themeConfig.badgeText}`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-current" />
            <span className="text-white font-medium">{currentTease}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons Action Group */}
      <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-sm px-2">
        {/* YES BUTTON (Primary Romantic Action) */}
        <motion.button
          type="button"
          onClick={handleImmediateYes}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label={yesLabel}
          className={`group relative flex-1 min-w-[140px] sm:min-w-[160px] min-h-[52px] py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r ${themeConfig.primaryBtn} ${themeConfig.primaryBtnHover} text-white font-semibold text-base sm:text-lg shadow-xl ${themeConfig.primaryBtnShadow} border border-white/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none`}
        >
          <Heart className="w-4 h-4 fill-white/85 transition-transform group-hover:scale-125 shrink-0" />
          <span className="truncate">{yesLabel}</span>
        </motion.button>

        {/* NO BUTTON: With Desktop Reverse-Magnetic Evasion & Mobile Tap->Shake->Convert->AutoClick */}
        <AnimatePresence mode="wait">
          {!isConverted ? (
            <motion.div
              key="evasive-no-container"
              style={{ x, y, rotate }}
              className="relative inline-block"
            >
              {/* Heart particles bursting on evasion/tap */}
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="absolute pointer-events-none text-base left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  {p.char}
                </motion.span>
              ))}

              <motion.button
                ref={noButtonRef}
                type="button"
                animate={
                  isShaking
                    ? {
                        x: [-16, 16, -12, 12, -8, 8, -4, 4, 0],
                        rotate: [-6, 6, -4, 4, -2, 2, 0],
                        transition: { duration: 0.42, ease: 'easeInOut' },
                      }
                    : undefined
                }
                onClick={handleNoClickMobileOrAction}
                onMouseEnter={(e) => handleReverseMagneticEvasion(e.clientX, e.clientY)}
                aria-label={isShaking ? 'Wait… 👀' : noLabel}
                className={`min-w-[115px] sm:min-w-[130px] min-h-[52px] py-3.5 sm:py-4 px-5 rounded-2xl font-medium text-sm sm:text-base border backdrop-blur-md transition-colors duration-200 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none ${
                  isShaking
                    ? 'bg-rose-500/30 border-rose-400 text-rose-100 shadow-lg shadow-rose-500/40'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border-white/15'
                }`}
              >
                {isShaking ? 'Wait… 👀' : noLabel}
              </motion.button>
            </motion.div>
          ) : (
            /* Converted YES button with celebratory spring entrance and auto-confirmation indicator */
            <motion.div
              key="converted-yes-container"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="relative inline-block"
            >
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute pointer-events-none text-base left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  {p.char}
                </motion.span>
              ))}

              <motion.button
                type="button"
                onClick={handleImmediateYes}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="I meant YES"
                className={`min-w-[140px] sm:min-w-[160px] min-h-[52px] py-3.5 sm:py-4 px-5 rounded-2xl bg-gradient-to-r ${themeConfig.primaryBtn} ${themeConfig.primaryBtnHover} text-white border border-white/30 font-semibold text-sm sm:text-base backdrop-blur-md cursor-pointer flex items-center justify-center gap-2 shadow-xl ${themeConfig.primaryBtnShadow} focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                  isAutoConfirming ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-black/50 animate-pulse' : ''
                }`}
              >
                <Heart className="w-4 h-4 fill-white text-white shrink-0 animate-bounce" />
                <span className="truncate">{yesLabel || 'Haan ❤️'}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtext indicator */}
      {evasionCount > 0 && !isConverted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-[11px] sm:text-xs text-white/50 tracking-wider"
        >
          {isTouchDevice
            ? 'Tap once more to confirm ✨'
            : 'The cursor knows what it wants ✨'}
        </motion.p>
      )}
    </div>
  );
};
