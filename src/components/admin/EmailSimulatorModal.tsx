import React, { useState } from 'react';
import { EmailNotificationPayload } from '../../types';
import { emailService } from '../../services/emailService';
import { X, Mail, Check, Copy, Heart, Sparkles, Send, Flame, Shield, MapPin, Smartphone, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'card' | 'fields' | 'letter'>('card');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // Fallback sample payload if none completed yet
  const samplePayload: EmailNotificationPayload = payload || {
    to: 'majidarain778866@gmail.com',
    subject: '🌹 Closer Alert: Ayesha finished your experience! (Romantic ❤️)',
    recipientName: 'Ayesha',
    experienceTitle: 'A little conversation for Ayesha',
    nickname: 'Jaan ❤️',
    theme: 'Midnight Rose',
    answersSummary: [
      { question: 'What does your perfect evening look like?', answer: 'Sunset glow with soft music 🌅✨' },
      { question: 'Okay… and what are we ordering?', answer: 'Artisan Cheesy Pizza & Cold Coffee 🍕☕' },
      { question: 'What makes spending time with someone feel special to you?', answer: 'Feeling understood without explaining 🤍' },
      { question: 'Be honest… what gets your attention first?', answer: 'Kind eyes and genuine smile 👀' },
      { question: 'Where should our ideal first real hangout be?', answer: 'A cozy rooftop cafe with fairy lights ☕✨' },
      { question: 'And at what hour does the magic feel right?', answer: 'Sunset / Twilight 🌇' },
      { question: 'Late-night conversation and really good chemistry… tempting? 😏', answer: 'Very tempting YES ✨ (Dodged NO 2x)' },
      { question: 'One last question… Would you like to make some beautiful memories together? ❤️', answer: 'YES, absolutely 100% ❤️ (Dodged NO 1x)' },
    ],
    completedAt: new Date().toISOString(),
    location: 'Lahore, Pakistan',
    responseId: 'resp-ayesha-demo',
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLiveTest = async () => {
    setSendingTest(true);
    setTestSentSuccess(false);
    try {
      await emailService.sendSampleTestEmail('majidarain778866@gmail.com');
      setTestSentSuccess(true);
      setTimeout(() => setTestSentSuccess(false), 8000);
    } catch (err) {
      console.error('Failed to trigger test email:', err);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0c0a16] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-2xl my-8 overflow-hidden">
        {/* Top glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-pink-500/15 blur-3xl pointer-events-none"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Direct Email Notification System
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% FREE ACTIVE
                </span>
              </div>
              <p className="text-xs text-white/60">
                Delivers instant alerts directly to <strong className="text-rose-300">majidarain778866@gmail.com</strong>
              </p>
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

        {/* Live Test Trigger Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-rose-200">
            <span className="font-semibold text-white flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Send Live Verification Test
            </span>
            Click below to receive this exact formatted email in your Gmail right now.
          </div>
          <button
            type="button"
            onClick={handleSendLiveTest}
            disabled={sendingTest}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingTest ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending to Gmail...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email Now</span>
              </>
            )}
          </button>
        </div>

        {testSentSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Success!</strong> Test email dispatched to <strong>majidarain778866@gmail.com</strong>.
              (If first time, check your inbox and click "Activate Form" once).
            </span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'card'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Visual Email Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'fields'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Structured Data Fields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'letter'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Narrative Dossier
          </button>
        </div>

        {/* Content Tabs */}
        <div className="mt-4 max-h-[380px] overflow-y-auto pr-1 space-y-4 text-left">
          {activeTab === 'card' && (
            <div className="rounded-2xl bg-[#141022] border border-rose-500/20 p-5 sm:p-6 shadow-xl space-y-4">
              {/* Email Client Header Preview */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                  </div>
                  <div>
                    <span className="font-serif text-white font-semibold">Closer Notification</span>
                    <span className="text-white/40 block text-[10px]">via FormSubmit Instant Relay</span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 100% Free
                </span>
              </div>

              {/* Recipient Profile Hero Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-pink-950/40 border border-rose-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Recipient Match
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                    100% All Answered
                  </span>
                </div>
                <h4 className="text-lg font-serif font-bold text-white">
                  {samplePayload.recipientName} {samplePayload.nickname ? `("${samplePayload.nickname}")` : ''}
                </h4>
                <p className="text-xs text-white/70">
                  Vibe: <strong className="text-rose-200">Romantic & Deep</strong> • Theme: <strong className="text-purple-200">{samplePayload.theme || 'Midnight Rose'}</strong>
                </p>
              </div>

              {/* Date & Chemistry Blueprint */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="text-white/50 uppercase tracking-wider font-semibold text-[10px] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> Date & Chemistry Blueprint
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">🍕 Food & Drinks</span>
                    <span className="text-white font-medium">{samplePayload.answersSummary[1]?.answer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">📍 Dream Meeting Spot</span>
                    <span className="text-white font-medium">{samplePayload.answersSummary[4]?.answer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">🌇 Best Hour</span>
                    <span className="text-white font-medium">{samplePayload.answersSummary[5]?.answer}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">❤️ Final Verdict</span>
                    <span className="text-rose-400 font-bold">{samplePayload.answersSummary[samplePayload.answersSummary.length - 1]?.answer}</span>
                  </div>
                </div>
              </div>

              {/* Questions Breakdown List */}
              <div className="space-y-2">
                <span className="text-white/50 uppercase tracking-wider font-semibold text-[10px] block">
                  Question-by-Question Breakdown
                </span>
                {samplePayload.answersSummary.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs flex flex-col gap-0.5">
                    <span className="text-white/50 font-medium">
                      Q{idx + 1}: {item.question}
                    </span>
                    <span className="text-rose-200 font-semibold">{item.answer}</span>
                  </div>
                ))}
              </div>

              {/* Next Move Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-xs">
                <span className="text-amber-300 font-semibold block mb-1">💡 Suggested Text To Send:</span>
                <p className="text-white/80 italic font-serif">
                  “So {samplePayload.nickname || samplePayload.recipientName}… heard you're craving artisan pizza at sunset. Shall we make it happen? 😉🌹”
                </p>
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Mobile Device
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {samplePayload.location || 'Lahore, Pakistan'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Completed in 3 mins
                </span>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
              <div className="text-white/40 mb-2 font-sans text-xs">
                FormSubmit organizes these fields into clear cards in your Gmail:
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">_subject:</span>
                <span className="text-white/80">{samplePayload.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">👑 Full Name:</span>
                <span className="text-white/80">{samplePayload.recipientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">🤍 Lovely Name:</span>
                <span className="text-white/80">{samplePayload.nickname || 'Sweetheart'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">🍕 Food Craving:</span>
                <span className="text-white/80">Artisan Cheesy Pizza 🍕</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">📍 Meeting Spot:</span>
                <span className="text-white/80">Cozy Rooftop Cafe ☕</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">🌇 Timing:</span>
                <span className="text-white/80">Sunset / Twilight 🌇</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">❤️ Final Answer:</span>
                <span className="text-emerald-400">YES, absolutely 100% ❤️</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">😏 Playful Evasions:</span>
                <span className="text-pink-300">Dodged 2x before saying YES</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">📱 Device:</span>
                <span className="text-white/80">MOBILE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-rose-400">⏰ Time:</span>
                <span className="text-white/80">{new Date(samplePayload.completedAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] leading-relaxed text-rose-200/90 whitespace-pre-wrap">
              {`╔══════════════════════════════════════════════════════════════════════╗
                      🌹 CLOSER EXPERIENCE DOSSIER 🌹                   
               "Every honest answer brings us a little closer"           
╚══════════════════════════════════════════════════════════════════════╝

👑 Recipient: ${samplePayload.recipientName} (${samplePayload.nickname || 'Jaan'})
🎨 Theme: ${samplePayload.theme || 'Midnight Rose'} | Vibe: Romantic
⏱️ Completed In: ~3 minutes
📅 Date: ${new Date(samplePayload.completedAt).toLocaleDateString()}

────────────────────────────────────────────────────────────────────────
🎯 DATE & CONNECTION BLUEPRINT
────────────────────────────────────────────────────────────────────────
• Food Craving:       Artisan Cheesy Pizza & Cold Coffee 🍕☕
• Destination / Spot: Rooftop cafe with warm fairy lights ☕✨
• Ideal Timing:       Sunset / Twilight 🌇
• First Attraction:   Kind eyes and how you talk to me 👀✨
• Final Verdict:      YES, absolutely 100% ❤️ (Playfully dodged 2x first!)

────────────────────────────────────────────────────────────────────────
🔮 VIBE SYNTHESIS
────────────────────────────────────────────────────────────────────────
• Archetype: The Magnetic Dreamer ✨
• Insight:   Genuine spark with deep emotional ease and playful banter.

────────────────────────────────────────────────────────────────────────
💬 RECOMMENDED NEXT TEXT TO SEND:
────────────────────────────────────────────────────────────────────────
"So ${samplePayload.nickname || samplePayload.recipientName}... heard you're craving pizza at sunset. Shall we make it happen? 😉🌹"
`}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={copyJson}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Payload' : 'Copy JSON'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
