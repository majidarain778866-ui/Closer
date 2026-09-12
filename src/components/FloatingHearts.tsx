import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeartItem {
  id: string;
  left: number; // 0 to 100%
  bottom: number; // px offset
  size: number; // px
  duration: number; // seconds
  delay: number; // ms
  colorStyle: {
    textColor: string;
    fillColor: string;
    glow: string;
  };
  driftX1: number;
  driftX2: number;
  driftX3: number;
  driftX4: number;
  rot1: number;
  rot2: number;
  rot3: number;
  rot4: number;
}

interface FloatingHeartsProps {
  triggerKey?: string | number;
  count?: number;
  ambient?: boolean; // gentle recurring hearts in background
}

const COLOR_VARIANTS = [
  {
    textColor: '#fb7185', // rose-400
    fillColor: 'rgba(244, 63, 94, 0.45)',
    glow: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.65))',
  },
  {
    textColor: '#f472b6', // pink-400
    fillColor: 'rgba(236, 72, 153, 0.5)',
    glow: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.7))',
  },
  {
    textColor: '#fda4af', // rose-300
    fillColor: 'rgba(251, 113, 133, 0.35)',
    glow: 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.55))',
  },
  {
    textColor: '#fcd34d', // amber-300
    fillColor: 'rgba(245, 158, 11, 0.35)',
    glow: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.55))',
  },
  {
    textColor: '#e879f9', // fuchsia-400
    fillColor: 'rgba(217, 70, 239, 0.4)',
    glow: 'drop-shadow(0 0 11px rgba(217, 70, 239, 0.6))',
  },
  {
    textColor: '#f87171', // red-400
    fillColor: 'rgba(239, 68, 68, 0.45)',
    glow: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))',
  },
];

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  triggerKey = 'init',
  count = 22,
  ambient = true,
}) => {
  const [burstHearts, setBurstHearts] = useState<FloatingHeartItem[]>([]);
  const [ambientHearts, setAmbientHearts] = useState<FloatingHeartItem[]>([]);

  // Spawn initial cluster of romantic floating hearts when triggerKey updates
  useEffect(() => {
    const generated: FloatingHeartItem[] = [];

    for (let i = 0; i < count; i++) {
      const color = COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)];
      // Spread across viewport, slightly grouped towards center-left and center-right
      const left = Math.min(94, Math.max(6, Math.floor(Math.random() * 88) + 6));
      const size = Math.floor(Math.random() * 22) + 14; // 14px to 36px
      const duration = 4.2 + Math.random() * 3.2; // 4.2s to 7.4s
      const delay = Math.floor(Math.random() * 1600); // 0 to 1600ms stagger

      const driftX1 = (Math.random() - 0.5) * 40;
      const driftX2 = (Math.random() - 0.5) * 55;
      const driftX3 = (Math.random() - 0.5) * 65;
      const driftX4 = (Math.random() - 0.5) * 40;

      const rot1 = (Math.random() - 0.5) * 28;
      const rot2 = (Math.random() - 0.5) * 32;
      const rot3 = (Math.random() - 0.5) * 26;
      const rot4 = (Math.random() - 0.5) * 30;

      generated.push({
        id: `burst-${triggerKey}-${i}-${Date.now()}`,
        left,
        bottom: -30 + Math.floor(Math.random() * 50),
        size,
        duration,
        delay,
        colorStyle: color,
        driftX1,
        driftX2,
        driftX3,
        driftX4,
        rot1,
        rot2,
        rot3,
        rot4,
      });
    }

    setBurstHearts(generated);

    // Auto-clean burst after completion to preserve memory
    const cleanupTimer = setTimeout(() => {
      setBurstHearts([]);
    }, 9500);

    return () => clearTimeout(cleanupTimer);
  }, [triggerKey, count]);

  // Ambient gentle recurring floating hearts
  useEffect(() => {
    if (!ambient) return;

    const interval = setInterval(() => {
      setAmbientHearts((prev) => {
        const color = COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)];
        const left = Math.min(94, Math.max(6, Math.floor(Math.random() * 88) + 6));
        const size = Math.floor(Math.random() * 16) + 14;
        const duration = 6.5 + Math.random() * 3.5;

        const newHeart: FloatingHeartItem = {
          id: `ambient-${Date.now()}-${Math.random()}`,
          left,
          bottom: -25,
          size,
          duration,
          delay: 0,
          colorStyle: color,
          driftX1: (Math.random() - 0.5) * 35,
          driftX2: (Math.random() - 0.5) * 45,
          driftX3: (Math.random() - 0.5) * 40,
          driftX4: (Math.random() - 0.5) * 30,
          rot1: (Math.random() - 0.5) * 24,
          rot2: (Math.random() - 0.5) * 28,
          rot3: (Math.random() - 0.5) * 20,
          rot4: (Math.random() - 0.5) * 24,
        };

        // Keep maximum 6 ambient hearts simultaneously
        const updated = [...prev.slice(-5), newHeart];
        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [ambient]);

  const allHearts = [...burstHearts, ...ambientHearts];

  if (allHearts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-20"
    >
      {allHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-floating-heart"
          style={
            {
              left: `${heart.left}%`,
              bottom: `${heart.bottom}px`,
              animationDelay: `${heart.delay}ms`,
              '--float-duration': `${heart.duration}s`,
              '--drift-x-1': `${heart.driftX1}px`,
              '--drift-x-2': `${heart.driftX2}px`,
              '--drift-x-3': `${heart.driftX3}px`,
              '--drift-x-4': `${heart.driftX4}px`,
              '--rot-1': `${heart.rot1}deg`,
              '--rot-2': `${heart.rot2}deg`,
              '--rot-3': `${heart.rot3}deg`,
              '--rot-4': `${heart.rot4}deg`,
              filter: heart.colorStyle.glow,
            } as React.CSSProperties
          }
        >
          <Heart
            style={{
              width: `${heart.size}px`,
              height: `${heart.size}px`,
              color: heart.colorStyle.textColor,
              fill: heart.colorStyle.fillColor,
            }}
            strokeWidth={1.75}
          />
        </div>
      ))}
    </div>
  );
};
