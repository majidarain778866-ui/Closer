import { Question, QuestionCategory, VisualScene } from '../types';
import { SCENE_LIBRARY } from '../data/sceneLibrary';

export interface QuestionValidationIssue {
  questionId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ExperienceValidationResult {
  isValid: boolean;
  errors: QuestionValidationIssue[];
  warnings: QuestionValidationIssue[];
  emotionalFlowFeedback: string | null;
  overallScore: 'Strong' | 'Good' | 'Needs refinement';
}

// Recommended emotional category order from opening to climax
const EMOTIONAL_STAGE_WEIGHTS: Record<QuestionCategory, number> = {
  cute: 1,
  fun: 2,
  food: 2,
  personal: 3,
  attraction: 4,
  playful: 4,
  romantic: 5,
  flirty: 6,
  teasing: 6,
  spicy: 7,
  deep: 7,
  final: 8,
};

const VALID_TOKENS = new Set([
  'name',
  'nickname',
  'lovelyname',
  'lovelyName',
  'favoritefood',
  'favoriteFood',
  'favoriteplace',
  'favoritePlace',
  'attractionpreference',
  'attractionPreference',
  'eveningpreference',
  'eveningPreference',
  'connectionpreference',
  'connectionPreference',
  'romanticinterest',
  'romanticInterest',
  'flirtycomfort',
  'flirtyComfort',
  'secretanswer',
  'secretAnswer',
  'sendername',
  'senderName',
]);

/**
 * Validates a single question and derives its design quality rating
 */
export function evaluateQuestionQuality(question: Question): {
  score: 'Strong' | 'Good' | 'Needs refinement';
  feedback: string;
  tips: string[];
} {
  const tips: string[] = [];

  if (!question.text.trim()) {
    return {
      score: 'Needs refinement',
      feedback: 'Question text is empty.',
      tips: ['Provide clear, engaging question text.'],
    };
  }

  // Length check
  if (question.text.length > 130) {
    tips.push('Question is a bit long for mobile screens. Consider tightening the wording.');
  }

  // Choice options check
  if (question.type === 'single-choice' || question.type === 'multiple-choice') {
    if (!question.options || question.options.length < 2) {
      return {
        score: 'Needs refinement',
        feedback: 'Multiple choice questions require at least 2 options.',
        tips: ['Add at least 2 or 3 distinct options for the recipient.'],
      };
    }
    const hasRewards = question.options.some((o) => o.rewardMessage);
    if (!hasRewards && !question.defaultReward) {
      tips.push('Adding answer reactions gives instant playful dopamine.');
    }
    const hasEmojis = question.options.some((o) => o.icon);
    if (!hasEmojis) {
      tips.push('Consider adding expressive icons or emojis to make choices pop.');
    }
  }

  // Yes / No check
  if (question.type === 'yes-no') {
    if (!question.yesReward) {
      tips.push('A heartwarming reward on YES makes the moment memorable.');
    }
    if (!question.teaseResponses || question.teaseResponses.length === 0) {
      tips.push('Add playful tease phrases for when they try to click NO.');
    }
  }

  // Emotional stage advice
  const stage = EMOTIONAL_STAGE_WEIGHTS[question.category] || 3;
  if (stage <= 2) {
    tips.push('Great opening question — keeps pressure light and welcoming.');
  } else if (stage >= 7) {
    tips.push('Intimate question — best placed toward the end of the journey.');
  }

  if (tips.length === 0) {
    return {
      score: 'Strong',
      feedback: 'Excellent question configuration with rich feedback and clear options.',
      tips: ['Ready for a cinematic romantic experience.'],
    };
  }

  if (tips.length <= 2) {
    return {
      score: 'Good',
      feedback: 'Well-crafted question with minor opportunities for polish.',
      tips,
    };
  }

  return {
    score: 'Needs refinement',
    feedback: 'Could benefit from clearer options or richer micro-rewards.',
    tips,
  };
}

/**
 * Validates token usage in text (e.g. {{name}}, {nickname})
 */
export function validateTokensInText(text: string): string[] {
  const invalidTokens: string[] = [];
  const tokenRegex = /\{\{?([a-zA-Z0-9_-]+)\}?\}/g;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const tokenName = match[1];
    if (!VALID_TOKENS.has(tokenName) && !VALID_TOKENS.has(tokenName.toLowerCase())) {
      invalidTokens.push(tokenName);
    }
  }
  return invalidTokens;
}

/**
 * Replaces personalization tokens gracefully with session or profile data
 */
export function replaceTokens(
  template: string,
  tokens: Record<string, string | undefined>
): string {
  if (!template) return '';
  return template.replace(/\{\{?([a-zA-Z0-9_-]+)\}?\}/g, (match, key) => {
    const lowerKey = key.toLowerCase();
    for (const [k, v] of Object.entries(tokens)) {
      if (k.toLowerCase() === lowerKey && v && v.trim()) {
        return v.trim();
      }
    }
    // Fallback gracefully without showing ugly curly braces
    if (lowerKey === 'name') return tokens.name || 'you';
    if (lowerKey === 'nickname') return tokens.nickname || tokens.name || 'you';
    if (lowerKey === 'lovelyname') return tokens.lovelyName || 'sweetheart';
    if (lowerKey === 'favoritefood') return 'good food';
    if (lowerKey === 'favoriteplace') return 'there';
    if (lowerKey === 'attractionpreference') return 'that';
    return '';
  });
}

/**
 * Validates the entire list of questions in an experience
 */
export function validateExperienceQuestions(questions: Question[]): ExperienceValidationResult {
  const errors: QuestionValidationIssue[] = [];
  const warnings: QuestionValidationIssue[] = [];

  if (!questions || questions.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          questionId: 'root',
          field: 'questions',
          message: 'The experience must contain at least 1 question.',
          severity: 'error',
        },
      ],
      warnings: [],
      emotionalFlowFeedback: 'No questions configured.',
      overallScore: 'Needs refinement',
    };
  }

  const questionIdSet = new Set<string>();

  questions.forEach((q, idx) => {
    const qNum = `Q${idx + 1}`;

    // Duplicate ID check
    if (questionIdSet.has(q.id)) {
      errors.push({
        questionId: q.id,
        field: 'id',
        message: `${qNum} has a duplicate ID (${q.id}).`,
        severity: 'error',
      });
    }
    questionIdSet.add(q.id);

    // Text check
    if (!q.text || !q.text.trim()) {
      errors.push({
        questionId: q.id,
        field: 'text',
        message: `${qNum} is missing question text.`,
        severity: 'error',
      });
    }

    // Token check
    const invalidTokens = validateTokensInText(q.text + ' ' + (q.subtitle || ''));
    if (invalidTokens.length > 0) {
      warnings.push({
        questionId: q.id,
        field: 'tokens',
        message: `${qNum} uses unmapped personalization tokens: ${invalidTokens.map((t) => `{{${t}}}`).join(', ')}.`,
        severity: 'warning',
      });
    }

    // Scene check
    if (q.visualScene && !SCENE_LIBRARY[q.visualScene]) {
      warnings.push({
        questionId: q.id,
        field: 'visualScene',
        message: `${qNum} references an unrecognized scene (${q.visualScene}).`,
        severity: 'warning',
      });
    }

    // Choice option validation
    if (q.type === 'single-choice' || q.type === 'multiple-choice') {
      if (!q.options || q.options.length < 2) {
        errors.push({
          questionId: q.id,
          field: 'options',
          message: `${qNum} must have at least 2 options.`,
          severity: 'error',
        });
      } else {
        q.options.forEach((opt, oIdx) => {
          if (!opt.label || !opt.label.trim()) {
            errors.push({
              questionId: q.id,
              field: `options[${oIdx}]`,
              message: `${qNum} option #${oIdx + 1} has empty label.`,
              severity: 'error',
            });
          }
          if (opt.branchTargetQuestionId && !questions.some((target) => target.id === opt.branchTargetQuestionId)) {
            warnings.push({
              questionId: q.id,
              field: `options[${oIdx}].branchTargetQuestionId`,
              message: `${qNum} option "${opt.label}" branches to a non-existent question ID.`,
              severity: 'warning',
            });
          }
        });
      }
    }

    // Yes/No validation
    if (q.type === 'yes-no') {
      if (q.yesLabel && !q.yesLabel.trim()) {
        errors.push({
          questionId: q.id,
          field: 'yesLabel',
          message: `${qNum} is missing a label for YES.`,
          severity: 'error',
        });
      }
    }
  });

  // Emotional flow check
  let emotionalFlowFeedback: string | null = null;
  const stageWeights = questions.map((q) => EMOTIONAL_STAGE_WEIGHTS[q.category] || 3);

  // Check if heavy/deep questions are placed in Q1 or Q2
  if (questions.length >= 3) {
    const earlyMaxWeight = Math.max(...stageWeights.slice(0, 2));
    if (earlyMaxWeight >= 7) {
      emotionalFlowFeedback =
        'Your current sequence may feel emotionally uneven. Consider moving deep or intense questions later in the experience to build comfort and anticipation first.';
      warnings.push({
        questionId: questions[0].id,
        field: 'emotionalFlow',
        message: emotionalFlowFeedback,
        severity: 'warning',
      });
    } else {
      // Check if general progression is ascending or steady
      let inversions = 0;
      for (let i = 0; i < stageWeights.length - 1; i++) {
        if (stageWeights[i] > stageWeights[i + 1] + 2) {
          inversions++;
        }
      }
      if (inversions > 2) {
        emotionalFlowFeedback =
          'The emotional journey fluctuates noticeably. A steady progression from playful to deep creates the most romantic momentum.';
      } else {
        emotionalFlowFeedback = 'Balanced emotional flow: begins inviting and builds tender, flirty anticipation naturally.';
      }
    }
  }

  const isValid = errors.length === 0;
  let overallScore: 'Strong' | 'Good' | 'Needs refinement' = 'Strong';
  if (errors.length > 0) {
    overallScore = 'Needs refinement';
  } else if (warnings.length > 1) {
    overallScore = 'Good';
  }

  return {
    isValid,
    errors,
    warnings,
    emotionalFlowFeedback,
    overallScore,
  };
}
