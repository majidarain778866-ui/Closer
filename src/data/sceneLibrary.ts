import { VisualScene, SceneConfig, ExperienceTheme } from '../types';

/**
 * Visual Scene Library - Cinematic Art Direction
 * Each scene provides responsive imagery (Desktop, Tablet, Mobile),
 * tailored layered atmosphere overlays, subtle particle presets,
 * and custom desktop layout directives (Split, Floating Glass, Center).
 */
export const SCENE_LIBRARY: Record<VisualScene, SceneConfig> = {
  sunset: {
    sceneId: 'sunset',
    name: 'Sunset Horizon',
    description: 'Golden hour twilight sinking quietly into the coastal waves',
    desktopImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-t from-[#090514]/90 via-[#130924]/60 to-[#04020a]/80 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,3,15,0.85) 100%)',
    accent: '#FB923C',
    blurAmount: '0px',
    parallaxIntensity: 0.12,
    particlePreset: 'bokeh',
    transitionStyle: 'crossfade',
    layoutMode: 'split-cinematic',
    theme: 'sunset',
    questionCategory: 'cute',
    desktopPanelPosition: 'right',
    scenicFocalFocus: {
      tag: 'Golden Hour Atmosphere',
      title: 'Warm horizon & gentle dusk',
      caption: 'The sky softens into quiet amber, waiting for your honest answer.',
      quote: '“Where the light lingers just long enough to hold your gaze.”',
    },
  },

  food: {
    sceneId: 'food',
    name: 'Warm Bistro Glow',
    description: 'An intimate candlelit table with artisan wood and evening warmth',
    desktopImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-tr from-[#0b0714]/92 via-[#160c24]/65 to-[#040208]/85 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,5,15,0.9) 100%)',
    accent: '#F43F5E',
    blurAmount: '0px',
    parallaxIntensity: 0.08,
    particlePreset: 'bokeh',
    transitionStyle: 'crossfade',
    layoutMode: 'floating-glass',
    theme: 'midnight-rose',
    questionCategory: 'fun',
    desktopPanelPosition: 'center',
    scenicFocalFocus: {
      tag: 'Intimate Gathering',
      title: 'Flavors, comfort & zero rules',
      caption: 'Dimmed amber lights, artisan crusts, and unapologetic indulgence.',
      quote: '“Good taste is an unspoken conversation.”',
    },
  },

  'golden-lights': {
    sceneId: 'golden-lights',
    name: 'Evening Cafe Lights',
    description: 'Warm luminous lanterns and golden bokeh suspended in twilight air',
    desktopImage:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-r from-[#0c0817]/90 via-[#180f2b]/60 to-[#05030d]/85 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 35%, rgba(7,4,16,0.85) 100%)',
    accent: '#FBBF24',
    blurAmount: '0px',
    parallaxIntensity: 0.14,
    particlePreset: 'fireflies',
    transitionStyle: 'blur-zoom',
    layoutMode: 'split-cinematic',
    theme: 'golden-twilight',
    questionCategory: 'personal',
    desktopPanelPosition: 'right',
    scenicFocalFocus: {
      tag: 'Golden Resonance',
      title: 'Effortless quiet & spark',
      caption: 'Moments where silence is just as comfortable as deep conversation.',
      quote: '“True connection needs no script or rehearsal.”',
    },
  },

  'city-night': {
    sceneId: 'city-night',
    name: 'Skyline Terrace',
    description: 'Panoramic glowing skyline at midnight beneath purple haze',
    desktopImage:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-b from-[#050410]/85 via-[#0e0a24]/65 to-[#020208]/92 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 35%, rgba(4,3,10,0.88) 100%)',
    accent: '#A855F7',
    blurAmount: '0px',
    parallaxIntensity: 0.1,
    particlePreset: 'bokeh',
    transitionStyle: 'crossfade',
    layoutMode: 'floating-glass',
    theme: 'velvet-violet',
    questionCategory: 'playful',
    desktopPanelPosition: 'left',
    scenicFocalFocus: {
      tag: 'Electric Skyline',
      title: 'Midnight air & distant city lights',
      caption: 'The restless city blurs into the background when someone catches your gaze.',
      quote: '“A thousand windows glowing, but only one view that matters.”',
    },
  },

  'rose-petals': {
    sceneId: 'rose-petals',
    name: 'Midnight Rose Garden',
    description: 'Velvety midnight crimson blooms touched by silver moonlight',
    desktopImage:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-tr from-[#12040c]/90 via-[#220718]/65 to-[#050106]/88 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 30%, rgba(10,2,8,0.9) 100%)',
    accent: '#FB7185',
    blurAmount: '0px',
    parallaxIntensity: 0.1,
    particlePreset: 'petals',
    transitionStyle: 'soft-curtain',
    layoutMode: 'floating-glass',
    theme: 'midnight-rose',
    questionCategory: 'flirty',
    desktopPanelPosition: 'center',
    scenicFocalFocus: {
      tag: 'Unfiltered Tease',
      title: 'Heartbeat skip & breathless smiles',
      caption: 'There’s no escaping the pull when you lean in just a few inches closer.',
      quote: '“Some sparks don’t need an explanation.”',
    },
  },

  moonlight: {
    sceneId: 'moonlight',
    name: 'Moonlit Waters',
    description: 'Full moon casting a silver trail across calm, dark waters',
    desktopImage:
      'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-l from-[#040817]/90 via-[#0c142e]/60 to-[#02040d]/88 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(ellipse at center, transparent 35%, rgba(3,6,15,0.88) 100%)',
    accent: '#38BDF8',
    blurAmount: '0px',
    parallaxIntensity: 0.12,
    particlePreset: 'stars',
    transitionStyle: 'crossfade',
    layoutMode: 'split-cinematic',
    theme: 'moonlit',
    questionCategory: 'spicy',
    desktopPanelPosition: 'right',
    scenicFocalFocus: {
      tag: 'Silver Horizon',
      title: 'Midnight secrets & quiet bravery',
      caption: 'When the world is asleep, chemistry speaks in a voice you can’t ignore.',
      quote: '“The tide always returns to where it belongs.”',
    },
  },

  'dreamy-stars': {
    sceneId: 'dreamy-stars',
    name: 'Celestial Twilight',
    description: 'Vast starlit nebula with deep violet dust and distant constellations',
    desktopImage:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-t from-[#060312]/92 via-[#120726]/65 to-[#020108]/90 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 35%, rgba(5,2,14,0.9) 100%)',
    accent: '#EC4899',
    blurAmount: '0px',
    parallaxIntensity: 0.15,
    particlePreset: 'stars',
    transitionStyle: 'crossfade',
    layoutMode: 'floating-glass',
    theme: 'dreamy',
    questionCategory: 'romantic',
    desktopPanelPosition: 'center',
    scenicFocalFocus: {
      tag: 'Pure Vulnerability',
      title: 'Safe hands & falling slowly',
      caption: 'Letting your guard down is the bravest, most beautiful thing you can do.',
      quote: '“Look up. Out of millions of stars, you ended up here.”',
    },
  },

  'cinematic-finale': {
    sceneId: 'cinematic-finale',
    name: 'Starlit Champagne Terrace',
    description: 'Grand romantic celebration illuminated by warm crystalline lights',
    desktopImage:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-tr from-[#12030d]/92 via-[#22071a]/70 to-[#060107]/92 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 25%, rgba(8,1,7,0.92) 100%)',
    accent: '#F43F5E',
    blurAmount: '0px',
    parallaxIntensity: 0.1,
    particlePreset: 'champagne',
    transitionStyle: 'crossfade',
    layoutMode: 'center-cinematic',
    theme: 'midnight-rose',
    questionCategory: 'final',
    desktopPanelPosition: 'center',
    scenicFocalFocus: {
      tag: 'Grand Romantic Finale',
      title: 'Unforgettable memories waiting',
      caption: 'Every answer led to this moment. The rest of the story begins now.',
      quote: '“The best adventures start with a brave YES.”',
    },
  },

  'candlelit-cafe': {
    sceneId: 'candlelit-cafe',
    name: 'Candlelit Bistro',
    description: 'Intimate evening corner illuminated by warm amber candles',
    desktopImage:
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-b from-[#090510]/90 via-[#180d24]/65 to-[#04020a]/88 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(ellipse at center, transparent 35%, rgba(8,4,16,0.9) 100%)',
    accent: '#F59E0B',
    blurAmount: '0px',
    parallaxIntensity: 0.08,
    particlePreset: 'bokeh',
    transitionStyle: 'crossfade',
    layoutMode: 'floating-glass',
    theme: 'golden-twilight',
    questionCategory: 'personal',
    desktopPanelPosition: 'left',
    scenicFocalFocus: {
      tag: 'Quiet Intimacy',
      title: 'Gentle flame & warm timber',
      caption: 'Where whispers feel louder than the bustling world outside.',
      quote: '“Candlelight turns ordinary moments into memories.”',
    },
  },

  'ocean-dusk': {
    sceneId: 'ocean-dusk',
    name: 'Ocean Dusk',
    description: 'Pastel purple and rose dusk settling gently over serene ocean swells',
    desktopImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    tabletImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    mobileImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    overlay:
      'bg-gradient-to-t from-[#050614]/90 via-[#0e132b]/60 to-[#02030a]/88 backdrop-blur-[0.5px]',
    vignette: 'radial-gradient(circle at center, transparent 35%, rgba(3,5,15,0.85) 100%)',
    accent: '#818CF8',
    blurAmount: '0px',
    parallaxIntensity: 0.12,
    particlePreset: 'bokeh',
    transitionStyle: 'crossfade',
    layoutMode: 'split-cinematic',
    theme: 'moonlit',
    questionCategory: 'romantic',
    desktopPanelPosition: 'right',
    scenicFocalFocus: {
      tag: 'Tranquil Waters',
      title: 'Calm tides & endless horizons',
      caption: 'The rhythmic sound of waves creating space for your thoughts.',
      quote: '“There is an art in slowing down together.”',
    },
  },
};

/**
 * Retrieve scene configuration with theme adjustments if needed
 */
export function getSceneConfig(sceneId?: VisualScene, theme?: ExperienceTheme): SceneConfig {
  const defaultScene = SCENE_LIBRARY.sunset;
  if (!sceneId || !SCENE_LIBRARY[sceneId]) {
    return defaultScene;
  }
  const config = SCENE_LIBRARY[sceneId];
  if (theme) {
    return {
      ...config,
      theme,
    };
  }
  return config;
}

/**
 * Preload scene images to ensure instant, stutter-free cinematic transitions
 */
export function preloadScene(sceneId: VisualScene): void {
  if (typeof window === 'undefined') return;
  const config = SCENE_LIBRARY[sceneId];
  if (!config) return;

  const linkDesktop = new Image();
  linkDesktop.src = config.desktopImage;

  const linkTablet = new Image();
  linkTablet.src = config.tabletImage;

  const linkMobile = new Image();
  linkMobile.src = config.mobileImage;
}
