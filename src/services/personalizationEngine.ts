import {
  Question,
  QuestionOption,
  ResponseAnswer,
  RecipientProfile,
  SessionProfile,
  PersonalitySnapshot,
  PersonalityTrait,
  DynamicExperienceConfig,
  VisualScene,
  VibeMode,
  AnswerReward,
} from '../types';

/**
 * CLOSER V5 — Dynamic Personalization & Relationship Experience Engine
 * Fully deterministic, highly responsive, privacy-preserving, and non-repetitive.
 */

// Micro-reaction pool categories
const REACTION_POOLS: Record<string, Array<{ message: string; visual: string }>> = {
  cute: [
    { message: 'Cute. ❤️', visual: '❤️' },
    { message: 'That is genuinely lovely ✨', visual: '✨' },
    { message: 'That made me smile a little too much.', visual: '😊' },
    { message: 'A gentle soul with great taste.', visual: '🌸' },
  ],
  interesting: [
    { message: 'Interesting… I might remember that one. 👀', visual: '👀' },
    { message: 'Now that tells me something.', visual: '✨' },
    { message: 'Fascinating choice… noted.', visual: '💫' },
    { message: 'Okay… we’re getting somewhere.', visual: '💭' },
  ],
  surprised: [
    { message: 'I didn’t expect that from you!', visual: '🫢' },
    { message: 'Bold move. I like your confidence. 👀', visual: '⚡' },
    { message: 'Pleasantly surprised… intrigued.', visual: '✨' },
  ],
  teasing: [
    { message: 'Okayyy… someone knows what they want. 😏', visual: '😏' },
    { message: 'Trouble. Absolute trouble. 😏', visual: '🔥' },
    { message: 'I see how it is… noted.', visual: '👀' },
    { message: 'You’re making this very interesting.', visual: '💫' },
  ],
  flirty: [
    { message: 'Now we’re definitely getting closer. 😏', visual: '😏' },
    { message: 'You really know how to keep my attention.', visual: '🔥' },
    { message: 'Chemistry never lies. 👀', visual: '✨' },
    { message: 'My heart skipped a beat just reading that. 💓', visual: '💓' },
  ],
  romantic: [
    { message: 'I had a feeling. ❤️', visual: '❤️' },
    { message: 'That feels truly special 🌹', visual: '🌹' },
    { message: 'Rare, beautiful, and genuine.', visual: '✨' },
    { message: 'My favorite answer so far ❤️', visual: '🌹' },
  ],
  emotional: [
    { message: 'Feeling understood is the greatest gift. 🤍', visual: '🤍' },
    { message: 'Letting your guard down is brave. Safe with me. 🤍', visual: '💫' },
    { message: 'That touched my heart in the best way.', visual: '✨' },
  ],
};

// Tag-specific contextual micro-reactions
const TAG_REACTIONS: Record<string, Array<{ message: string; visual: string }>> = {
  pizza: [
    { message: 'Pizza person… good choice. I like your taste. 😏', visual: '🍕' },
    { message: 'Crispy crust, hot honey, and good company… noted. 🍕', visual: '🍕' },
  ],
  foodie: [
    { message: 'Zero pretenses, pure indulgence. You really know how to live. 🍔', visual: '🍔' },
  ],
  sushi: [
    { message: 'Midnight sushi rolls… sophisticated and late-night. Elite taste. 🍣', visual: '🍣' },
  ],
  dessert: [
    { message: 'Starting straight with dessert? You might just be trouble. 🍨', visual: '🍨' },
  ],
  sunset: [
    { message: 'Sunset person… golden skies and soft waves. Noted. 🌅', visual: '🌅' },
    { message: 'A warm horizon and quiet breeze… pure romance. 🌅', visual: '🌅' },
  ],
  city: [
    { message: 'City lights and high rooftops… electric energy. I like your style. 🌃', visual: '🌃' },
  ],
  beach: [
    { message: 'Beach person… now I’m picturing sunset and good conversation. 🌊', visual: '🌊' },
  ],
  quietNight: [
    { message: 'Late-night people are always the most captivating. 🌙', visual: '🌙' },
  ],
  eyes: [
    { message: 'Eyes never know how to lie… especially yours. 👀', visual: '👀' },
    { message: 'So it’s the eyes that get you first. Interesting… 👀', visual: '👀' },
  ],
  smile: [
    { message: 'A warm, genuine smile can disarm anyone… especially mine. 😊', visual: '😊' },
  ],
  voice: [
    { message: 'Soft, calming whispers in the evening hit completely different. 🎙️', visual: '🎙️' },
  ],
  chemistry: [
    { message: 'Energy never lies. And the chemistry right now is unmistakable. 🪄', visual: '🪄' },
  ],
  humor: [
    { message: 'So making you laugh is the shortcut? 😏', visual: '💫' },
    { message: 'Making you laugh until your cheeks hurt is officially my mission. 😏', visual: '💫' },
  ],
  trust: [
    { message: 'Feeling completely understood is rare and precious. 🤍', visual: '🤍' },
  ],
};

export class PersonalizationEngine {
  /**
   * Builds an in-memory session profile by inspecting the active recipient profile
   * and all answers collected so far.
   */
  public static extractSessionProfile(
    profile: RecipientProfile,
    answers: Record<string, ResponseAnswer>,
    vibe: VibeMode = 'Romantic'
  ): SessionProfile {
    const session: SessionProfile = {
      name: profile.name || 'You',
      nickname: profile.nickname || undefined,
      lovelyName: profile.lovelyName || undefined,
      theme: profile.selectedTheme || 'midnight-rose',
      vibe,
      collectedTags: [],
    };

    const tagsSet = new Set<string>();

    Object.values(answers).forEach((ans) => {
      const valStr = Array.isArray(ans.value) ? ans.value.join(' ') : String(ans.value || '');
      const lower = valStr.toLowerCase();

      // Food extraction
      if (ans.questionId.includes('food') || lower.includes('pizza') || lower.includes('burger') || lower.includes('sushi') || lower.includes('dessert') || lower.includes('cake')) {
        session.favoriteFood = valStr;
        if (lower.includes('pizza')) {
          tagsSet.add('pizza');
          tagsSet.add('cozy');
          tagsSet.add('foodie');
        } else if (lower.includes('burger') || lower.includes('zinger') || lower.includes('fries')) {
          tagsSet.add('zinger');
          tagsSet.add('bold');
          tagsSet.add('playful');
        } else if (lower.includes('sushi')) {
          tagsSet.add('sushi');
          tagsSet.add('sophisticated');
          tagsSet.add('lateNight');
        } else if (lower.includes('dessert') || lower.includes('chocolate')) {
          tagsSet.add('dessert');
          tagsSet.add('sweet');
          tagsSet.add('trouble');
        }
      }

      // Evening / Vibe / Place extraction
      if (ans.questionId.includes('evening') || ans.questionId.includes('vibe') || lower.includes('sunset') || lower.includes('drive') || lower.includes('city') || lower.includes('beach') || lower.includes('quiet')) {
        session.eveningPreference = valStr;
        if (lower.includes('sunset') || lower.includes('drive')) {
          tagsSet.add('sunset');
          tagsSet.add('dreamy');
          tagsSet.add('romantic');
        } else if (lower.includes('city')) {
          tagsSet.add('city');
          tagsSet.add('adventurous');
          tagsSet.add('electric');
        } else if (lower.includes('beach') || lower.includes('waves')) {
          tagsSet.add('beach');
          tagsSet.add('romantic');
          tagsSet.add('ocean');
        } else if (lower.includes('quiet') || lower.includes('cozy') || lower.includes('chaye')) {
          tagsSet.add('quietNight');
          tagsSet.add('cozy');
          tagsSet.add('comfort');
        }
      }

      // Attention extraction
      if (ans.questionId.includes('attention') || lower.includes('smile') || lower.includes('eyes') || lower.includes('voice') || lower.includes('vibe') || lower.includes('energy')) {
        session.attractionPreference = valStr;
        if (lower.includes('smile')) {
          tagsSet.add('smile');
          tagsSet.add('warmth');
          tagsSet.add('sweet');
        } else if (lower.includes('eyes')) {
          tagsSet.add('eyes');
          tagsSet.add('visualAttraction');
          tagsSet.add('flirty');
        } else if (lower.includes('voice')) {
          tagsSet.add('voice');
          tagsSet.add('intimate');
        } else if (lower.includes('vibe') || lower.includes('energy')) {
          tagsSet.add('chemistry');
          tagsSet.add('bold');
        }
      }

      // Connection / Value extraction
      if (ans.questionId.includes('connection') || lower.includes('conversation') || lower.includes('laugh') || lower.includes('understood') || lower.includes('comfortable')) {
        session.connectionPreference = valStr;
        if (lower.includes('conversation')) {
          tagsSet.add('deepConnector');
          tagsSet.add('spark');
        } else if (lower.includes('laugh') || lower.includes('humor')) {
          tagsSet.add('humor');
          tagsSet.add('playful');
          tagsSet.add('funSeeker');
        } else if (lower.includes('understood')) {
          tagsSet.add('trust');
          tagsSet.add('emotionalSafety');
          tagsSet.add('deepConnector');
        } else if (lower.includes('comfortable')) {
          tagsSet.add('softHeart');
          tagsSet.add('cozy');
        }
      }

      // Private / secret answer extraction
      if (ans.questionId.includes('secret') || ans.questionId.includes('mind') || ans.questionId.includes('private')) {
        session.secretAnswer = valStr;
        tagsSet.add('secret');
      }

      // Location extraction
      if (ans.category === 'romantic' && (lower.includes('cabin') || lower.includes('coast') || lower.includes('rooftop') || lower.includes('vineyard'))) {
        session.favoritePlace = valStr;
        tagsSet.add('adventurous');
      }

      // YES answers & Evasion count
      if (lower.includes('yes')) {
        session.romanticInterest = 'yes';
        tagsSet.add('romantic');
        if (ans.evasionCount && ans.evasionCount > 0) {
          tagsSet.add('playfulTease');
          session.flirtyComfort = 'teasing';
        }
      }
    });

    session.collectedTags = Array.from(tagsSet);
    return session;
  }

  /**
   * Formats dynamic template text, safely replacing personal markers,
   * incorporating contextual memory references, and guaranteeing safe fallbacks.
   */
  public static formatDynamicText(
    template: string,
    session: SessionProfile,
    answers: Record<string, ResponseAnswer>,
    config?: DynamicExperienceConfig
  ): string {
    if (!template) return '';

    let text = template;
    const name = session.name || 'You';
    const nickname = session.nickname || name;
    const lovely = session.lovelyName || nickname;

    // Direct name replacements
    text = text.replace(/\{name\}/g, name);
    text = text.replace(/\{nickname\}/g, nickname);
    text = text.replace(/\{lovelyName\}/g, lovely);

    // If answer memory is enabled, enrich copy dynamically
    if (config?.enableAnswerMemory !== false) {
      if (text.includes('{memory:food}')) {
        const food = session.favoriteFood || 'pizza';
        text = text.replace(/\{memory:food\}/g, food.toLowerCase());
      }
      if (text.includes('{memory:evening}')) {
        const eve = session.eveningPreference || 'late-night drive';
        text = text.replace(/\{memory:evening\}/g, eve.toLowerCase());
      }
      if (text.includes('{memory:attraction}')) {
        const att = session.attractionPreference || 'eyes';
        text = text.replace(/\{memory:attraction\}/g, att.toLowerCase());
      }
      if (text.includes('{memory:connection}')) {
        const conn = session.connectionPreference || 'deep connection';
        text = text.replace(/\{memory:connection\}/g, conn.toLowerCase());
      }
    } else {
      // Clean fallback if memory disabled
      text = text.replace(/\{memory:[^}]+\}/g, '');
    }

    // Clean any remaining unknown brackets or double spaces
    text = text.replace(/\{[^}]+\}/g, '').replace(/\s{2,}/g, ' ').trim();

    return text;
  }

  /**
   * Provides contextual micro-reactions for an answer based on its specific option,
   * answer tags, question category, and vibe mode.
   */
  public static getAnswerMicroReaction(
    option: QuestionOption | undefined,
    category: string,
    session: SessionProfile
  ): AnswerReward {
    // 1. Check if option has explicit reward
    if (option?.rewardMessage) {
      return {
        message: option.rewardMessage,
        visual: option.rewardVisual || '✨',
        animationType: 'pop',
        duration: 1800,
      };
    }

    // 2. Check for tag-based micro reactions
    if (option?.tags && option.tags.length > 0) {
      for (const tag of option.tags) {
        if (TAG_REACTIONS[tag] && TAG_REACTIONS[tag].length > 0) {
          const pool = TAG_REACTIONS[tag];
          const choice = pool[Math.floor(Math.random() * pool.length)];
          return {
            message: choice.message,
            visual: choice.visual,
            animationType: 'pop',
            duration: 1800,
          };
        }
      }
    }

    // 3. Fallback to category-based pool
    const catPool = REACTION_POOLS[category] || REACTION_POOLS['interesting'];
    const reaction = catPool[Math.floor(Math.random() * catPool.length)];

    return {
      message: reaction.message,
      visual: reaction.visual,
      animationType: 'pop',
      duration: 1800,
    };
  }

  /**
   * Resolves adaptive question text, subtitles, and scene based on session profile
   * and previous answers.
   */
  public static resolveAdaptiveQuestion(
    baseQuestion: Question,
    session: SessionProfile,
    config?: DynamicExperienceConfig
  ): Question {
    // Deep clone to avoid direct mutation
    const adapted: Question = { ...baseQuestion };

    // Format text with session profile
    adapted.text = this.formatDynamicText(adapted.text, session, {}, config);
    if (adapted.subtitle) {
      adapted.subtitle = this.formatDynamicText(adapted.subtitle, session, {}, config);
    }

    if (config?.enableAdaptiveQuestions === false) {
      return adapted;
    }

    // Check custom adaptive variants if defined on the question
    if (adapted.adaptiveVariants && adapted.adaptiveVariants.length > 0) {
      for (const variant of adapted.adaptiveVariants) {
        const matchesTag = variant.conditionTag && session.collectedTags.includes(variant.conditionTag);
        const matchesVibe = variant.conditionVibe && session.vibe === variant.conditionVibe;

        if (matchesTag || matchesVibe) {
          if (variant.text) adapted.text = this.formatDynamicText(variant.text, session, {}, config);
          if (variant.subtitle) adapted.subtitle = this.formatDynamicText(variant.subtitle, session, {}, config);
          if (variant.visualScene) adapted.visualScene = variant.visualScene;
          break;
        }
      }
    }

    // Contextual adaptation for chemistry & flirty questions:
    // If user previously selected 'eyes', tease about eye contact
    if (adapted.id.includes('chemistry') || adapted.id.includes('smile')) {
      if (session.collectedTags.includes('eyes')) {
        adapted.subtitle = `So… if the eye contact lasted a little too long, would you look away? 👀`;
      } else if (session.collectedTags.includes('humor')) {
        adapted.subtitle = `Making you laugh this much is starting to feel like a habit. 😏`;
      } else if (session.collectedTags.includes('pizza') && session.collectedTags.includes('sunset')) {
        adapted.subtitle = `Sunset, pizza, and good conversation… dangerous combination. 😏`;
      }
    }

    // Adapt teaser responses for YES/NO questions
    if (adapted.type === 'yes-no' && adapted.teaseResponses) {
      adapted.teaseResponses = adapted.teaseResponses.map((tr) =>
        this.formatDynamicText(tr, session, {}, config)
      );
    }

    return adapted;
  }

  /**
   * Determines the dynamic visual scene based on current question,
   * recipient vibe, and tags collected from their latest choices.
   */
  public static determineDynamicScene(
    currentQuestion: Question,
    session: SessionProfile,
    lastAnswer?: ResponseAnswer
  ): VisualScene {
    if (currentQuestion.visualScene) {
      return currentQuestion.visualScene;
    }

    const tags = session.collectedTags;

    if (tags.includes('sunset')) return 'sunset';
    if (tags.includes('beach')) return 'ocean-dusk';
    if (tags.includes('city')) return 'city-night';
    if (tags.includes('quietNight') || tags.includes('sushi')) return 'moonlight';
    if (tags.includes('cozy') || tags.includes('foodie')) return 'candlelit-cafe';
    if (tags.includes('flirty') || tags.includes('eyes')) return 'rose-petals';
    if (tags.includes('trust') || tags.includes('spark')) return 'dreamy-stars';

    return 'sunset';
  }

  /**
   * Deterministic rule-based personality engine.
   * Generates a playful Closer snapshot from real collected answers.
   * No AI call, instant, reproducible, and respectful.
   */
  public static generatePersonalitySnapshot(
    session: SessionProfile,
    answers: Record<string, ResponseAnswer>
  ): PersonalitySnapshot {
    const tags = session.collectedTags;
    const food = session.favoriteFood || 'late-night bites';
    const evening = session.eveningPreference || 'golden sunset hours';
    const attention = session.attractionPreference || 'magnetic eyes';
    const connection = session.connectionPreference || 'effortless conversation';

    // Tag scoring weights
    let dreamyScore = 0;
    let romanticScore = 0;
    let flirtyScore = 0;
    let cozyScore = 0;
    let deepScore = 0;
    let playfulScore = 0;
    let adventurousScore = 0;
    let midnightScore = 0;

    tags.forEach((t) => {
      switch (t) {
        case 'sunset':
        case 'dreamy':
        case 'ocean':
          dreamyScore += 3;
          romanticScore += 2;
          break;
        case 'romantic':
        case 'rose':
        case 'sweet':
          romanticScore += 3;
          break;
        case 'eyes':
        case 'flirty':
        case 'playfulTease':
        case 'trouble':
          flirtyScore += 3;
          playfulScore += 2;
          break;
        case 'pizza':
        case 'cozy':
        case 'comfort':
        case 'quietNight':
          cozyScore += 3;
          break;
        case 'deepConnector':
        case 'trust':
        case 'emotionalSafety':
        case 'softHeart':
          deepScore += 3;
          break;
        case 'zinger':
        case 'humor':
        case 'bold':
        case 'funSeeker':
          playfulScore += 3;
          break;
        case 'city':
        case 'electric':
        case 'adventurous':
          adventurousScore += 3;
          break;
        case 'sushi':
        case 'lateNight':
        case 'sophisticated':
          midnightScore += 3;
          break;
      }
    });

    // Determine primary archetype
    let title = 'Dreamy Romantic';
    if (flirtyScore >= 4 && playfulScore >= 3) {
      title = 'Playful Flirt';
    } else if (deepScore >= 4) {
      title = 'Deep Connector';
    } else if (cozyScore >= 4 && romanticScore >= 3) {
      title = 'Quiet Romantic';
    } else if (adventurousScore >= 4) {
      title = 'Adventure Soul';
    } else if (midnightScore >= 3) {
      title = 'Midnight Soul';
    } else if (playfulScore >= 4) {
      title = 'Fun Seeker';
    } else if (deepScore >= 3 && romanticScore >= 3) {
      title = 'Soft Heart';
    }

    // Build 3-4 playful traits
    const traits: PersonalityTrait[] = [];

    if (dreamyScore >= 2 || tags.includes('sunset') || tags.includes('beach')) {
      traits.push({
        label: 'Dreamy',
        icon: '🌅',
        note: 'Drawn to warm horizons and quiet magic',
      });
    }

    if (romanticScore >= 2 || tags.includes('romantic')) {
      traits.push({
        label: 'Hopeless Romantic',
        icon: '❤️',
        note: 'Believes in spark, slow dances & real gestures',
      });
    }

    if (flirtyScore >= 2 || tags.includes('flirty') || tags.includes('eyes') || tags.includes('playfulTease')) {
      traits.push({
        label: 'Slightly Teasing',
        icon: '😏',
        note: 'Keeps people on their toes with a knowing smirk',
      });
    }

    if (deepScore >= 2 || tags.includes('deepConnector') || tags.includes('trust')) {
      traits.push({
        label: 'Deep Connector',
        icon: '✨',
        note: 'Prioritizes feeling safe, heard & truly understood',
      });
    }

    if (cozyScore >= 2 || tags.includes('cozy') || tags.includes('pizza')) {
      traits.push({
        label: 'Cozy Soul',
        icon: '🍕',
        note: 'Knows true luxury is good food and comfort',
      });
    }

    if (adventurousScore >= 2 || tags.includes('city') || tags.includes('bold')) {
      traits.push({
        label: 'Electric Energy',
        icon: '🌃',
        note: 'Thrives when the world feels alive and unscripted',
      });
    }

    // Ensure at least 3 traits
    if (traits.length < 3) {
      traits.push({
        label: 'Charming Presence',
        icon: '🤍',
        note: 'Natural warmth that makes conversation effortless',
      });
    }

    // Compose genuine narrative synthesis referencing actual choices
    const romanticSummary = `You picked ${evening.toLowerCase()}, ${food.toLowerCase()}, and ${connection.toLowerCase()}… So I’m guessing you like the kind of connection that feels easy and safe, but still gives you butterflies. ❤️`;

    return {
      title,
      traits: traits.slice(0, 4),
      romanticSummary,
      dominantTags: tags.slice(0, 6),
      vibeMode: session.vibe,
    };
  }
}
