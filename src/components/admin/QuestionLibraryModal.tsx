import React, { useState, useMemo } from 'react';
import { Question, QuestionCategory, QuestionType } from '../../types';
import {
  QUESTION_LIBRARY_TEMPLATES,
  createExperienceQuestionSnapshot,
} from '../../data/defaultQuestions';
import { storageService } from '../../services/storageService';
import { SCENE_LIBRARY } from '../../data/sceneLibrary';
import {
  X,
  Search,
  Plus,
  Sparkles,
  Heart,
  Eye,
  Flame,
  Coffee,
  Check,
  Compass,
} from 'lucide-react';

interface QuestionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: Question) => void;
  existingQuestionTexts: string[];
}

const CATEGORIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'All Templates', icon: '✨' },
  { id: 'cute', label: 'Cute', icon: '🌸' },
  { id: 'fun', label: 'Fun', icon: '💫' },
  { id: 'personal', label: 'Personal', icon: '🤍' },
  { id: 'attraction', label: 'Attraction', icon: '👀' },
  { id: 'playful', label: 'Playful', icon: '😏' },
  { id: 'flirty', label: 'Flirty', icon: '💋' },
  { id: 'romantic', label: 'Romantic', icon: '🌹' },
  { id: 'deep', label: 'Deep', icon: '🌌' },
  { id: 'final', label: 'Final', icon: '💍' },
];

export const QuestionLibraryModal: React.FC<QuestionLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
  existingQuestionTexts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Combine default library with custom templates
  const allTemplates = useMemo(() => {
    const custom = storageService.getCustomTemplates();
    const seen = new Set<string>();
    const combined: Question[] = [];

    [...custom, ...QUESTION_LIBRARY_TEMPLATES].forEach((item) => {
      const key = item.id;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    });

    return combined;
  }, [isOpen]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((q) => {
      // Category match
      if (selectedCategory !== 'all' && q.category !== selectedCategory) {
        return false;
      }
      // Type match
      if (selectedType !== 'all' && q.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inText = q.text.toLowerCase().includes(query);
        const inSubtitle = (q.subtitle || '').toLowerCase().includes(query);
        const inOptions = q.options?.some((o) => o.label.toLowerCase().includes(query));
        return inText || inSubtitle || inOptions;
      }
      return true;
    });
  }, [allTemplates, selectedCategory, selectedType, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (template: Question) => {
    const snapshot = createExperienceQuestionSnapshot(template);
    onAddQuestion(snapshot);
    setAddedIds((prev) => ({ ...prev, [template.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [template.id]: false }));
    }, 1500);
  };

  const getCategoryColor = (category: QuestionCategory) => {
    switch (category) {
      case 'cute':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'fun':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20';
      case 'personal':
        return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
      case 'attraction':
        return 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20';
      case 'playful':
      case 'flirty':
        return 'text-pink-300 bg-pink-500/10 border-pink-500/20';
      case 'deep':
        return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';
      case 'romantic':
      case 'final':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl bg-[#0e0a18] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Library of Connection Questions</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white">Select from Question Library</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Adding a question creates an isolated copy for this experience. Library templates remain untouched.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="pt-4 pb-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, option, or topic..."
                className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-rose-400/50"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#140e24] text-white">All Question Types</option>
              <option value="single-choice" className="bg-[#140e24] text-white">Single Choice</option>
              <option value="yes-no" className="bg-[#140e24] text-white">Yes / No</option>
              <option value="location" className="bg-[#140e24] text-white">Location / Escape</option>
              <option value="text-input" className="bg-[#140e24] text-white">Open Text</option>
            </select>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 border border-white/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3">
          {filteredTemplates.length === 0 ? (
            <div className="py-16 text-center text-white/40">
              <Compass className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No question templates match your search criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="mt-3 text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isAlreadyIn = existingQuestionTexts.some(
                (txt) => txt.trim().toLowerCase() === template.text.trim().toLowerCase()
              );
              const isJustAdded = addedIds[template.id];
              const sceneData = SCENE_LIBRARY[template.visualScene];

              return (
                <div
                  key={template.id}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium uppercase border ${getCategoryColor(
                          template.category
                        )}`}
                      >
                        {template.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/50 border border-white/5 uppercase">
                        {template.type}
                      </span>
                      {sceneData && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-white/40 flex items-center gap-1">
                          <span>Scene: {sceneData.name}</span>
                        </span>
                      )}
                      {template.isPrivate && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Private Question
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-medium text-white group-hover:text-rose-200 transition-colors">
                      {template.text}
                    </h4>

                    {template.subtitle && (
                      <p className="text-xs text-white/50">{template.subtitle}</p>
                    )}

                    {/* Preview of options */}
                    {template.options && template.options.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {template.options.slice(0, 4).map((opt) => (
                          <span
                            key={opt.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/60"
                          >
                            {opt.icon && <span>{opt.icon}</span>}
                            <span>{opt.label}</span>
                          </span>
                        ))}
                        {template.options.length > 4 && (
                          <span className="text-[11px] text-white/40">
                            +{template.options.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelect(template)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : isAlreadyIn
                          ? 'bg-white/[0.08] hover:bg-white/[0.14] text-rose-300 border border-rose-500/30'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAlreadyIn ? 'Add Variant' : 'Add to Experience'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>{filteredTemplates.length} templates available</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 font-medium cursor-pointer"
          >
            Done Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
