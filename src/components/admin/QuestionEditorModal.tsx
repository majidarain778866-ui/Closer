import React, { useState, useMemo } from 'react';
import {
  Question,
  QuestionOption,
  QuestionCategory,
  QuestionType,
  VisualScene,
  AfterAnswerBehavior,
  ExperienceTheme,
} from '../../types';
import { SCENE_LIBRARY } from '../../data/sceneLibrary';
import { evaluateQuestionQuality } from '../../services/questionValidation';
import {
  suggestQuestionRefinements,
  suggestOptionRefinements,
} from '../../services/questionRefinement';
import { storageService } from '../../services/storageService';
import { InteractiveQuestionPreview } from './InteractiveQuestionPreview';
import {
  X,
  Sparkles,
  Check,
  Heart,
  Plus,
  Trash2,
  Lock,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Wand2,
  RefreshCw,
  MoveUp,
  MoveDown,
  Info,
} from 'lucide-react';

interface QuestionEditorModalProps {
  question: Question;
  allQuestions: Question[];
  theme?: ExperienceTheme;
  recipientName?: string;
  senderName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuestion: Question) => void;
}

type EditorTab = 'content' | 'options' | 'yesno' | 'scene' | 'branching';

const AVAILABLE_CATEGORIES: QuestionCategory[] = [
  'cute',
  'fun',
  'personal',
  'attraction',
  'playful',
  'flirty',
  'deep',
  'romantic',
  'final',
];

const EMOTIONAL_STAGES = [
  { stage: 1, label: 'Stage 1: Soft Mystery & Welcome (Cute/Easy)' },
  { stage: 2, label: 'Stage 2: Playful Comfort & Icebreaker (Fun)' },
  { stage: 3, label: 'Stage 3: Personal Preferences & Habits' },
  { stage: 4, label: 'Stage 4: Mutual Attraction & Sparks' },
  { stage: 5, label: 'Stage 5: Romantic Depth & Fondness' },
  { stage: 6, label: 'Stage 6: Teasing & Flirty Connection' },
  { stage: 7, label: 'Stage 7: Deep Vulnerability & Intimacy' },
  { stage: 8, label: 'Stage 8: Romantic Climax & Final Question' },
];

const COMMON_TOKENS = [
  { token: '{{name}}', label: 'Name' },
  { token: '{{nickname}}', label: 'Nickname' },
  { token: '{{lovelyName}}', label: 'Lovely Name' },
  { token: '{{favoriteFood}}', label: 'Favorite Food' },
  { token: '{{favoritePlace}}', label: 'Favorite Place' },
  { token: '{{attractionPreference}}', label: 'Attraction Choice' },
];

const MEMORY_KEY_PRESETS = [
  { key: '', label: 'None (Don’t remember)' },
  { key: 'favoriteFood', label: 'Favorite Food (e.g. Pizza, Pasta)' },
  { key: 'favoritePlace', label: 'Favorite Place / Escape (e.g. Coast, Mountains)' },
  { key: 'attractionPreference', label: 'Attraction First Impression (e.g. Eyes, Smile)' },
  { key: 'eveningPreference', label: 'Evening Vibe (e.g. Sunset, City Night)' },
  { key: 'connectionPreference', label: 'Connection Style' },
  { key: 'romanticInterest', label: 'Romantic Interest' },
];

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question,
  allQuestions,
  theme = 'midnight-rose',
  recipientName = 'Ayesha',
  senderName = 'Hamza',
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Question>(() => JSON.parse(JSON.stringify(question)));
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [showAiRefinement, setShowAiRefinement] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showSaveTemplateConfirm, setShowSaveTemplateConfirm] = useState(false);
  const [templateSavedNotice, setTemplateSavedNotice] = useState(false);
  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(0);
  const [previewModeMobile, setPreviewModeMobile] = useState(false);

  const [aiRefineGoal, setAiRefineGoal] = useState<
    'all' | 'playful' | 'romantic' | 'shorter' | 'mysterious' | 'warmer'
  >('all');

  // Derive quality evaluation
  const quality = useMemo(() => evaluateQuestionQuality(formData), [formData]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setFormData((prev) => ({ ...prev, text }));
  };

  const handleInsertToken = (token: string) => {
    setFormData((prev) => ({ ...prev, text: `${prev.text} ${token}` }));
  };

  const handleRefineAi = (goal?: 'playful' | 'romantic' | 'shorter' | 'mysterious' | 'warmer') => {
    const targetGoal = goal || (aiRefineGoal === 'all' ? undefined : aiRefineGoal);
    const suggestions = suggestQuestionRefinements(
      formData.text,
      formData.subtitle,
      formData.category,
      'Romantic',
      targetGoal
    );
    setAiSuggestions(suggestions);
    setShowAiRefinement(true);
  };

  const handleApplySuggestion = (sugg: { text: string; subtitle: string }) => {
    setFormData((prev) => ({
      ...prev,
      text: sugg.text,
      subtitle: sugg.subtitle || prev.subtitle,
    }));
    setShowAiRefinement(false);
  };

  // Option management
  const handleUpdateOption = (idx: number, updates: Partial<QuestionOption>) => {
    const options = [...(formData.options || [])];
    if (options[idx]) {
      options[idx] = { ...options[idx], ...updates };
      setFormData((prev) => ({ ...prev, options }));
    }
  };

  const handleAddOption = () => {
    const newId = `opt-${Date.now()}`;
    const newOpt: QuestionOption = {
      id: newId,
      label: 'New Choice',
      icon: '✨',
      subtitle: '',
      rewardMessage: 'Great choice… I like your style 😏',
      rewardVisual: '✨',
      tags: [formData.category],
    };
    const options = [...(formData.options || []), newOpt];
    setFormData((prev) => ({ ...prev, options }));
    setEditingOptionIdx(options.length - 1);
  };

  const handleDeleteOption = (idx: number) => {
    if ((formData.options || []).length <= 2) {
      alert('A multiple choice question requires at least 2 options.');
      return;
    }
    const options = (formData.options || []).filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, options }));
    setEditingOptionIdx(0);
  };

  const handleMoveOption = (idx: number, direction: 'up' | 'down') => {
    const options = [...(formData.options || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= options.length) return;
    const temp = options[idx];
    options[idx] = options[targetIdx];
    options[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, options }));
    setEditingOptionIdx(targetIdx);
  };

  const handleRefineOption = (
    idx: number,
    tone: 'playful' | 'romantic' | 'natural' | 'shorter'
  ) => {
    const opt = formData.options?.[idx];
    if (!opt) return;
    const suggestions = suggestOptionRefinements(opt.label, tone);
    if (suggestions.length > 0) {
      handleUpdateOption(idx, { label: suggestions[0] });
    }
  };

  // Yes / No Teases
  const handleAddTease = () => {
    const teases = [...(formData.teaseResponses || ['Nice try 😏', 'Almost… 👀'])];
    teases.push('You know you want to say yes ❤️');
    setFormData((prev) => ({ ...prev, teaseResponses: teases }));
  };

  const handleUpdateTease = (idx: number, text: string) => {
    const teases = [...(formData.teaseResponses || [])];
    teases[idx] = text;
    setFormData((prev) => ({ ...prev, teaseResponses: teases }));
  };

  const handleDeleteTease = (idx: number) => {
    const teases = (formData.teaseResponses || []).filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, teaseResponses: teases }));
  };

  // Save as Library Template action
  const handleConfirmSaveAsTemplate = () => {
    storageService.saveCustomTemplate(formData);
    setShowSaveTemplateConfirm(false);
    setTemplateSavedNotice(true);
    setTimeout(() => setTemplateSavedNotice(false), 3000);
  };

  const handleFinalSave = () => {
    onSave(formData);
    onClose();
  };

  // Other questions available for branching target
  const otherQuestions = allQuestions.filter((q) => q.id !== formData.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in"
    >
      <div className="relative w-full max-w-6xl bg-[#0a0714] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-left">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif text-white font-medium">
                  Configure Question & Answers
                </h3>
                {/* Quality pill */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    quality.score === 'Strong'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : quality.score === 'Good'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  Quality: {quality.score}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Experience-level snapshot. Edits are isolated to this experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile preview toggle */}
            <button
              type="button"
              onClick={() => setPreviewModeMobile(!previewModeMobile)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-white/[0.06] text-white/70 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewModeMobile ? 'Editor' : 'Preview'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Layout: 2 Columns on Desktop */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Configuration Controls */}
          <div
            className={`lg:col-span-7 flex flex-col border-r border-white/10 overflow-y-auto ${
              previewModeMobile ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/30 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                1. Question Content
              </button>

              {formData.type === 'yes-no' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('yesno')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'yesno'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  2. Yes/No & Evasion
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'options'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  2. Answer Choices ({formData.options?.length || 0})
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('scene')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'scene'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                3. Scene & Reward
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('branching')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'branching'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                4. Flow & Branching
              </button>
            </div>

            {/* Tab 1: Question Content */}
            {activeTab === 'content' && (
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                {/* Question Text */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-white/60">
                      Question Text *
                    </label>
                    <button
                      type="button"
                      onClick={handleRefineAi}
                      className="text-xs font-medium text-rose-300 hover:text-rose-200 flex items-center gap-1 py-0.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-rose-400" />
                      <span>Refine with AI</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={formData.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="e.g. What does your perfect evening look like?"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-400/50 resize-none font-medium"
                  />

                  {/* Token Insert Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[11px] text-white/40">Insert token:</span>
                    {COMMON_TOKENS.map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => handleInsertToken(item.token)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-rose-300 border border-white/5 cursor-pointer"
                      >
                        {item.token}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle / Supporting text */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Supporting Text / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. When the city quiets down and time slows..."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-rose-400/50"
                  />
                </div>

                {/* Category & Question Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                      Emotional Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as QuestionCategory,
                        })
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs sm:text-sm focus:outline-none capitalize cursor-pointer"
                    >
                      {AVAILABLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#130d22] text-white capitalize">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                      Question Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        setFormData((prev) => {
                          let options = prev.options;
                          if (newType === 'yes-no') {
                            options = undefined;
                          } else if (!options || options.length === 0) {
                            options = [
                              { id: 'opt-1', label: 'Option A', icon: '✨' },
                              { id: 'opt-2', label: 'Option B', icon: '💫' },
                            ];
                          }
                          return {
                            ...prev,
                            type: newType,
                            options,
                            yesLabel: newType === 'yes-no' ? prev.yesLabel || 'YES ❤️' : prev.yesLabel,
                            noLabel: newType === 'yes-no' ? prev.noLabel || 'NO 😏' : prev.noLabel,
                          };
                        });
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="single-choice" className="bg-[#130d22] text-white">Single Choice</option>
                      <option value="yes-no" className="bg-[#130d22] text-white">Yes / No (Dodging)</option>
                      <option value="multiple-choice" className="bg-[#130d22] text-white">Multiple Choice</option>
                      <option value="text-input" className="bg-[#130d22] text-white">Open Text Input</option>
                      <option value="location" className="bg-[#130d22] text-white">Location / Escape</option>
                    </select>
                  </div>
                </div>

                {/* Emotional Stage */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                    Emotional Journey Stage (Progression)
                  </label>
                  <select
                    value={formData.emotionalStage || formData.phase || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emotionalStage: parseInt(e.target.value, 10),
                        phase: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {EMOTIONAL_STAGES.map((st) => (
                      <option key={st.stage} value={st.stage} className="bg-[#130d22] text-white">
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggles: Required, Private, Enabled */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white">Required</p>
                      <p className="text-[10px] text-white/40">Must be answered</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.required !== false}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white flex items-center gap-1">
                        <Lock className="w-3 h-3 text-purple-400" />
                        <span>Private</span>
                      </p>
                      <p className="text-[10px] text-white/40">Only creator sees</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPrivate === true}
                      onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-500 accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white">Enabled</p>
                      <p className="text-[10px] text-white/40">Active in journey</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enabled !== false}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Best-Practice Assistant Panel */}
                <div className="p-3.5 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                    <Info className="w-3.5 h-3.5" />
                    <span>Experience Tips & Recommendations</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-[11px]">
                    {quality.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Answer Choices Builder */}
            {activeTab === 'options' && (
              <div className="p-5 sm:p-6 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Answer Choices</h4>
                    <p className="text-xs text-white/40">
                      Configure custom labels, emojis, reactions, and memory keys for each choice.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-xs flex items-center gap-1 cursor-pointer border border-rose-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Choice</span>
                  </button>
                </div>

                {/* Option Selector List */}
                <div className="space-y-2">
                  {(formData.options || []).map((opt, idx) => {
                    const isEditing = editingOptionIdx === idx;
                    return (
                      <div
                        key={opt.id || idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isEditing
                            ? 'bg-white/[0.06] border-rose-500/40'
                            : 'bg-white/[0.02] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingOptionIdx(idx)}
                            className="flex items-center gap-2.5 flex-1 text-left min-w-0 cursor-pointer"
                          >
                            <span className="text-base">{opt.icon || '✨'}</span>
                            <div className="truncate">
                              <p className="text-xs font-medium text-white truncate">{opt.label}</p>
                              {opt.rewardMessage && (
                                <p className="text-[10px] text-rose-300/80 truncate">
                                  Reaction: {opt.rewardMessage}
                                </p>
                              )}
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveOption(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOption(idx, 'down')}
                              disabled={idx === (formData.options?.length || 1) - 1}
                              className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(idx)}
                              className="p-1 text-white/40 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Detailed Editor for Selected Option */}
                        {isEditing && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                  Icon / Emoji
                                </label>
                                <input
                                  type="text"
                                  value={opt.icon || ''}
                                  onChange={(e) => handleUpdateOption(idx, { icon: e.target.value })}
                                  placeholder="✨"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-center text-sm focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                  Choice Label *
                                </label>
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) => handleUpdateOption(idx, { label: e.target.value })}
                                  placeholder="Option text..."
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Option AI Refinement buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-white/40">Refine choice:</span>
                              <button
                                type="button"
                                onClick={() => handleRefineOption(idx, 'playful')}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-pink-300 border border-white/5 cursor-pointer"
                              >
                                More Playful
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRefineOption(idx, 'romantic')}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-rose-300 border border-white/5 cursor-pointer"
                              >
                                More Romantic
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRefineOption(idx, 'shorter')}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-amber-300 border border-white/5 cursor-pointer"
                              >
                                Shorter
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRefineOption(idx, 'natural')}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-white/60 border border-white/5 cursor-pointer"
                              >
                                More Natural
                              </button>
                            </div>

                            {/* Subtitle / hint */}
                            <div>
                              <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                Choice Description / Subtitle (Optional)
                              </label>
                              <input
                                type="text"
                                value={opt.subtitle || ''}
                                onChange={(e) =>
                                  handleUpdateOption(idx, { subtitle: e.target.value })
                                }
                                placeholder="Subtle hint or detail..."
                                className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Reward message upon selection */}
                            <div>
                              <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                Reaction Message (Shown after recipient clicks this)
                              </label>
                              <input
                                type="text"
                                value={opt.rewardMessage || ''}
                                onChange={(e) =>
                                  handleUpdateOption(idx, { rewardMessage: e.target.value })
                                }
                                placeholder="e.g. Interesting… I had a feeling you'd pick that. 👀"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                              />
                            </div>

                            {/* Memory key configuration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                  Remember This Answer As (Memory Key)
                                </label>
                                <select
                                  value={opt.memoryKey || ''}
                                  onChange={(e) =>
                                    handleUpdateOption(idx, { memoryKey: e.target.value })
                                  }
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-[#130d22] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                                >
                                  {MEMORY_KEY_PRESETS.map((m) => (
                                    <option key={m.key} value={m.key} className="bg-[#130d22] text-white">
                                      {m.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                                  Personality Effect Tag
                                </label>
                                <input
                                  type="text"
                                  value={opt.personalityEffect || ''}
                                  onChange={(e) =>
                                    handleUpdateOption(idx, { personalityEffect: e.target.value })
                                  }
                                  placeholder="e.g. Dreamy Romantic, Bold Flirt"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2 (Alternative): YES / NO Behavior Editor */}
            {activeTab === 'yesno' && (
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                <div className="border-b border-white/10 pb-3">
                  <h4 className="text-sm font-medium text-white">Yes / No Interaction Settings</h4>
                  <p className="text-xs text-white/40">
                    Configure the playful Dodging NO button physics, tease messages, and YES celebration.
                  </p>
                </div>

                {/* YES Button settings */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>YES Button Configuration</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        YES Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.yesLabel || 'YES ❤️'}
                        onChange={(e) => setFormData({ ...formData, yesLabel: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        YES Reward Message
                      </label>
                      <input
                        type="text"
                        value={formData.yesReward?.message || 'I knew you felt it too ❤️'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yesReward: {
                              message: e.target.value,
                              visual: formData.yesReward?.visual || '❤️',
                              animationType: 'heart-burst',
                              duration: 2200,
                            },
                          })
                        }
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* NO Button dodging settings */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-pink-300">
                    NO Button Playful Evasion (Desktop & Mobile)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        NO Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.noLabel || 'NO 😏'}
                        onChange={(e) => setFormData({ ...formData, noLabel: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        Desktop Dodging Intensity
                      </label>
                      <select
                        value={formData.noConfig?.dodgingIntensity || 'playful'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            noConfig: {
                              dodgingEnabled: true,
                              dodgingIntensity: e.target.value as any,
                              mobileShake: true,
                              morphToYes: true,
                              morphMessage: 'I think you meant YES ❤️',
                              teaseResponses: formData.teaseResponses || [],
                            },
                          })
                        }
                        className="w-full py-2 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="gentle" className="bg-[#130d22] text-white">Gentle (Soft evasion)</option>
                        <option value="playful" className="bg-[#130d22] text-white">Playful (Standard magnetic hop)</option>
                        <option value="very-playful" className="bg-[#130d22] text-white">Very Playful (Energetic repulsion)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tease Responses list */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                        Tease Reactions (Shown during cursor proximity / evasion)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTease}
                        className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Phrase</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {(formData.teaseResponses || ['Nice try 😏', 'Almost… 👀', 'Still trying? ❤️']).map(
                        (phrase, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={phrase}
                              onChange={(e) => handleUpdateTease(idx, e.target.value)}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteTease(idx)}
                              className="text-white/40 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Visual Scene & Reward */}
            {activeTab === 'scene' && (
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                <div>
                  <h4 className="text-sm font-medium text-white">Visual Scene Backdrop</h4>
                  <p className="text-xs text-white/40">
                    Choose the cinematic scene displayed when this question is active.
                  </p>
                </div>

                {/* Visual Scene Grid Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(SCENE_LIBRARY).map(([key, sc]) => {
                    const isSelected = formData.visualScene === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, visualScene: key as VisualScene })}
                        className={`relative rounded-xl overflow-hidden border transition-all text-left p-2.5 flex flex-col justify-end min-h-[90px] group cursor-pointer ${
                          isSelected
                            ? 'border-rose-400 ring-2 ring-rose-500/30'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center filter brightness-[0.4] group-hover:brightness-[0.5] transition-all"
                          style={{ backgroundImage: `url(${sc.tabletImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="relative z-10">
                          <p className="text-xs font-medium text-white flex items-center justify-between">
                            <span>{sc.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-rose-400" />}
                          </p>
                          <p className="text-[10px] text-white/50 truncate">{sc.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Default Reward Configuration */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                    Default Reward Overlay (Fallback)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        Reward Message
                      </label>
                      <input
                        type="text"
                        value={formData.defaultReward?.message || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultReward: {
                              message: e.target.value,
                              visual: formData.defaultReward?.visual || '✨',
                              animationType: formData.defaultReward?.animationType || 'pop',
                              duration: 1800,
                            },
                          })
                        }
                        placeholder="e.g. That choice says a lot about you… ✨"
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                        Visual Icon
                      </label>
                      <input
                        type="text"
                        value={formData.defaultReward?.visual || '✨'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultReward: {
                              message: formData.defaultReward?.message || '',
                              visual: e.target.value,
                              animationType: formData.defaultReward?.animationType || 'pop',
                              duration: 1800,
                            },
                          })
                        }
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-center text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Flow & Branching */}
            {activeTab === 'branching' && (
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                <div>
                  <h4 className="text-sm font-medium text-white">After-Answer Progression</h4>
                  <p className="text-xs text-white/40">
                    Define what happens when the recipient completes this question.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                      General Next Step
                    </label>
                    <select
                      value={formData.afterAnswerBehavior || 'continue'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          afterAnswerBehavior: e.target.value as AfterAnswerBehavior,
                        })
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="continue" className="bg-[#130d22] text-white">Continue normally to next question</option>
                      <option value="reward-continue" className="bg-[#130d22] text-white">Show reward overlay then continue</option>
                      <option value="branch" className="bg-[#130d22] text-white">Branch to specific question</option>
                      <option value="end" className="bg-[#130d22] text-white">End experience and go straight to Final Reveal</option>
                    </select>
                  </div>

                  {formData.afterAnswerBehavior === 'branch' && (
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
                        Target Question
                      </label>
                      <select
                        value={formData.branchTargetQuestionId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branchTargetQuestionId: e.target.value,
                          })
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-[#130d22] border border-white/10 text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#130d22] text-white">-- Select next question --</option>
                        {otherQuestions.map((oq, idx) => (
                          <option key={oq.id} value={oq.id} className="bg-[#130d22] text-white">
                            Q{idx + 1}: {oq.text.substring(0, 55)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateConfirm(true)}
                  className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium transition-colors border border-white/5 cursor-pointer"
                >
                  Save as Library Template
                </button>
                {templateSavedNotice && (
                  <span className="text-xs text-emerald-400 font-medium">
                    Saved to reusable templates!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl text-white/50 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs shadow-md shadow-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to Experience</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div
            className={`lg:col-span-5 p-4 sm:p-6 bg-black/30 overflow-y-auto flex flex-col justify-center items-center ${
              previewModeMobile ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="w-full max-w-sm mx-auto h-full flex flex-col justify-center">
              <InteractiveQuestionPreview
                question={formData}
                theme={theme}
                recipientName={recipientName}
                senderName={senderName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Refinement Modal Drawer */}
      {showAiRefinement && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#120c22] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-rose-400" />
                <h4 className="text-base font-serif text-white">AI Wording Refinements</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAiRefinement(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Styles' },
                { id: 'playful', label: 'Playful 😏' },
                { id: 'romantic', label: 'Romantic ❤️' },
                { id: 'shorter', label: 'Shorter ⚡' },
                { id: 'mysterious', label: 'Mysterious 🌙' },
                { id: 'warmer', label: 'Warmer 🌸' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    const g = pill.id as any;
                    setAiRefineGoal(g);
                    handleRefineAi(g === 'all' ? undefined : g);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium ${
                    aiRefineGoal === pill.id
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-white/50">
              Select any suggestion below to apply it without losing your question settings:
            </p>

            <div className="space-y-3">
              {aiSuggestions.map((sugg, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-rose-500/15 text-rose-300">
                        {sugg.style}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-white">{sugg.text}</p>
                    {sugg.subtitle && (
                      <p className="text-[11px] text-white/50 mt-0.5">{sugg.subtitle}</p>
                    )}
                    <p className="text-[10px] text-white/40 italic mt-1.5">{sugg.explanation}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplySuggestion(sugg)}
                    className="self-end py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Save as Library Template */}
      {showSaveTemplateConfirm && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#120c22] border border-white/15 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-serif text-white">Save as Library Template?</h4>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                This will update the reusable library version, but will not automatically change existing experiences.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-white/50 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAsTemplate}
                className="py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-md shadow-rose-500/30 cursor-pointer"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
