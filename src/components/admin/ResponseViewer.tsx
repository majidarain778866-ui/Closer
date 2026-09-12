import React, { useState } from 'react';
import { ExperienceResponse, ResponseAnswer } from '../../types';
import { googleWorkspaceService } from '../../services/googleWorkspace';
import {
  X,
  Calendar,
  Smartphone,
  MapPin,
  Sparkles,
  Heart,
  CheckCircle2,
  Shield,
  Palette,
  FileSpreadsheet,
  Check,
  Mail,
  Lock,
} from 'lucide-react';

interface ResponseViewerProps {
  response: ExperienceResponse;
  onClose: () => void;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  onClose,
}) => {
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const answerList: ResponseAnswer[] = Object.values(response.answers) as ResponseAnswer[];
  const totalQuestions = answerList.length;

  const photo = response.recipientProfile?.photoUrl || response.photoUrl;
  const nickname = response.recipientProfile?.nickname;
  const lovelyName = response.recipientProfile?.lovelyName;
  const themeName = response.recipientProfile?.selectedTheme || response.theme || 'Midnight Rose';

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleExportSheets = () => {
    const csvContent = googleWorkspaceService.generateCsv([response]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `closer_response_${response.recipientName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess('CSV downloaded for Google Sheets import ✨');
    setTimeout(() => setExportSuccess(null), 3500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0e0c18] border border-white/15 rounded-3xl p-6 sm:p-8 text-left shadow-2xl overflow-hidden my-8">
        {/* Glow accent */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-rose-500/15 blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-start gap-4">
            {/* Recipient Photo (if supplied) or Heart avatar */}
            {photo ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shrink-0 shadow-lg shadow-rose-950/50">
                <img
                  src={photo}
                  alt={response.recipientName}
                  className="w-full h-full rounded-full object-cover border border-[#0e0c18]"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Heart className="w-7 h-7 text-rose-400 fill-rose-500/30" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span>Full Response Breakdown</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 text-white/70">
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span className="capitalize">{themeName}</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal flex items-center gap-2">
                <span>{response.recipientName}</span>
                {nickname && (
                  <span className="text-base sm:text-lg text-white/50 font-sans">
                    ("{nickname}")
                  </span>
                )}
              </h3>

              {lovelyName && (
                <p className="text-xs text-rose-300/90 font-medium mt-0.5">
                  Lovely name preference: <span className="text-white">{lovelyName}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(response.completedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  {response.deviceCategory}
                </span>
                {response.location?.formatted && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {response.location.formatted}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completion & Export bar */}
        <div className="my-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">100% Completed Experience</p>
              <p className="text-xs text-white/50">Answered all {totalQuestions} curated questions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSheets}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Sheets / CSV</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Personality Snapshot (Closer Vibe) */}
        {response.personalitySnapshot && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Vibe Archetype &bull; {response.personalitySnapshot.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-serif italic mb-3">
              "{response.personalitySnapshot.summary}"
            </p>
            <div className="grid grid-cols-3 gap-2">
              {response.personalitySnapshot.traits.map((trait, tIdx) => (
                <div key={tIdx} className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-base block">{trait.icon}</span>
                  <span className="text-[9px] uppercase font-semibold text-white/40 tracking-wider block">
                    {trait.label}
                  </span>
                  <span className="text-xs font-medium text-white/90 block truncate">{trait.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private Answers Section if present */}
        {response.privateAnswers && Object.keys(response.privateAnswers).length > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
            <div className="flex items-center gap-2 mb-2.5 text-amber-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Private Answers (Visible only to you)
              </span>
            </div>
            <div className="space-y-2">
              {(Object.values(response.privateAnswers) as ResponseAnswer[]).map((pAns, pIdx) => (
                <div key={pIdx} className="p-2.5 rounded-xl bg-white/[0.04] border border-amber-500/20">
                  <p className="text-xs text-white/70 font-medium mb-1">{pAns.questionText}</p>
                  <p className="text-xs font-semibold text-amber-200">
                    {Array.isArray(pAns.value) ? pAns.value.join(', ') : pAns.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answers List */}
        <div className="space-y-3.5 max-h-[46vh] overflow-y-auto pr-1">
          {answerList.map((ans, idx) => (
            <div
              key={ans.questionId || idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <span className="text-xs font-semibold text-rose-400 tracking-wider uppercase">
                  Q{idx + 1} &bull; {ans.category}
                </span>
                {ans.evasionCount && ans.evasionCount > 0 ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                    Dodged {ans.evasionCount}x before YES
                  </span>
                ) : null}
              </div>

              <p className="text-sm text-white/80 font-medium mb-2">{ans.questionText}</p>

              <div className="inline-block px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm font-semibold">
                {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Private response visible only to you</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
