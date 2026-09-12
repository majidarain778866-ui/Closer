import React, { useState } from 'react';
import { EmailNotificationPayload, ExperienceResponse } from '../../types';
import { emailService } from '../../services/emailService';
import { generateLuxuryEmailHtml } from '../../utils/generateLuxuryEmailHtml';
import {
  X,
  Mail,
  Check,
  Copy,
  Heart,
  Sparkles,
  Send,
  Flame,
  Shield,
  MapPin,
  Smartphone,
  Clock,
  ExternalLink,
  Code,
  Palette,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'html-live' | 'setup-guide' | 'clean-fields'>('html-live');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // Sample response to generate exact luxury HTML
  const sampleResponse: ExperienceResponse = {
    id: 'resp-ayesha-demo',
    experienceId: 'exp-ayesha',
    sessionId: 'sess-demo-vip',
    recipientName: 'Ayesha',
    recipientProfile: {
      name: 'Ayesha',
      nickname: 'Aysh',
      lovelyName: 'Jaan ❤️',
      selectedTheme: 'midnight-rose',
    },
    theme: 'midnight-rose',
    vibe: 'Romantic',
    startedAt: new Date(Date.now() - 195000).toISOString(),
    completedAt: new Date().toISOString(),
    deviceCategory: 'mobile',
    location: {
      granted: true,
      formatted: 'Lahore, Pakistan',
    },
    answers: {
      'q1-evening': {
        questionId: 'q1-evening',
        questionText: 'What does your perfect evening look like?',
        category: 'cute',
        value: 'Sunset glow with soft music 🌅✨',
        answeredAt: new Date().toISOString(),
      },
      'q2-food': {
        questionId: 'q2-food',
        questionText: 'Okay… and what are we ordering?',
        category: 'food',
        value: 'Artisan Cheesy Pizza & Cold Coffee 🍕☕',
        answeredAt: new Date().toISOString(),
      },
      'q3-vibe': {
        questionId: 'q3-vibe',
        questionText: 'What makes spending time with someone feel special to you?',
        category: 'deep',
        value: 'Feeling understood without having to explain 🤍',
        answeredAt: new Date().toISOString(),
      },
      'q4-attention': {
        questionId: 'q4-attention',
        questionText: 'Be honest… what gets your attention first?',
        category: 'attraction',
        value: 'Kind eyes and how you talk to me 👀✨',
        answeredAt: new Date().toISOString(),
      },
      'q6-place': {
        questionId: 'q6-place',
        questionText: 'Where should our ideal first real hangout be?',
        category: 'romantic',
        value: 'A peaceful rooftop cafe with fairy lights ☕✨',
        answeredAt: new Date().toISOString(),
      },
      'q7-time': {
        questionId: 'q7-time',
        questionText: 'And at what hour does the magic feel right?',
        category: 'romantic',
        value: 'Sunset / Twilight 🌇',
        answeredAt: new Date().toISOString(),
      },
      'q8-tease': {
        questionId: 'q8-tease',
        questionText: 'Late-night conversation, dim lights, and really good chemistry… sounds tempting? 😏',
        category: 'flirty',
        value: 'Very tempting YES ✨',
        evasionCount: 2,
        answeredAt: new Date().toISOString(),
      },
      'q9-final': {
        questionId: 'q9-final',
        questionText: 'One last question… Would you like to make some beautiful memories together? ❤️',
        category: 'final',
        value: 'YES, absolutely 100% ❤️',
        evasionCount: 1,
        answeredAt: new Date().toISOString(),
      },
    },
    privateAnswers: {
      'secret-thought': {
        questionId: 'secret-thought',
        questionText: 'A secret thought you haven’t shared with anyone else yet:',
        category: 'deep',
        value: 'I smile every time your notification pops up on my phone 🙈🤍',
        answeredAt: new Date().toISOString(),
      },
    },
    personalitySnapshot: {
      title: 'The Magnetic Dreamer ✨',
      romanticSummary:
        'A rare blend of playful banter and deep emotional warmth. Loves thoughtful gestures and effortless chemistry.',
      dominantTags: ['romantic', 'deep', 'playful'],
      traits: [
        { icon: '🤍', label: 'Genuine Heart', note: 'Values emotional safety above everything' },
        { icon: '✨', label: 'Playful Spark', note: 'Loves teasing back when comfortable' },
        { icon: '🌹', label: 'Hopeless Romantic', note: 'Appreciates sunsets, quality time, and eye contact' },
      ],
    },
  };

  const luxuryEmailHtml = generateLuxuryEmailHtml(sampleResponse, 'majidarain778866@gmail.com');

  const copyHtml = () => {
    navigator.clipboard.writeText(luxuryEmailHtml);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-[#0a0814] border border-white/10 rounded-3xl p-5 sm:p-7 text-left shadow-2xl my-6 overflow-hidden">
        {/* Top glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Luxury HTML Email Experience
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  DESIGN UPGRADED
                </span>
              </div>
              <p className="text-xs text-white/60">
                Delivers to <strong className="text-rose-300">majidarain778866@gmail.com</strong>
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

        {/* Quick Send Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-rose-200">
            <span className="font-semibold text-white flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Send Instant Live Email
            </span>
            Click to dispatch an instant test email directly to majidarain778866@gmail.com.
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
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>

        {testSentSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Delivered!</strong> Email sent to <strong>majidarain778866@gmail.com</strong>.
            </span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('html-live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'html-live'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            🎨 Visual Design Preview (Live HTML)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup-guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'setup-guide'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ 100% Free VIP Gmail Delivery (Resend)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clean-fields')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'clean-fields'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            📋 Clean Form Data
          </button>
        </div>

        {/* Tab 1: LIVE RENDERED HTML EMAIL */}
        {activeTab === 'html-live' && (
          <div className="mt-4">
            <div className="text-[11px] text-white/50 mb-2 flex items-center justify-between">
              <span>This is the exact high-definition visual layout rendered for Gmail &amp; mobile clients:</span>
              <button
                type="button"
                onClick={copyHtml}
                className="text-rose-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'HTML Copied!' : 'Copy Raw HTML'}</span>
              </button>
            </div>
            <div className="w-full h-[440px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#06040a]">
              <iframe
                title="Visual Luxury Email Preview"
                srcDoc={luxuryEmailHtml}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* Tab 2: RESEND FREE SETUP GUIDE */}
        {activeTab === 'setup-guide' && (
          <div className="mt-4 p-5 rounded-2xl bg-[#120e20] border border-rose-500/30 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>How to deliver the full custom HTML directly into Gmail (100% Free):</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              FormSubmit restricts emails to plain gray tables. To deliver the <strong>stunning visual HTML design with dark mode, cards, fonts, and graphics</strong> shown in the preview tab, Vercel supports <strong>Resend</strong> (free 3,000 emails/month, zero credit card):
            </p>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-white">Sign up on Resend (Free):</strong>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    Visit <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-rose-400 underline">resend.com</a> and click "Start with Google" (takes 10 seconds).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-white">Copy API Key:</strong>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    Click <strong>API Keys</strong> &rarr; <strong>Create API Key</strong> &rarr; copy the key (starts with <code className="text-rose-300">re_...</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-white">Paste into Vercel Project Settings:</strong>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    In your Vercel project &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong> &rarr; add:
                    <br />
                    Key: <code className="text-emerald-400">RESEND_API_KEY</code> &nbsp;|&nbsp; Value: <code className="text-rose-300">re_...</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
              ✓ Once added, every completed experience automatically delivers the <strong>full luxury HTML visual card</strong> straight to <strong className="text-white">majidarain778866@gmail.com</strong>!
            </div>
          </div>
        )}

        {/* Tab 3: CLEAN FIELDS */}
        {activeTab === 'clean-fields' && (
          <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs max-h-[380px] overflow-y-auto">
            <div className="text-white/40 mb-2 font-sans text-xs">
              We have eliminated the ugly broken ASCII dashed rows! Now fallback emails arrive clean and compact:
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-rose-400">👑 Recipient:</span>
              <span className="text-white/80">Ayesha ("Jaan ❤️")</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-rose-400">✨ Vibe & Theme:</span>
              <span className="text-white/80">Romantic & Deep • MIDNIGHT ROSE</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-rose-400">🥂 Date Blueprint:</span>
              <span className="text-white/80">Pizza & Cold Coffee • Rooftop Cafe • Sunset</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-rose-400">❤️ Final Answer:</span>
              <span className="text-emerald-400">YES, absolutely 100% ❤️</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-rose-400">😏 Playful Evasions:</span>
              <span className="text-pink-300">Playfully dodged NO 2x before smiling and clicking YES!</span>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-white/40">
            Powered by Closer Luxury Email Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
