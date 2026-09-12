import React, { useState, useEffect } from 'react';
import { Experience, ExperienceResponse, EmailNotificationPayload } from '../../types';
import { storageService } from '../../services/storageService';
import { emailService } from '../../services/emailService';
import { loginWithGoogle, logoutUser, auth } from '../../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ExperienceBuilder } from './ExperienceBuilder';
import { ResponseViewer } from './ResponseViewer';
import { EmailSimulatorModal } from './EmailSimulatorModal';
import {
  Heart,
  Plus,
  Copy,
  ExternalLink,
  Check,
  Eye,
  MessageCircleHeart,
  Sparkles,
  Smartphone,
  MapPin,
  Calendar,
  Layers,
  Settings,
  Mail,
  RefreshCw,
  Trash2,
  Edit,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onOpenExperience: (exp: Experience) => void;
  onExit?: () => void;
}

type TabType = 'overview' | 'experiences' | 'responses' | 'email' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'overview',
  onTabChange,
  onOpenExperience,
  onExit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [responses, setResponses] = useState<ExperienceResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ExperienceResponse | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailPayload, setEmailPayload] = useState<EmailNotificationPayload | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);
  const [guestCreator, setGuestCreator] = useState<boolean>(() => {
    try {
      return localStorage.getItem('closer_guest_creator') === 'true';
    } catch {
      return false;
    }
  });
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const currentUser = storageService.getCurrentUser();

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadData = () => {
    setExperiences(storageService.getExperiences());
    setResponses(storageService.getResponses());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('closer-storage-update', handleUpdate);

    // Auth state listener
    const authUnsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
    });

    // Subscribe to transactional emails
    const unsub = emailService.subscribeToNotifications((payload) => {
      setEmailPayload(payload);
    });

    return () => {
      window.removeEventListener('closer-storage-update', handleUpdate);
      authUnsub();
      unsub();
    };
  }, []);

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://closer.app';
    const link = `${origin}/f/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    storageService.updateExperience(id, { active: !current });
    loadData();
  };

  const handleDeleteExperience = (id: string) => {
    storageService.deleteExperience(id);
    loadData();
  };

  const handleDeleteResponse = (id: string) => {
    storageService.deleteResponse(id);
    loadData();
  };

  const handleSaveExperience = (expData: Omit<Experience, 'id' | 'createdAt' | 'viewCount'>): Experience => {
    let result: Experience;
    if (editingExperience) {
      result = storageService.updateExperience(editingExperience.id, expData) || {
        ...editingExperience,
        ...expData,
      };
    } else {
      result = storageService.createExperience(expData);
      handleCopyLink(result.slug);
    }
    loadData();
    return result;
  };

  const totalViews = experiences.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const activeCount = experiences.filter((e) => e.active).length;

  // Protected Creator Studio Gate - allows Google Auth or Instant Anonymous Access
  const isAuthorized = !!authUser || guestCreator;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07060e] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-[#07060e] to-violet-950/20 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-950/60">
            <Heart className="w-7 h-7 text-rose-400 fill-rose-500/40" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide mb-2">
            Closer Creator Studio
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mb-6 leading-relaxed">
            Create custom connection experiences, modify questions, and track all responses and email notifications.
          </p>

          {/* Instant One-Click Access Button (Primary & Zero-Hassle) */}
          <button
            type="button"
            onClick={() => {
              setGuestCreator(true);
              try {
                localStorage.setItem('closer_guest_creator', 'true');
              } catch {}
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-rose-500/30 transition-all cursor-pointer mb-3"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Enter as Anonymous Creator (Instant Access)</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#07060e] px-3 text-[10px] text-white/40 uppercase tracking-widest">or sign in</span>
          </div>

          {/* Optional Google Sign-In */}
          <button
            type="button"
            onClick={async () => {
              setLoginLoading(true);
              setLoginError(null);
              try {
                await loginWithGoogle();
              } catch (err: any) {
                if (err?.code === 'auth/unauthorized-domain') {
                  setLoginError('This Vercel domain needs to be added to Firebase Authorized Domains. In the meantime, simply click "Enter as Anonymous Creator" above for instant access!');
                } else if (err?.code !== 'auth/popup-closed-by-user') {
                  setLoginError('Google sign in encountered an issue. Please click "Enter as Anonymous Creator" above to use the Studio directly.');
                }
              } finally {
                setLoginLoading(false);
              }
            }}
            disabled={loginLoading}
            className="w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            {loginLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
            )}
            <span>{loginLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>

          {loginError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs text-left leading-relaxed">
              {loginError}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free • Direct Email to majidarain778866@gmail.com</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060e] text-white p-4 sm:p-8 flex flex-col items-center">
      {/* Container */}
      <div className="w-full max-w-6xl">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-500/40" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
                  Closer Creator Studio
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  Private
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Manage your intimate connection experiences &amp; received answers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Direct Alerts Active</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center">
                {authUser?.displayName
                  ? authUser.displayName.charAt(0).toUpperCase()
                  : currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-white/80 max-w-[140px] truncate hidden md:inline">
                {authUser?.displayName || authUser?.email || currentUser.name || 'Anonymous'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setGuestCreator(false);
                  try {
                    localStorage.removeItem('closer_guest_creator');
                  } catch {}
                  logoutUser();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 ml-1 cursor-pointer"
              >
                Sign out
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingExperience(null);
                setBuilderOpen(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Experience</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-8 max-w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('experiences')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'experiences'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Experiences ({experiences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('responses')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'responses'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircleHeart className="w-4 h-4" />
            <span>Responses ({responses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('email')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'email'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('settings')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                <p className="text-xs uppercase tracking-wider text-white/50">Total Links</p>
                <p className="text-2xl sm:text-3xl font-serif text-white mt-1.5">{experiences.length}</p>
                <p className="text-[11px] text-rose-300 mt-1">{activeCount} currently active</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                <p className="text-xs uppercase tracking-wider text-white/50">Total Responses</p>
                <p className="text-2xl sm:text-3xl font-serif text-rose-400 mt-1.5">{responses.length}</p>
                <p className="text-[11px] text-emerald-400 mt-1">100% completion rate</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                <p className="text-xs uppercase tracking-wider text-white/50">Link Views</p>
                <p className="text-2xl sm:text-3xl font-serif text-white mt-1.5">{totalViews}</p>
                <p className="text-[11px] text-white/40 mt-1">Unique opens</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                <p className="text-xs uppercase tracking-wider text-white/50">Average Time</p>
                <p className="text-2xl sm:text-3xl font-serif text-white mt-1.5">85s</p>
                <p className="text-[11px] text-white/40 mt-1">High engagement rate</p>
              </div>
            </div>

            {/* Quick Experience Launcher */}
            <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-serif text-white">Active Connection Links</h3>
                  <p className="text-xs text-white/50">Share these with your recipient over WhatsApp, iMessage, or Instagram</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExperience(null);
                    setBuilderOpen(true);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create another link</span>
                </button>
              </div>

              <div className="space-y-3">
                {experiences.map((exp) => {
                  const respForThis = responses.filter((r) => r.experienceId === exp.id);
                  const isCopied = copiedSlug === exp.slug;
                  return (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                          <Heart className="w-5 h-5 text-rose-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">
                              For {exp.recipientName}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                exp.active
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : 'bg-white/5 border-white/10 text-white/40'
                              }`}
                            >
                              {exp.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 truncate mt-0.5 font-mono">
                            /f/{exp.slug} &bull; {exp.questions.length} questions &bull; {respForThis.length} responses
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(exp.slug)}
                          className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-white/60" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenExperience(exp)}
                          className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Test View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Completed Responses Preview */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-white">Latest Submissions</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('responses')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  View all &rarr;
                </button>
              </div>

              {responses.length === 0 ? (
                <p className="text-xs text-white/40 py-6 text-center">
                  No responses received yet. Send a link to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {responses.slice(0, 3).map((resp) => (
                    <div
                      key={resp.id}
                      onClick={() => setSelectedResponse(resp)}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-400/40 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xs font-semibold text-rose-300">
                          {resp.recipientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{resp.recipientName}</p>
                          <p className="text-xs text-white/40">
                            {Object.keys(resp.answers).length} questions answered &bull;{' '}
                            {resp.location?.formatted || 'No location'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-rose-400 hover:underline">
                          View details &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCES */}
        {activeTab === 'experiences' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-serif text-white">All Connection Experiences</h2>
              <button
                type="button"
                onClick={() => {
                  setEditingExperience(null);
                  setBuilderOpen(true);
                }}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Link</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiences.map((exp) => {
                const respCount = responses.filter((r) => r.experienceId === exp.id).length;
                const isCopied = copiedSlug === exp.slug;
                return (
                  <div
                    key={exp.id}
                    className="p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col justify-between gap-6"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                            Theme: {exp.theme}
                          </span>
                          <h3 className="text-xl font-serif text-white font-normal mt-0.5">
                            For {exp.recipientName}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(exp.id, exp.active)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                            exp.active
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          {exp.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <p className="text-xs text-white/60 line-clamp-2 italic mb-4">
                        "{exp.title}"
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center text-xs">
                        <div>
                          <p className="text-white/40">Questions</p>
                          <p className="font-semibold text-white mt-0.5">{exp.questions.length}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Views</p>
                          <p className="font-semibold text-white mt-0.5">{exp.viewCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Responses</p>
                          <p className="font-semibold text-rose-400 mt-0.5">{respCount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(exp.slug)}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Copy unique link"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExperience(exp);
                            setBuilderOpen(true);
                          }}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenExperience(exp)}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
                      >
                        <span>Open Recipient Flow</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESPONSES DASHBOARD */}
        {activeTab === 'responses' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-serif text-white">Responses Received</h2>
                <p className="text-xs text-white/50">Click on any response to inspect question-by-question breakdown</p>
              </div>
            </div>

            {responses.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel">
                <Heart className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/60">No completed responses yet.</p>
                <p className="text-xs text-white/40 mt-1">
                  Once a recipient answers all questions, their full conversation recap appears here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((resp) => {
                  const answerEntries = Object.values(resp.answers);
                  const foodAns = resp.answers['q2-food']?.value || 'Pizza 🍕';
                  const finalAns = resp.answers['q8-final']?.value || 'YES ❤️';
                  return (
                    <div
                      key={resp.id}
                      className="p-5 rounded-2xl glass-panel-subtle hover:border-rose-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-pink-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                          <Heart className="w-6 h-6 text-rose-400 fill-rose-500/30" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-serif text-white font-medium">
                              {resp.recipientName}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Completed {answerEntries.length} / {answerEntries.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(resp.completedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5" />
                              {resp.deviceCategory}
                            </span>
                            {resp.location?.formatted && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <MapPin className="w-3.5 h-3.5" />
                                {resp.location.formatted}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-rose-300 font-medium flex items-center gap-2">
                            <span>Choice: {Array.isArray(foodAns) ? foodAns.join(', ') : foodAns}</span>
                            <span>&bull;</span>
                            <span>Final: {Array.isArray(finalAns) ? finalAns.join(', ') : finalAns}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedResponse(resp)}
                          className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Full Breakdown
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResponse(resp.id)}
                          className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/5 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EMAIL DISPATCH */}
        {activeTab === 'email' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-white">Transactional Email System</h3>
                  <p className="text-xs text-white/50">Sender notification triggered upon recipient completion</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Whenever a recipient finishes answering all questions, an automated transactional email payload is dispatched to your creator address: <strong className="text-rose-300">{currentUser.email}</strong>.
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Email Trigger:</span>
                  <span className="text-emerald-400 font-medium">On Final Question Submit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Default Provider Architecture:</span>
                  <span className="text-white font-mono">Resend / Firebase Trigger Email</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Status:</span>
                  <span className="text-rose-300 font-medium">Active &amp; Simulating</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium text-xs shadow-md shadow-rose-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Rendered Email &amp; Webhook JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-xl">
            <div className="p-6 rounded-3xl glass-panel space-y-5">
              <h3 className="text-lg font-serif text-white">Account &amp; Persistence Settings</h3>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
                  Creator Name
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  onChange={(e) => storageService.updateCurrentUser({ name: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1">
                  Notification Email
                </label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  onChange={(e) => storageService.updateCurrentUser({ email: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Reset Demo Data</p>
                  <p className="text-[11px] text-white/40">Restore default sample experiences &amp; responses</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset to default sample data?')) {
                      storageService.resetToDefaults();
                      loadData();
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 text-xs font-medium border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Detail Viewer Modal */}
      {selectedResponse && (
        <ResponseViewer
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
        />
      )}

      {/* Experience Builder Modal */}
      {builderOpen && (
        <ExperienceBuilder
          initialExperience={editingExperience}
          onSave={handleSaveExperience}
          onClose={() => {
            setBuilderOpen(false);
            setEditingExperience(null);
          }}
          onOpenExperience={(exp) => {
            setBuilderOpen(false);
            setEditingExperience(null);
            onOpenExperience(exp);
          }}
          onNavigateToResponses={() => {
            setBuilderOpen(false);
            setEditingExperience(null);
            setActiveTab('responses');
          }}
        />
      )}

      {/* Email Simulator Modal */}
      {emailModalOpen && (
        <EmailSimulatorModal
          payload={emailPayload}
          onClose={() => setEmailModalOpen(false)}
        />
      )}
    </div>
  );
};
