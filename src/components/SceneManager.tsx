import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  VisualScene,
  ExperienceTheme,
  Question,
  VibeMode,
  SceneConfig,
} from '../types';
import { getThemeConfig } from '../data/themes';
import { getSceneConfig, preloadScene, SCENE_LIBRARY } from '../data/sceneLibrary';

/**
 * State describing the active emotional and visual chapter of the experience
 */
export interface SceneJourneyState {
  activeScene: VisualScene;
  nextScene?: VisualScene;
  sceneConfig: SceneConfig;
  questionIndex: number;
  totalQuestions: number;
  progressRatio: number; // 0.0 at opening to 1.0 at finale
  stageName: string;
  stageSubtitle: string;
  blurPx: number; // Optical depth blur applied to background imagery
  vignetteOpacity: number; // Radial focus vignette darkness (0.3 to 0.8)
  particlePreset: 'bokeh' | 'petals' | 'stars' | 'fireflies' | 'champagne';
  particleCount: number;
  accentColor: string;
  theme: ExperienceTheme;
}

export interface SceneManagerProps {
  questionIndex?: number;
  totalQuestions?: number;
  stage?: 'welcome' | 'profile-setup' | 'greeting' | 'questions' | 'completed' | string;
  currentQuestion?: Question;
  theme?: ExperienceTheme | string;
  vibe?: VibeMode;
  customScene?: VisualScene;
  nextScene?: VisualScene;
  children?: React.ReactNode;
  className?: string;
  onSceneChange?: (state: SceneJourneyState) => void;
}

const SceneManagerContext = createContext<SceneJourneyState | null>(null);

/**
 * Hook to consume current scene journey state inside any child component
 */
export function useSceneManager(): SceneJourneyState {
  const context = useContext(SceneManagerContext);
  if (!context) {
    // Return sensible fallback if used outside provider
    const fallbackConfig = getSceneConfig('sunset');
    return {
      activeScene: 'sunset',
      sceneConfig: fallbackConfig,
      questionIndex: 0,
      totalQuestions: 8,
      progressRatio: 0,
      stageName: 'Opening Glow',
      stageSubtitle: 'A quiet beginning to something special',
      blurPx: 0.5,
      vignetteOpacity: 0.35,
      particlePreset: 'bokeh',
      particleCount: 20,
      accentColor: '#FB923C',
      theme: 'midnight-rose',
    };
  }
  return context;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  vy: number;
  radius: number;
  layer: 'deep' | 'mid' | 'foreground';
  baseAlpha: number;
  currentAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  r: number;
  g: number;
  b: number;
  hasRim: boolean;
  type: 'bokeh' | 'petals' | 'stars' | 'fireflies' | 'champagne';
  rotation: number;
  rotationSpeed: number;
}

// Scene-specific RGB color palettes for particle engine
const SCENE_PALETTES: Record<VisualScene, { r: number; g: number; b: number }[]> = {
  sunset: [
    { r: 251, g: 146, b: 60 },
    { r: 244, g: 63, b: 94 },
    { r: 253, g: 186, b: 116 },
    { r: 236, g: 72, b: 153 },
  ],
  food: [
    { r: 245, g: 158, b: 11 },
    { r: 225, g: 29, b: 72 },
    { r: 252, g: 211, b: 77 },
    { r: 249, g: 115, b: 22 },
  ],
  'golden-lights': [
    { r: 252, g: 211, b: 77 },
    { r: 245, g: 158, b: 11 },
    { r: 254, g: 240, b: 138 },
    { r: 251, g: 191, b: 36 },
  ],
  'city-night': [
    { r: 192, g: 132, b: 252 },
    { r: 129, g: 140, b: 248 },
    { r: 165, g: 180, b: 252 },
    { r: 232, g: 121, b: 249 },
  ],
  'rose-petals': [
    { r: 255, g: 54, b: 87 },
    { r: 214, g: 31, b: 58 },
    { r: 255, g: 107, b: 127 },
    { r: 143, g: 16, b: 32 },
  ],
  moonlight: [
    { r: 216, g: 180, b: 254 },
    { r: 199, g: 210, b: 254 },
    { r: 226, g: 232, b: 240 },
    { r: 167, g: 139, b: 250 },
  ],
  'dreamy-stars': [
    { r: 168, g: 85, b: 247 },
    { r: 244, g: 114, b: 182 },
    { r: 255, g: 255, b: 255 },
    { r: 192, g: 132, b: 252 },
  ],
  'cinematic-finale': [
    { r: 244, g: 63, b: 94 },
    { r: 250, g: 204, b: 21 },
    { r: 251, g: 113, b: 133 },
    { r: 236, g: 72, b: 153 },
  ],
  'candlelit-cafe': [
    { r: 245, g: 158, b: 11 },
    { r: 217, g: 119, b: 6 },
    { r: 253, g: 186, b: 116 },
    { r: 244, g: 63, b: 94 },
  ],
  'ocean-dusk': [
    { r: 129, g: 140, b: 248 },
    { r: 165, g: 180, b: 252 },
    { r: 244, g: 114, b: 182 },
    { r: 56, g: 189, b: 248 },
  ],
};

/**
 * Maps the emotional progression index (0-7+) to cinematic visual parameters
 */
interface StagePreset {
  scene: VisualScene;
  stageName: string;
  stageSubtitle: string;
  baseBlur: number;
  vignetteOpacity: number;
  particlePreset: 'bokeh' | 'petals' | 'stars' | 'fireflies' | 'champagne';
  baseParticleCount: number;
}

const EMOTIONAL_JOURNEY_STAGES: StagePreset[] = [
  {
    scene: 'sunset',
    stageName: 'Opening Horizon',
    stageSubtitle: 'Golden hour twilight & quiet curiosity',
    baseBlur: 0.5,
    vignetteOpacity: 0.35,
    particlePreset: 'bokeh',
    baseParticleCount: 18,
  },
  {
    scene: 'food',
    stageName: 'Comfort & Indulgence',
    stageSubtitle: 'Warm bistro glow, shared laughs & zero rules',
    baseBlur: 1.8,
    vignetteOpacity: 0.42,
    particlePreset: 'bokeh',
    baseParticleCount: 22,
  },
  {
    scene: 'golden-lights',
    stageName: 'Personal Spark',
    stageSubtitle: 'Evening lantern lights & unspoken resonance',
    baseBlur: 2.8,
    vignetteOpacity: 0.48,
    particlePreset: 'fireflies',
    baseParticleCount: 26,
  },
  {
    scene: 'city-night',
    stageName: 'Electric Attraction',
    stageSubtitle: 'Midnight skyline & catching your gaze',
    baseBlur: 4.2,
    vignetteOpacity: 0.55,
    particlePreset: 'bokeh',
    baseParticleCount: 28,
  },
  {
    scene: 'rose-petals',
    stageName: 'Velvety Tease',
    stageSubtitle: 'Midnight roses, playful banter & butterflies',
    baseBlur: 5.6,
    vignetteOpacity: 0.62,
    particlePreset: 'petals',
    baseParticleCount: 32,
  },
  {
    scene: 'moonlight',
    stageName: 'Silver Intimacy',
    stageSubtitle: 'Quiet bravery beneath the moonlit waters',
    baseBlur: 7.0,
    vignetteOpacity: 0.68,
    particlePreset: 'stars',
    baseParticleCount: 34,
  },
  {
    scene: 'dreamy-stars',
    stageName: 'Celestial Vulnerability',
    stageSubtitle: 'Safe in each other’s orbit under endless stars',
    baseBlur: 8.2,
    vignetteOpacity: 0.72,
    particlePreset: 'stars',
    baseParticleCount: 36,
  },
  {
    scene: 'cinematic-finale',
    stageName: 'Grand Romantic Climax',
    stageSubtitle: 'A starlit terrace where your journey blooms',
    baseBlur: 9.8,
    vignetteOpacity: 0.78,
    particlePreset: 'champagne',
    baseParticleCount: 42,
  },
];

export const SceneManager: React.FC<SceneManagerProps> = ({
  questionIndex = 0,
  totalQuestions = 8,
  stage = 'questions',
  currentQuestion,
  theme = 'midnight-rose',
  vibe,
  customScene,
  nextScene: explicitNextScene,
  children,
  className = '',
  onSceneChange,
}) => {
  const activeTheme = (theme as ExperienceTheme) || 'midnight-rose';
  const themeConfig = getThemeConfig(activeTheme);

  // 1. Calculate dynamic emotional journey state based on question index and stage
  const journeyState: SceneJourneyState = useMemo(() => {
    let resolvedIndex = questionIndex;
    let computedScene: VisualScene = 'sunset';
    let stageInfo: StagePreset = EMOTIONAL_JOURNEY_STAGES[0];
    let ratio = 0;

    if (stage === 'welcome' || stage === 'profile-setup') {
      computedScene = customScene || 'sunset';
      stageInfo = {
        scene: computedScene,
        stageName: 'Soft Mystery',
        stageSubtitle: 'A private connection experience crafted just for you',
        baseBlur: 0.5,
        vignetteOpacity: 0.35,
        particlePreset: 'bokeh',
        baseParticleCount: 18,
      };
      ratio = 0;
    } else if (stage === 'greeting') {
      computedScene = customScene || 'golden-lights';
      stageInfo = {
        scene: computedScene,
        stageName: 'Intimate Note',
        stageSubtitle: 'Before we begin, a personal greeting',
        baseBlur: 1.5,
        vignetteOpacity: 0.4,
        particlePreset: 'fireflies',
        baseParticleCount: 22,
      };
      ratio = 0.08;
    } else if (stage === 'completed') {
      computedScene = customScene || 'cinematic-finale';
      stageInfo = {
        scene: computedScene,
        stageName: 'Grand Reveal',
        stageSubtitle: 'Your connection profile & memorable ending',
        baseBlur: 8.5,
        vignetteOpacity: 0.75,
        particlePreset: 'champagne',
        baseParticleCount: 40,
      };
      ratio = 1.0;
    } else {
      // Normal question stage: map questionIndex (0 to totalQuestions - 1)
      const clampedTotal = Math.max(1, totalQuestions);
      const safeIndex = Math.max(0, resolvedIndex);
      ratio = clampedTotal > 1 ? Math.min(1, safeIndex / (clampedTotal - 1)) : 0;

      // Select preset by index or mapped progression
      const stagePresetIndex = Math.min(
        EMOTIONAL_JOURNEY_STAGES.length - 1,
        Math.floor(ratio * (EMOTIONAL_JOURNEY_STAGES.length - 1))
      );
      stageInfo = EMOTIONAL_JOURNEY_STAGES[stagePresetIndex] || EMOTIONAL_JOURNEY_STAGES[0];

      // If current question specifies its own visualScene, prioritize it
      if (currentQuestion?.visualScene) {
        computedScene = currentQuestion.visualScene;
      } else if (customScene) {
        computedScene = customScene;
      } else {
        computedScene = stageInfo.scene;
      }
    }

    const sceneConfig = getSceneConfig(computedScene, activeTheme);

    // Dynamic blur calculation: ramps smoothly from 0.5px to ~10px based on progress ratio
    const dynamicBlur = Number(
      (stageInfo.baseBlur * 0.7 + ratio * 4.5).toFixed(1)
    );

    // Dynamic vignette opacity: darkens perimeter to focus eyes on the question card
    const dynamicVignette = Number(
      (stageInfo.vignetteOpacity * 0.85 + ratio * 0.15).toFixed(2)
    );

    // Dynamic particle count: scaled by progress ratio
    const dynamicParticleCount = Math.round(
      stageInfo.baseParticleCount + ratio * 8
    );

    // Compute automatic nextScene for seamless image preloading
    let anticipatedNextScene: VisualScene | undefined = explicitNextScene;
    if (!anticipatedNextScene) {
      if (stage === 'welcome') anticipatedNextScene = 'sunset';
      else if (stage === 'profile-setup') anticipatedNextScene = 'golden-lights';
      else if (stage === 'greeting') anticipatedNextScene = 'sunset';
      else if (stage === 'questions') {
        const nextIdx = resolvedIndex + 1;
        if (nextIdx >= totalQuestions) {
          anticipatedNextScene = 'cinematic-finale';
        } else {
          const nextRatio = Math.min(1, nextIdx / Math.max(1, totalQuestions - 1));
          const nextPresetIdx = Math.min(
            EMOTIONAL_JOURNEY_STAGES.length - 1,
            Math.floor(nextRatio * (EMOTIONAL_JOURNEY_STAGES.length - 1))
          );
          anticipatedNextScene = EMOTIONAL_JOURNEY_STAGES[nextPresetIdx].scene;
        }
      }
    }

    return {
      activeScene: computedScene,
      nextScene: anticipatedNextScene,
      sceneConfig,
      questionIndex: resolvedIndex,
      totalQuestions,
      progressRatio: ratio,
      stageName: stageInfo.stageName,
      stageSubtitle: stageInfo.stageSubtitle,
      blurPx: dynamicBlur,
      vignetteOpacity: dynamicVignette,
      particlePreset: sceneConfig.particlePreset || stageInfo.particlePreset,
      particleCount: dynamicParticleCount,
      accentColor: sceneConfig.accent || '#FB7185',
      theme: activeTheme,
    };
  }, [
    questionIndex,
    totalQuestions,
    stage,
    currentQuestion,
    activeTheme,
    customScene,
    explicitNextScene,
  ]);

  // Notify parent if onSceneChange callback is registered
  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(journeyState);
    }
  }, [journeyState, onSceneChange]);

  // Preload upcoming scene
  useEffect(() => {
    if (journeyState.nextScene) {
      preloadScene(journeyState.nextScene);
    }
  }, [journeyState.nextScene]);

  // Crossfade state for smooth visual scene transitions
  const [activeSceneId, setActiveSceneId] = useState<VisualScene>(journeyState.activeScene);
  const [prevSceneId, setPrevSceneId] = useState<VisualScene | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  useEffect(() => {
    if (journeyState.activeScene !== activeSceneId) {
      setPrevSceneId(activeSceneId);
      setActiveSceneId(journeyState.activeScene);
      setIsCrossfading(true);

      const timer = setTimeout(() => {
        setIsCrossfading(false);
        setPrevSceneId(null);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [journeyState.activeScene, activeSceneId]);

  const activeSceneConfig = getSceneConfig(activeSceneId, activeTheme);
  const prevSceneConfig = prevSceneId ? getSceneConfig(prevSceneId, activeTheme) : null;

  // Desktop subtle pointer parallax offset (lerped)
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isTouch) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rAFId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      const intensity = activeSceneConfig.parallaxIntensity || 0.1;
      const maxOffset = 14 * intensity;
      targetX = nx * maxOffset;
      targetY = ny * maxOffset;
    };

    const animateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setParallaxOffset({ x: currentX, y: currentY });
      rAFId = requestAnimationFrame(animateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rAFId = requestAnimationFrame(animateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rAFId);
    };
  }, [activeSceneConfig.parallaxIntensity]);

  // Canvas particle engine
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    const setupDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupDimensions();
    window.addEventListener('resize', setupDimensions, { passive: true });

    const palette = SCENE_PALETTES[activeSceneId] || SCENE_PALETTES.sunset;
    const preset = journeyState.particlePreset;

    // Scale particle count dynamically according to question progression and device viewport
    const isDesktop = window.innerWidth >= 1024;
    const isUltraWide = window.innerWidth >= 1440;
    const desktopBonus = isUltraWide ? 8 : isDesktop ? 4 : 0;
    const rawCount = isMobile
      ? Math.round(journeyState.particleCount * 0.55)
      : journeyState.particleCount + desktopBonus;
    const count = Math.max(14, rawCount);

    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const color = palette[i % palette.length];
      const layerRoll = Math.random();
      const layer: 'deep' | 'mid' | 'foreground' =
        layerRoll > 0.82 ? 'foreground' : layerRoll > 0.35 ? 'mid' : 'deep';

      let radius = 0;
      let baseAlpha = 0;
      let speed = 0;

      if (preset === 'petals') {
        radius = layer === 'foreground' ? 14 : layer === 'mid' ? 9 : 5.5;
        baseAlpha = layer === 'foreground' ? 0.36 : layer === 'mid' ? 0.24 : 0.14;
        speed = layer === 'foreground' ? 0.65 : layer === 'mid' ? 0.38 : 0.22;
      } else if (preset === 'stars') {
        radius = layer === 'foreground' ? 3.5 : layer === 'mid' ? 2.2 : 1.2;
        baseAlpha = layer === 'foreground' ? 0.78 : layer === 'mid' ? 0.52 : 0.32;
        speed = 0.08;
      } else if (preset === 'champagne') {
        radius = layer === 'foreground' ? 5.2 : layer === 'mid' ? 3.6 : 2.2;
        baseAlpha = layer === 'foreground' ? 0.55 : layer === 'mid' ? 0.38 : 0.22;
        speed = layer === 'foreground' ? 0.95 : layer === 'mid' ? 0.65 : 0.38;
      } else if (preset === 'fireflies') {
        radius = layer === 'foreground' ? 4.5 : layer === 'mid' ? 3.0 : 1.8;
        baseAlpha = layer === 'foreground' ? 0.65 : layer === 'mid' ? 0.45 : 0.25;
        speed = layer === 'foreground' ? 0.35 : layer === 'mid' ? 0.22 : 0.14;
      } else {
        // bokeh
        radius =
          layer === 'foreground'
            ? Math.random() * 32 + 26
            : layer === 'mid'
            ? Math.random() * 20 + 14
            : Math.random() * 12 + 6;
        baseAlpha = layer === 'foreground' ? 0.16 : layer === 'mid' ? 0.22 : 0.12;
        speed = layer === 'foreground' ? 0.32 : layer === 'mid' ? 0.2 : 0.1;
      }

      particles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        vy: preset === 'champagne' ? -speed : -speed * 0.7,
        radius,
        layer,
        baseAlpha,
        currentAlpha: baseAlpha,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulsePhase: Math.random() * Math.PI * 2,
        swayFreq: 0.008 + Math.random() * 0.012,
        swayAmp: preset === 'petals' ? 24 + Math.random() * 20 : 12 + Math.random() * 14,
        swayPhase: Math.random() * Math.PI * 2,
        r: color.r,
        g: color.g,
        b: color.b,
        hasRim: layer === 'foreground' && preset === 'bokeh',
        type: preset,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.y += p.vy;
          if (p.y + p.radius * 2 < 0) {
            p.y = height + p.radius * 2;
            p.x = Math.random() * width;
            p.baseX = p.x;
          } else if (p.y - p.radius * 2 > height && p.vy > 0) {
            p.y = -p.radius * 2;
            p.x = Math.random() * width;
            p.baseX = p.x;
          }

          p.x = p.baseX + Math.sin(time * p.swayFreq + p.swayPhase) * p.swayAmp;
          p.rotation += p.rotationSpeed;
        }

        p.currentAlpha =
          p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulsePhase) * (p.baseAlpha * 0.35);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'petals') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.4, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha)})`;
          ctx.fill();
        } else if (p.type === 'stars' || p.type === 'fireflies') {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha)})`;
          ctx.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, 0.85)`;
          ctx.shadowBlur = p.radius * 3.5;
          ctx.fill();
        } else {
          // Soft bokeh circle with feathering
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
          grad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha)})`);
          grad.addColorStop(0.7, `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha * 0.5)})`);
          grad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);

          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          if (p.hasRim) {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 0.95, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha * 0.35)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setupDimensions);
    };
  }, [activeSceneId, journeyState.particlePreset, journeyState.particleCount]);

  return (
    <SceneManagerContext.Provider value={journeyState}>
      {/* Background Scenic Engine (Fixed, non-interactive, layered) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
      >
        {/* Layer 1: Photographic Responsive Visual Scene with Parallax & Dynamic Depth Blur */}
        <div
          className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0) scale(1.06)`,
            filter: `blur(${journeyState.blurPx}px)`,
            transition: 'filter 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease-out',
          }}
        >
          {/* Previous scene for smooth crossfade */}
          {prevSceneConfig && isCrossfading && (
            <picture className="block absolute inset-0 w-full h-full object-cover transition-opacity duration-900 opacity-0 z-0 pointer-events-none select-none">
              <source media="(min-width: 1440px)" srcSet={prevSceneConfig.desktopImage} />
              <source media="(min-width: 1024px)" srcSet={prevSceneConfig.desktopImage} />
              <source media="(min-width: 640px)" srcSet={prevSceneConfig.tabletImage} />
              <img
                src={prevSceneConfig.mobileImage}
                alt=""
                className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.08] select-none pointer-events-none"
                loading="eager"
              />
            </picture>
          )}

          {/* Active Scene with responsive art direction */}
          <picture
            className={`block absolute inset-0 w-full h-full object-cover transition-opacity duration-900 z-0 pointer-events-none select-none ${
              isCrossfading ? 'animate-fade-in' : 'opacity-100'
            }`}
          >
            <source media="(min-width: 1440px)" srcSet={activeSceneConfig.desktopImage} />
            <source media="(min-width: 1024px)" srcSet={activeSceneConfig.desktopImage} />
            <source media="(min-width: 640px)" srcSet={activeSceneConfig.tabletImage} />
            <img
              src={activeSceneConfig.mobileImage}
              alt=""
              className="w-full h-full object-cover object-center filter brightness-[0.64] contrast-[1.08] select-none pointer-events-none"
              loading="eager"
            />
          </picture>
        </div>

        {/* Layer 2: Atmospheric Depth Gradient Wash */}
        <div
          className={`absolute inset-0 ${activeSceneConfig.overlay} transition-all duration-1000 z-[1]`}
        />

        {/* Layer 3: Dynamic Ambient Light Blooms scaled to emotional progression */}
        <div
          className={`absolute -top-32 -left-20 w-[38rem] h-[38rem] rounded-full blur-[130px] ${
            themeConfig.ambientOrbs?.orb1 || 'bg-rose-500/15'
          } transition-all duration-1000 animate-pulse-glow z-[2]`}
          style={{
            opacity: 0.7 + journeyState.progressRatio * 0.4,
          }}
        />
        <div
          className={`absolute -bottom-32 -right-20 w-[42rem] h-[42rem] rounded-full blur-[150px] ${
            themeConfig.ambientOrbs?.orb2 || 'bg-purple-500/15'
          } transition-all duration-1000 animate-pulse-glow z-[2]`}
          style={{
            animationDelay: '4s',
            opacity: 0.65 + journeyState.progressRatio * 0.4,
          }}
        />

        {/* Layer 4: Dynamic Aperture Mask & Radial Focus Vignette */}
        <div
          className="absolute inset-0 z-[3] transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, transparent 28%, rgba(5, 4, 7, ${journeyState.vignetteOpacity}) 100%)`,
          }}
        />

        {/* Layer 5: Dynamic Frosted Glass Aperture Layer for WCAG Legibility */}
        <div
          className="absolute inset-0 z-[4] pointer-events-none transition-opacity duration-1000"
          style={{
            backdropFilter: `blur(${Math.max(0, journeyState.blurPx * 0.35)}px)`,
            WebkitBackdropFilter: `blur(${Math.max(0, journeyState.blurPx * 0.35)}px)`,
            opacity: 0.85,
          }}
        />

        {/* Layer 6: Atmospheric Canvas Particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-[5]"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* If children provided, render container structure */}
      {children && (
        <div className={`relative w-full min-h-full ${className}`}>
          {children}
        </div>
      )}
    </SceneManagerContext.Provider>
  );
};
