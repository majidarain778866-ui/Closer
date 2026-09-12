import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface RecipientSkeletonProps {
  variant?: 'question' | 'welcome' | 'greeting';
  recipientName?: string;
  totalHearts?: number;
}

export const RecipientSkeleton: React.FC<RecipientSkeletonProps> = ({
  variant = 'question',
  recipientName,
  totalHearts = 8,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading connection experience"
      className="w-full max-w-xl mx-auto flex flex-col items-center justify-center animate-fade-in"
    >
      {/* Top Progress Hearts Skeleton */}
      {variant === 'question' && (
        <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-full glass-pill mx-auto mb-6">
          {Array.from({ length: totalHearts }).map((_, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full animate-shimmer"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}

      {/* Main Glass Panel Card */}
      <div className="w-full p-6 sm:p-8 md:p-10 rounded-3xl glass-panel relative overflow-hidden text-left border border-white/10">
        {/* Top ambient highlight line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent"
        />

        {variant === 'welcome' && (
          <div className="flex flex-col items-center text-center">
            {/* Pulsing Icon Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl animate-shimmer border border-rose-500/20 flex items-center justify-center mb-6 shadow-xl">
              <Heart className="w-8 h-8 text-rose-500/30 animate-pulse" />
            </div>

            {/* Tag pill */}
            <div className="w-36 h-6 rounded-full animate-shimmer mb-5" />

            {/* Heading shimmer */}
            <div className="w-3/4 h-10 sm:h-12 rounded-2xl animate-shimmer mb-4" />

            {/* Subtitle shimmer */}
            <div className="w-1/2 h-5 rounded-xl animate-shimmer-subtle mb-8" />

            {/* CTA button shimmer */}
            <div className="w-full sm:w-60 h-14 rounded-2xl animate-shimmer shadow-lg shadow-rose-950/40" />

            {/* Footer hint */}
            <div className="w-48 h-3.5 rounded-full animate-shimmer-subtle mt-8 opacity-40" />
          </div>
        )}

        {variant === 'greeting' && (
          <div className="flex flex-col items-center text-center">
            {/* Tag pill */}
            <div className="w-40 h-6 rounded-full animate-shimmer mb-6" />

            {/* Big name title shimmer */}
            <div className="w-4/5 h-10 sm:h-12 rounded-2xl animate-shimmer mb-4" />

            {/* Subtitle */}
            <div className="w-3/5 h-5 rounded-xl animate-shimmer-subtle mb-8" />

            {/* Button */}
            <div className="w-full sm:w-52 h-14 rounded-2xl animate-shimmer shadow-lg shadow-rose-950/40" />

            <div className="w-32 h-3.5 rounded-full animate-shimmer-subtle mt-8 opacity-40" />
          </div>
        )}

        {variant === 'question' && (
          <div className="flex flex-col">
            {/* Category tag pill shimmer */}
            <div className="self-center flex items-center gap-1.5 px-4 py-1.5 rounded-full animate-shimmer mb-5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400/40 shrink-0" />
              <div className="w-24 h-3 rounded-full bg-white/10" />
            </div>

            {/* Question title lines */}
            <div className="space-y-3 mb-4 flex flex-col items-center">
              <div className="w-full sm:w-5/6 h-8 sm:h-9 rounded-xl animate-shimmer" />
              <div className="w-3/4 sm:w-3/5 h-8 sm:h-9 rounded-xl animate-shimmer" />
            </div>

            {/* Subtitle shimmer */}
            <div className="w-1/2 h-4 rounded-lg animate-shimmer-subtle mx-auto mb-8 opacity-70" />

            {/* Choice Option Cards Skeletons */}
            <div className="space-y-3 w-full">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 animate-shimmer-subtle"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Icon placeholder */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0 animate-shimmer" />
                    {/* Text lines */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="w-3/5 h-4 rounded-md animate-shimmer" />
                      <div className="w-2/5 h-3 rounded-md animate-shimmer-subtle opacity-50" />
                    </div>
                  </div>

                  {/* Radio check pill placeholder */}
                  <div className="w-6 h-6 rounded-full border border-white/10 shrink-0 bg-white/5" />
                </div>
              ))}
            </div>

            {/* Footer indicator */}
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="w-28 h-3 rounded-md animate-shimmer-subtle opacity-40" />
              <div className="w-16 h-3 rounded-md animate-shimmer-subtle opacity-40" />
            </div>
          </div>
        )}
      </div>

      {/* Subtle status caption */}
      <div className="mt-4 flex items-center gap-2 text-xs text-rose-300/60 font-light">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span>
          {recipientName
            ? `Preparing intimate experience for ${recipientName}…`
            : 'Loading experience…'}
        </span>
      </div>
    </div>
  );
};
