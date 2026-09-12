import React, { useEffect, useRef, useState } from 'react';
import { VisualScene, ExperienceTheme } from '../types';
import { getThemeConfig } from '../data/themes';
import { getSceneConfig, preloadScene, SCENE_LIBRARY } from '../data/sceneLibrary';

interface SceneBackgroundProps {
  scene: VisualScene;
  nextScene?: VisualScene;
  theme?: ExperienceTheme | string;
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

// Scene-specific color palette definitions for the bokeh particles
const SCENE_PALETTES: Record<VisualScene, { r: number; g: number; b: number }[]> = {
  sunset: [
    { r: 251, g: 146, b: 60 }, // amber gold
    { r: 244, g: 63, b: 94 }, // rose coral
    { r: 253, g: 186, b: 116 }, // warm peach
    { r: 236, g: 72, b: 153 }, // magenta rose
  ],
  food: [
    { r: 245, g: 158, b: 11 }, // candlelight amber
    { r: 225, g: 29, b: 72 }, // deep wine ruby
    { r: 252, g: 211, b: 77 }, // warm honey
    { r: 249, g: 115, b: 22 }, // candle flame
  ],
  'golden-lights': [
    { r: 252, g: 211, b: 77 }, // champagne gold
    { r: 245, g: 158, b: 11 }, // rich topaz
    { r: 254, g: 240, b: 138 }, // luminous ivory
    { r: 251, g: 191, b: 36 }, // golden amber
  ],
  'city-night': [
    { r: 192, g: 132, b: 252 }, // electric violet
    { r: 129, g: 140, b: 248 }, // indigo bloom
    { r: 165, g: 180, b: 252 }, // soft periwinkle
    { r: 232, g: 121, b: 249 }, // neon rose
  ],
  'rose-petals': [
    { r: 244, g: 63, b: 94 }, // velvet rose
    { r: 251, g: 113, b: 133 }, // blush pink
    { r: 225, g: 29, b: 72 }, // deep crimson
    { r: 244, g: 114, b: 182 }, // petal magenta
  ],
  moonlight: [
    { r: 216, g: 180, b: 254 }, // ethereal lavender
    { r: 199, g: 210, b: 254 }, // moonlight blue
    { r: 226, g: 232, b: 240 }, // silver pearl
    { r: 167, g: 139, b: 250 }, // twilight violet
  ],
  'dreamy-stars': [
    { r: 168, g: 85, b: 247 }, // starlight violet
    { r: 244, g: 114, b: 182 }, // luminous pink
    { r: 255, g: 255, b: 255 }, // celestial white
    { r: 192, g: 132, b: 252 }, // soft nebula
  ],
  'cinematic-finale': [
    { r: 244, g: 63, b: 94 }, // royal rose
    { r: 250, g: 204, b: 21 }, // imperial gold
    { r: 251, g: 113, b: 133 }, // champagne blush
    { r: 236, g: 72, b: 153 }, // celebration magenta
  ],
  'candlelit-cafe': [
    { r: 245, g: 158, b: 11 }, // amber flame
    { r: 217, g: 119, b: 6 }, // warm honey
    { r: 253, g: 186, b: 116 }, // candle glow
    { r: 244, g: 63, b: 94 }, // blush rose
  ],
  'ocean-dusk': [
    { r: 129, g: 140, b: 248 }, // indigo horizon
    { r: 165, g: 180, b: 252 }, // lavender waves
    { r: 244, g: 114, b: 182 }, // dusk pink
    { r: 56, g: 189, b: 248 }, // sky blue
  ],
};

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  scene,
  nextScene,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Crossfade state between active and previous scene
  const [activeSceneId, setActiveSceneId] = useState<VisualScene>(scene);
  const [prevSceneId, setPrevSceneId] = useState<VisualScene | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Desktop subtle pointer parallax offset
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sceneConfig = getSceneConfig(activeSceneId, theme as ExperienceTheme);
  const prevSceneConfig = prevSceneId ? getSceneConfig(prevSceneId, theme as ExperienceTheme) : null;
  const themeConfig = getThemeConfig(theme as ExperienceTheme);

  // Preload next scene image
  useEffect(() => {
    if (nextScene) {
      preloadScene(nextScene);
    }
  }, [nextScene]);

  // Handle scene change with smooth crossfade
  useEffect(() => {
    if (scene !== activeSceneId) {
      setPrevSceneId(activeSceneId);
      setActiveSceneId(scene);
      setIsCrossfading(true);

      const timer = setTimeout(() => {
        setIsCrossfading(false);
        setPrevSceneId(null);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [scene, activeSceneId]);

  // Desktop subtle pointer parallax tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if mouse device and reduced-motion not requested
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
      // Calculate normalized coords between -1 and 1
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      // Max displacement is 12px for subtle cinematic feel without motion sickness
      const maxOffset = 12 * (sceneConfig.parallaxIntensity || 0.1);
      targetX = nx * maxOffset;
      targetY = ny * maxOffset;
    };

    const animateParallax = () => {
      // Smooth lerp
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
  }, [sceneConfig.parallaxIntensity]);

  // Canvas particle engine
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

    // Palette & particle configuration
    const palette = SCENE_PALETTES[activeSceneId] || SCENE_PALETTES.sunset;
    const preset = sceneConfig.particlePreset || 'bokeh';

    // Particle count scaled according to device viewport
    const count = isMobile ? 18 : 34;

    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const color = palette[i % palette.length];
      const layerRoll = Math.random();
      const layer: 'deep' | 'mid' | 'foreground' =
        layerRoll > 0.8 ? 'foreground' : layerRoll > 0.35 ? 'mid' : 'deep';

      let radius = 0;
      let baseAlpha = 0;
      let speed = 0;

      if (preset === 'petals') {
        radius = layer === 'foreground' ? 14 : layer === 'mid' ? 9 : 5;
        baseAlpha = layer === 'foreground' ? 0.35 : layer === 'mid' ? 0.22 : 0.12;
        speed = layer === 'foreground' ? 0.6 : layer === 'mid' ? 0.35 : 0.2;
      } else if (preset === 'stars') {
        radius = layer === 'foreground' ? 3.5 : layer === 'mid' ? 2.2 : 1.2;
        baseAlpha = layer === 'foreground' ? 0.75 : layer === 'mid' ? 0.5 : 0.3;
        speed = 0.08;
      } else if (preset === 'champagne') {
        radius = layer === 'foreground' ? 5 : layer === 'mid' ? 3.5 : 2;
        baseAlpha = layer === 'foreground' ? 0.5 : layer === 'mid' ? 0.35 : 0.2;
        speed = layer === 'foreground' ? 0.9 : layer === 'mid' ? 0.6 : 0.35;
      } else {
        // bokeh / fireflies
        radius =
          layer === 'foreground'
            ? Math.random() * 32 + 28
            : layer === 'mid'
            ? Math.random() * 20 + 14
            : Math.random() * 12 + 6;
        baseAlpha = layer === 'foreground' ? 0.16 : layer === 'mid' ? 0.22 : 0.12;
        speed = layer === 'foreground' ? 0.35 : layer === 'mid' ? 0.22 : 0.12;
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
        swayAmp: preset === 'petals' ? 24 + Math.random() * 20 : 12 + Math.random() * 15,
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
          p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulsePhase) * (p.baseAlpha * 0.4);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'petals') {
          // Render rose petal silhouette
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 1.4, p.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha)})`;
          ctx.fill();
        } else if (p.type === 'stars') {
          // Render glowing star sparkle
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0, p.currentAlpha)})`;
          ctx.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, 0.8)`;
          ctx.shadowBlur = p.radius * 3;
          ctx.fill();
        } else {
          // Render soft bokeh circle with subtle feathered rim
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
  }, [activeSceneId, sceneConfig.particlePreset]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* Layer 1: Photographic Responsive Visual Scene with Parallax */}
      <div
        className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
        }}
      >
        {/* Previous Scene during Crossfade */}
        {prevSceneConfig && isCrossfading && (
          <picture className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 z-0">
            <source media="(min-width: 1024px)" srcSet={prevSceneConfig.desktopImage} />
            <source media="(min-width: 640px)" srcSet={prevSceneConfig.tabletImage} />
            <img
              src={prevSceneConfig.mobileImage}
              alt=""
              className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.08]"
              loading="eager"
            />
          </picture>
        )}

        {/* Active Scene with Responsive Viewport Art Direction */}
        <picture
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-0 ${
            isCrossfading ? 'animate-fade-in' : 'opacity-100'
          }`}
        >
          <source media="(min-width: 1024px)" srcSet={sceneConfig.desktopImage} />
          <source media="(min-width: 640px)" srcSet={sceneConfig.tabletImage} />
          <img
            src={sceneConfig.mobileImage}
            alt=""
            className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.08]"
            loading="eager"
          />
        </picture>
      </div>

      {/* Layer 2: Dynamic Atmospheric Color Wash & Gradient Overlay */}
      <div
        className={`absolute inset-0 ${sceneConfig.overlay} transition-all duration-1000 z-[1]`}
      />

      {/* Layer 3: Theme Ambient Light Bloom Orbs for Luxurious Depth */}
      <div
        className={`absolute -top-32 -left-20 w-[36rem] h-[36rem] rounded-full blur-[120px] ${
          themeConfig.ambientOrbs?.orb1 || 'bg-rose-500/15'
        } transition-all duration-1000 animate-pulse-glow z-[2]`}
      />
      <div
        className={`absolute -bottom-32 -right-20 w-[40rem] h-[40rem] rounded-full blur-[140px] ${
          themeConfig.ambientOrbs?.orb2 || 'bg-purple-500/15'
        } transition-all duration-1000 animate-pulse-glow z-[2]`}
        style={{ animationDelay: '4s' }}
      />

      {/* Layer 4: Deep WCAG-Compliant Readability Wash & Vignette */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background: sceneConfig.vignette,
        }}
      />

      {/* Layer 5: Dedicated Atmospheric Canvas (Bokeh, Petals, Twinkling Stars, Champagne) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-[4]"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
};
