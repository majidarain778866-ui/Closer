import React, { useState } from 'react';
import { EmailNotificationPayload } from '../../types';
import { X, Mail, Check, Copy, Heart, Sparkles, Send } from 'lucide-react';

interface EmailSimulatorModalProps {
  payload?: EmailNotificationPayload | null;
  onClose: () => void;
  onSimulateSend?: () => void;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({
  payload,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback sample payload if none completed yet
  const samplePayload: EmailNotificationPayload = payload || {
    to: 'creator@closer.app',
    subject: 'Someone just completed your experience ❤️',
    recipientName: 'Ayesha',
    experienceTitle: 'A little conversation for Ayesha',
    answersSummary: [
      { question: 'What does your perfect evening look like?', answer: 'Sunset glow 🌅' },
      { question: 'Okay… and what are we ordering?', answer: 'Artisan Pizza 🍕' },
      { question: 'What makes spending time with someone feel special to you?', answer: 'Feeling understood 🤍' },
      { question: 'Be honest… what gets your attention first?', answer: 'Their eyes 👀' },
      { question: 'If someone made you smile a little too much… would you secretly enjoy it? 👀', answer: 'Definitely YES ❤️' },
      { question: 'Late-night conversation, dim lights, and really good chemistry… sounds tempting? 😏', answer: 'Very tempting YES ✨' },
      { question: 'If the chemistry feels real and the connection feels safe… would you let it grow? ❤️', answer: 'YES, I would ❤️' },
      { question: 'One last question… Would you like to make some beautiful memories together? ❤️', answer: 'YES, absolutely ❤️' },
    ],
    completedAt: new Date().toISOString(),
    location: 'Lahore (approx)',
    responseId: 'resp-ayesha-demo',
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#0c0a16] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-2xl my-8 overflow-hidden">
        {/* Top glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -left-20 w-52 h-52 rounded-full bg-pink-500/15 blur-3xl pointer-events-none"
        />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Transactional Email Dispatcher
              </h3>
              <p className="text-xs text-white/50">Recipient completion notification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Header Metadata */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">To:</span>
            <span className="text-white font-mono">{samplePayload.to}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Subject:</span>
            <span className="text-rose-300 font-medium">{samplePayload.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Status:</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Ready / Dispatched
            </span>
          </div>
        </div>

        {/* Rendered HTML Email Preview */}
        <div className="mt-5 rounded-2xl bg-[#141022] border border-rose-500/20 p-5 sm:p-6 shadow-xl relative text-left">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
            </div>
            <span className="font-serif text-lg text-white font-medium">Closer</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <p className="text-white/90">
              Hey Hamza,
            </p>
            <p className="text-rose-200 font-medium">
              <strong>{samplePayload.recipientName}</strong> just completed your private experience!
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Recipient:</span>
                <span className="text-white font-semibold">{samplePayload.recipientName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Completion:</span>
                <span className="text-emerald-400 font-semibold">100% (All questions answered)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Favorite Choice:</span>
                <span className="text-rose-300 font-medium">
                  {samplePayload.answersSummary[1]?.answer || 'Artisan Pizza 🍕'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Final Answer:</span>
                <span className="text-rose-400 font-semibold">
                  {samplePayload.answersSummary[samplePayload.answersSummary.length - 1]?.answer || 'YES ❤️'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium text-xs text-center shadow-md shadow-rose-500/20 cursor-pointer"
              >
                View Full Response &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Integration code hint */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-white/40">
            Modular architecture ready for Resend / SendGrid
          </span>
          <button
            type="button"
            onClick={copyJson}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied payload' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
