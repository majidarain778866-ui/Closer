import React, { useState } from 'react';
import { Question, ExperienceTheme, VisualScene, AnswerReward } from '../../types';
import { SCENE_LIBRARY } from '../../data/sceneLibrary';
import { replaceTokens } from '../../services/questionValidation';
import { DodgingNoButton } from '../DodgingNoButton';
import { Sparkles, Heart, Check, Lock, RefreshCw } from 'lucide-react';

interface InteractiveQuestionPreviewProps {
  question: Question;
  theme?: ExperienceTheme;
  recipientName?: string;
  senderName?: string;
}

export const InteractiveQuestionPreview: React.FC<InteractiveQuestionPreviewProps> = ({
  question,
  theme = 'midnight-rose',
  recipientName = 'Ayesha',
  senderName = 'Anonymous',
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeReward, setActiveReward] = useState<AnswerReward | null>(null);
  const [textInputVal, setTextInputVal] = useState('');
  const [evasionCount, setEvasionCount] = useState(0);

  const sceneConfig = SCENE_LIBRARY[question.visualScene] || SCENE_LIBRARY.sunset;

  // Personalization token data for preview
  const previewTokens = {
    name: recipientName,
    nickname: recipientName,
    lovelyName: 'Sweetheart',
    favoriteFood: 'Artisan Pizza 🍕',
    favoritePlace: 'Mediterranean Coast 🏖️',
    attractionPreference: 'Those magnetic eyes 👀',
    senderName,
  };

  const formattedText = replaceTokens(question.text, previewTokens);
  const formattedSubtitle = replaceTokens(question.subtitle || '', previewTokens);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const matched = question.options?.find((o) => o.id === optId);
    if (matched?.rewardMessage) {
      setActiveReward({
        message: replaceTokens(matched.rewardMessage, previewTokens),
        visual: matched.rewardVisual || matched.icon || '✨',
        animationType: matched.animation || 'pop',
        duration: 2000,
      });
      setTimeout(() => setActiveReward(null), 2500);
    } else if (question.defaultReward) {
      setActiveReward({
        message: replaceTokens(question.defaultReward.message, previewTokens),
        visual: question.defaultReward.visual || '✨',
        animationType: question.defaultReward.animationType || 'pop',
        duration: 2000,
      });
      setTimeout(() => setActiveReward(null), 2500);
    }
  };

  const handleConfirmYes = (count: number) => {
    setEvasionCount(count);
    const yesRew = question.yesReward || {
      message: 'I knew it in my heart ❤️',
      visual: '❤️',
      animationType: 'heart-burst',
      duration: 2500,
    };
    setActiveReward({
      message: replaceTokens(yesRew.message, previewTokens),
      visual: yesRew.visual || '❤️',
      animationType: yesRew.animationType || 'heart-burst',
      duration: 2500,
    });
    setTimeout(() => setActiveReward(null), 2800);
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setActiveReward(null);
    setTextInputVal('');
    setEvasionCount(0);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Background visual scene */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-[0.45]"
        style={{ backgroundImage: `url(${sceneConfig.desktopImage})` }}
      />
      <div className={`absolute inset-0 ${sceneConfig.overlay}`} />

      {/* Top preview control bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-black/60 backdrop-blur-md text-rose-300 border border-rose-500/20">
            Live Preview
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 border border-white/10 uppercase">
            Scene: {sceneConfig.name}
          </span>
          {question.isPrivate && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Private</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          title="Reset question state"
          className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/50 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center question glass card */}
      <div className="relative z-10 my-auto max-w-md mx-auto w-full">
        <div className="p-5 sm:p-6 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 shadow-2xl text-center">
          {/* Subtle category badge */}
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 mb-3">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{question.category}</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif text-white font-medium mb-1.5 leading-snug">
            {formattedText}
          </h3>

          {formattedSubtitle && (
            <p className="text-xs text-white/60 mb-5 leading-relaxed font-light">
              {formattedSubtitle}
            </p>
          )}

          {/* Render based on question type */}
          {question.type === 'single-choice' || question.type === 'multiple-choice' ? (
            <div className="space-y-2 text-left">
              {question.options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/25 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <p className="font-medium text-white truncate">{opt.label}</p>
                        {opt.subtitle && (
                          <p className="text-[10px] text-white/40 truncate">{opt.subtitle}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : question.type === 'yes-no' ? (
            <div className="pt-2">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmYes(evasionCount)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs shadow-lg shadow-rose-500/30 cursor-pointer"
                >
                  {question.yesLabel || 'YES ❤️'}
                </button>

                <DodgingNoButton
                  onConfirmYes={handleConfirmYes}
                  yesLabel={question.yesLabel || 'YES ❤️'}
                  noLabel={question.noLabel || 'NO 😏'}
                  teasePhrases={question.noConfig?.teaseResponses || question.teaseResponses}
                  intensity={question.noConfig?.dodgingIntensity || 'playful'}
                  dodgingEnabled={question.noConfig?.dodgingEnabled ?? true}
                  mobileShake={question.noConfig?.mobileShake ?? true}
                  morphToYes={question.noConfig?.morphToYes ?? true}
                  morphMessage={question.noConfig?.morphMessage}
                  theme={theme}
                  lovelyName={previewTokens.lovelyName}
                />
              </div>
              <p className="text-[10px] text-white/40 mt-3">
                Hover or tap NO to test playful evasion physics!
              </p>
            </div>
          ) : question.type === 'text-input' ? (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={textInputVal}
                onChange={(e) => setTextInputVal(e.target.value)}
                placeholder={question.placeholder || 'Type your message here...'}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-rose-400/50 resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (textInputVal.trim()) {
                    setActiveReward({
                      message: question.defaultReward?.message || 'I love your honesty… ❤️',
                      visual: question.defaultReward?.visual || '✨',
                      animationType: 'glow',
                      duration: 2000,
                    });
                    setTimeout(() => setActiveReward(null), 2500);
                  }
                }}
                disabled={!textInputVal.trim()}
                className="w-full py-2 rounded-xl bg-rose-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer"
              >
                Send Thought
              </button>
            </div>
          ) : (
            // Location
            <div className="space-y-2 text-left">
              {question.options?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                    selectedOptionId === opt.id
                      ? 'bg-rose-500/25 border-rose-400 text-white'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.icon}</span>
                    <span className="font-medium text-white">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active micro-reward popup */}
      {activeReward && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1c1228] to-[#0c0816] border border-rose-500/30 text-center shadow-2xl max-w-xs animate-scale-up">
            <span className="text-3xl block mb-2">{activeReward.visual}</span>
            <p className="text-xs font-serif text-white leading-relaxed">
              {activeReward.message}
            </p>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="relative z-10 text-center">
        <p className="text-[11px] text-white/40">
          Clickable preview • Tokens auto-filled with test data
        </p>
      </div>
    </div>
  );
};
