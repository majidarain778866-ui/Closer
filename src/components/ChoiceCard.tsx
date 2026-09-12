import React from 'react';
import { QuestionOption } from '../types';
import { Check } from 'lucide-react';

interface ChoiceCardProps {
  option: QuestionOption;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  option,
  selected,
  onSelect,
  index,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative w-full h-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer border select-none min-h-[64px] flex flex-col justify-center focus-visible:ring-2 focus-visible:ring-[#FF3657] focus-visible:outline-none ${
        selected
          ? 'bg-[#FF3657]/15 border-[#FF3657]/70 shadow-lg shadow-[#FF3657]/20 -translate-y-0.5'
          : 'bg-[rgba(255,35,65,0.06)] border-[rgba(255,70,95,0.18)] hover:bg-[rgba(255,35,65,0.12)] hover:border-[rgba(255,70,95,0.35)] hover:-translate-y-0.5'
      } backdrop-blur-xl`}
    >
      {/* Selection glow accent */}
      {selected && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D61F3A]/20 via-[#FF3657]/15 to-transparent pointer-events-none animate-fade-in"
        />
      )}

      <div className="relative flex items-center justify-between gap-3.5 w-full">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {option.icon && (
            <span
              className={`text-2xl sm:text-3xl shrink-0 p-2 rounded-xl transition-all duration-300 ${
                selected
                  ? 'scale-110 bg-[#FF3657]/25 shadow-sm'
                  : 'group-hover:scale-105 bg-white/[0.04]'
              }`}
            >
              {option.icon}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h4
              className={`text-base sm:text-lg font-medium leading-snug transition-colors ${
                selected ? 'text-[#F8F2F3] font-semibold' : 'text-[#F8F2F3]/90 group-hover:text-[#F8F2F3]'
              }`}
            >
              {option.label}
            </h4>
            {option.subtitle && (
              <p className="text-xs sm:text-sm text-[#B8AEB1] mt-0.5 group-hover:text-[#F8F2F3]/80 transition-colors leading-relaxed">
                {option.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Selection check indicator */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${
            selected
              ? 'bg-[#D61F3A] border-[#FF3657] text-[#F8F2F3] shadow-md shadow-[#FF3657]/40 scale-105'
              : 'border-[rgba(255,70,95,0.25)] bg-transparent group-hover:border-[rgba(255,70,95,0.45)]'
          }`}
        >
          {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </div>
      </div>
    </button>
  );
};
