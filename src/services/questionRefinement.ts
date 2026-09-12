import { QuestionCategory, VibeMode } from '../types';

export type RefinementGoal = 'playful' | 'romantic' | 'shorter' | 'mysterious' | 'warmer';

export interface QuestionRefinementSuggestion {
  text: string;
  subtitle: string;
  style: 'playful' | 'romantic' | 'subtle' | 'mysterious' | 'warmer';
  explanation: string;
}

/**
 * Suggests improved, emotionally resonant question phrasing preserving the creator's original intent.
 */
export function suggestQuestionRefinements(
  currentText: string,
  currentSubtitle: string = '',
  category: QuestionCategory = 'flirty',
  vibe: VibeMode = 'Romantic',
  goal?: RefinementGoal
): QuestionRefinementSuggestion[] {
  const clean = currentText.trim().replace(/[?!. ]+$/, '');

  // If specific goal is chosen, return dedicated variants
  if (goal === 'playful') {
    return [
      {
        text: `Be completely honest… ${clean}? 😏`,
        subtitle: currentSubtitle || 'I promise not to judge your answer too much.',
        style: 'playful',
        explanation: 'Adds a cheeky teasing opening that removes stiffness.',
      },
      {
        text: `Quick reality check: ${clean}? 👀`,
        subtitle: 'First thought that enters your mind counts.',
        style: 'playful',
        explanation: 'High energy prompt that encourages fast, spontaneous tapping.',
      },
      {
        text: `Okay, between us two… ${clean}? 😏💫`,
        subtitle: 'Don’t overthink it, just tell me.',
        style: 'playful',
        explanation: 'Creates a playful conspiratorial dynamic.',
      },
    ];
  }

  if (goal === 'romantic') {
    return [
      {
        text: `If I’m being completely honest… ${clean}? ❤️`,
        subtitle: currentSubtitle || 'Take a breath before answering this one.',
        style: 'romantic',
        explanation: 'Deepens the vulnerability and intimacy of the moment.',
      },
      {
        text: `Looking back at this moment… ${clean}? 🌹`,
        subtitle: 'Only what your heart feels matters.',
        style: 'romantic',
        explanation: 'Cinematic, gentle phrasing tailored for a memorable reveal.',
      },
      {
        text: `If the connection between us is as real as it feels… ${clean}? ✨`,
        subtitle: 'Just curious if we are on the exact same page.',
        style: 'romantic',
        explanation: 'Confidence with gentle romance.',
      },
    ];
  }

  if (goal === 'shorter') {
    // Shorten question to essential punchy core
    const shortCore = clean.replace(/^(do you think|would you say|tell me|if you had to choose|what do you think of)\s+/i, '');
    return [
      {
        text: `${shortCore.charAt(0).toUpperCase() + shortCore.slice(1)}? ✨`,
        subtitle: '',
        style: 'subtle',
        explanation: 'Clean, stripped of filler words, perfect for compact mobile viewports.',
      },
      {
        text: `Honestly… ${shortCore.toLowerCase()}? 👀`,
        subtitle: '',
        style: 'subtle',
        explanation: 'Ultra-concise single line with immediate visual clarity.',
      },
      {
        text: `${clean}? ❤️`,
        subtitle: '',
        style: 'subtle',
        explanation: 'Direct question without unnecessary subtitles.',
      },
    ];
  }

  if (goal === 'mysterious') {
    return [
      {
        text: `There’s something I’ve been wondering about you… ${clean}? 🌙`,
        subtitle: currentSubtitle || 'A little secret I’m curious to discover.',
        style: 'mysterious',
        explanation: 'Fosters curiosity and intrigue right before answering.',
      },
      {
        text: `${clean}… or is that a story for late at night? ✨`,
        subtitle: 'Some things are better left slightly unsaid.',
        style: 'mysterious',
        explanation: 'Leaves an open loop that lingers in the recipient’s thoughts.',
      },
      {
        text: `Don’t answer immediately: ${clean}? 🕯️`,
        subtitle: 'Let the silence answer first.',
        style: 'mysterious',
        explanation: 'Cinematic pacing that heightens emotional suspense.',
      },
    ];
  }

  if (goal === 'warmer') {
    return [
      {
        text: `You always make me smile, so tell me… ${clean}? ✨`,
        subtitle: currentSubtitle || 'Just wanted to know a little more of you.',
        style: 'warmer',
        explanation: 'Opens with sincere appreciation and mutual safety.',
      },
      {
        text: `I’ve really enjoyed getting to know you: ${clean}? ❤️`,
        subtitle: 'No pressure at all, just genuine curiosity.',
        style: 'warmer',
        explanation: 'Grounds the experience in comforting warmth.',
      },
      {
        text: `From the heart… ${clean}? 🌸`,
        subtitle: 'Take all the time you need.',
        style: 'warmer',
        explanation: 'Tender tone ideal for friendship or sweet connections.',
      },
    ];
  }

  // Default balanced set (playful, romantic, subtle)
  if (category === 'cute' || category === 'fun') {
    return [
      {
        text: `Be completely honest… ${clean}? 😏`,
        subtitle: currentSubtitle || 'No wrong answers, just your genuine vibe.',
        style: 'playful',
        explanation: 'Adds a light teasing hook that breaks the ice effortlessly.',
      },
      {
        text: `If you had to pick without overthinking: ${clean}? ✨`,
        subtitle: currentSubtitle || 'First instinct always reveals the truth.',
        style: 'subtle',
        explanation: 'Reduces pressure and encourages fast, spontaneous engagement.',
      },
      {
        text: `Quick secret check… ${clean}? ❤️`,
        subtitle: currentSubtitle || 'Just between the two of us.',
        style: 'romantic',
        explanation: 'Frames a simple preference as an intimate shared moment.',
      },
    ];
  }

  if (category === 'attraction' || category === 'playful' || category === 'flirty') {
    return [
      {
        text: `Okay… be real with me. ${clean}? 👀❤️`,
        subtitle: currentSubtitle || 'I promise I won’t tease you too much.',
        style: 'playful',
        explanation: 'Playfully calls out mutual attraction with a warm wink.',
      },
      {
        text: `Now the question I’ve really been waiting to ask… ${clean}? 😏`,
        subtitle: currentSubtitle || 'Curiosity is getting the best of me right now.',
        style: 'romantic',
        explanation: 'Builds dramatic romantic anticipation before the answer.',
      },
      {
        text: `If you’re telling the absolute truth: ${clean}? ✨`,
        subtitle: currentSubtitle || 'Your secret is safe right here.',
        style: 'subtle',
        explanation: 'Invites honesty with a touch of playful mystery.',
      },
    ];
  }

  // Romantic / Climax
  return [
    {
      text: `Looking back at this moment… ${clean}? ❤️`,
      subtitle: currentSubtitle || 'Take a breath before answering this one.',
      style: 'romantic',
      explanation: 'Deepens the cinematic emotional resonance of the climax.',
    },
    {
      text: `Between you and me, without any reservations: ${clean}? 🌹`,
      subtitle: currentSubtitle || 'Only your heart needs to answer.',
      style: 'playful',
      explanation: 'Combines direct vulnerability with reassuring privacy.',
    },
    {
      text: `If the chemistry between us is as real as it feels… ${clean}? ✨`,
      subtitle: currentSubtitle || 'Just wondering if we’re on the exact same page.',
      style: 'subtle',
      explanation: 'Acknowledges the mutual spark with confidence and charm.',
    },
  ];
}

/**
 * Suggests playful, romantic, natural, or punchy alternatives for answer options
 */
export function suggestOptionRefinements(
  currentLabel: string,
  tone: 'playful' | 'romantic' | 'natural' | 'shorter'
): string[] {
  const base = currentLabel.trim().replace(/[^\w\s]/gi, '').trim();

  if (tone === 'playful') {
    return [
      `Definitely ${base.toLowerCase()} 😏`,
      `Hands down ${base.toLowerCase()} 👀`,
      `Is it obvious I love ${base.toLowerCase()}? 💫`,
      `${base} all the way! ⚡`,
    ];
  }

  if (tone === 'romantic') {
    return [
      `A quiet evening with ${base.toLowerCase()} ❤️`,
      `${base} with someone special 🌹`,
      `Nothing beats ${base.toLowerCase()} with you ✨`,
      `Lost in the moment with ${base.toLowerCase()} 🌙`,
    ];
  }

  if (tone === 'shorter') {
    return [
      `${base}`,
      `Just ${base.toLowerCase()}`,
      `${base} ✨`,
      `${base} ❤️`,
    ];
  }

  // Natural
  return [
    `${base}`,
    `Probably ${base.toLowerCase()}`,
    `${base}, for sure`,
    `Always ${base.toLowerCase()}`,
  ];
}
