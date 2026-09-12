import React, { useState, useEffect } from 'react';
import { Experience, EmailNotificationPayload } from './types';
import { storageService } from './services/storageService';
import { emailService } from './services/emailService';
import { initAnonymousAuth } from './services/firebaseConfig';
import { RecipientExperience } from './components/RecipientExperience';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  Heart,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Layers,
  CheckCircle2,
  Share2,
  Mail,
  ChevronDown,
  Loader2,
} from 'lucide-react';

type AppMode = 'recipient' | 'creator';
type DeviceFrame = 'full' | 'mobile' | 'tablet';
type StudioTab = 'overview' | 'experiences' | 'responses' | 'email' | 'settings';

export default function App() {
  const [mode, setMode] = useState<AppMode>('recipient');
  const [isRecipientRoute, setIsRecipientRoute] = useState<boolean>(false);
  const [studioTab, setStudioTab] = useState<StudioTab>('overview');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('full');
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [notificationToast, setNotificationToast] = useState<EmailNotificationPayload | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Trigger a brief simulated network/data loading transition for skeleton preview
  const handleSimulateLoading = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 2000);
  };

  // Initialize Firebase and anonymous authentication to secure session data
  useEffect(() => {
    initAnonymousAuth()
      .then((user) => {
        if (user) {
          console.info('Firebase anonymous auth session established:', user.uid);
        }
      })
      .catch((err) => {
        console.warn('Firebase anonymous authentication notice:', err);
      });
  }, []);

  // Initialize and listen to hash routing
  useEffect(() => {
    const list = storageService.getExperiences();
    setExperiences(list);

    const parseRoute = async () => {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';
      const search = new URLSearchParams(window.location.search);
      const querySlug = search.get('f');

      // Check for Creator Studio routes (/studio/*, #/studio/*, etc.)
      if (
        pathname.startsWith('/studio') ||
        pathname.startsWith('/admin') ||
        hash.startsWith('#/studio') ||
        hash.startsWith('#studio') ||
        hash.startsWith('#/admin') ||
        hash.startsWith('#admin')
      ) {
        setMode('creator');
        setIsRecipientRoute(false);
        const routeStr = pathname.startsWith('/studio') || pathname.startsWith('/admin')
          ? pathname
          : hash;
        const sub = routeStr.replace(/^#?\/?(studio|admin)\/?/, '').split('/')[0];
        if (['overview', 'experiences', 'responses', 'email', 'settings'].includes(sub)) {
          setStudioTab(sub as StudioTab);
        }
        return;
      }

      // Check for recipient routes: /f/:slug, #/f/:slug, #f/:slug, or ?f=:slug
      let targetSlug = '';
      if (pathname.startsWith('/f/')) {
        targetSlug = pathname.replace('/f/', '').split('/')[0];
      } else if (hash.startsWith('#/f/')) {
        targetSlug = hash.replace('#/f/', '').split('/')[0];
      } else if (hash.startsWith('#f/')) {
        targetSlug = hash.replace('#f/', '').split('/')[0];
      } else if (querySlug) {
        targetSlug = querySlug;
      }

      if (targetSlug) {
        setIsRecipientRoute(true);
        setMode('recipient');
        setRouteError(null);

        // Immediate check from local cache
        const localFound = storageService.getExperienceBySlug(targetSlug);
        if (localFound) {
          if (localFound.active === false) {
            setRouteError('This intimate experience is no longer active.');
            setActiveExperience(null);
            return;
          }
          setActiveExperience(localFound);
          return;
        }

        // Asynchronous single-read fetch from Firestore
        setIsFetching(true);
        try {
          const cloudFound = await storageService.fetchExperienceBySlugOrId(targetSlug);
          if (cloudFound) {
            if (cloudFound.active === false) {
              setRouteError('This intimate experience is no longer active.');
              setActiveExperience(null);
            } else {
              setActiveExperience(cloudFound);
              setRouteError(null);
            }
          } else {
            setRouteError('The requested connection link does not exist or has expired.');
            setActiveExperience(null);
          }
        } catch {
          setRouteError('The requested connection link could not be loaded.');
          setActiveExperience(null);
        } finally {
          setIsFetching(false);
        }
        return;
      }

      // Default or root preview
      setIsRecipientRoute(false);
      setRouteError(null);
      if (list.length > 0 && !activeExperience) {
        setActiveExperience(list[0]);
      }
    };

    parseRoute();
    window.addEventListener('hashchange', parseRoute);
    window.addEventListener('popstate', parseRoute);

    // Listen for storage changes
    const handleStorageChange = () => {
      const updated = storageService.getExperiences();
      setExperiences(updated);
      if (activeExperience) {
        const refreshed = storageService.getExperienceById(activeExperience.id);
        if (refreshed) setActiveExperience(refreshed);
      }
    };
    window.addEventListener('closer-storage-update', handleStorageChange);

    // Subscribe to email notifications
    const unsubEmail = emailService.subscribeToNotifications((payload) => {
      setNotificationToast(payload);
      setTimeout(() => {
        setNotificationToast(null);
      }, 7000);
    });

    return () => {
      window.removeEventListener('hashchange', parseRoute);
      window.removeEventListener('closer-storage-update', handleStorageChange);
      unsubEmail();
    };
  }, []);

  const handleSelectExperience = (exp: Experience) => {
    setIsFetching(true);
    setRouteError(null);
    setActiveExperience(exp);
    setMode('recipient');
    setDropdownOpen(false);
    window.location.hash = `/f/${exp.slug}`;
    setTimeout(() => setIsFetching(false), 450);
  };

  const handleOpenFromCreator = (exp: Experience) => {
    setIsFetching(true);
    setRouteError(null);
    setActiveExperience(exp);
    setMode('recipient');
    window.location.hash = `/f/${exp.slug}`;
    setTimeout(() => setIsFetching(false), 450);
  };

  const handleCopyCurrentLink = () => {
    if (!activeExperience) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://closer.app';
    const link = `${origin}/#f/${activeExperience.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedToast(`Link for ${activeExperience.recipientName} copied!`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  if (!activeExperience && experiences.length > 0) {
    setActiveExperience(experiences[0]);
  }

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex flex-col font-sans relative">
      {/* Top Floating Universal Navigation Bar - strictly hidden on direct recipient route */}
      {!isRecipientRoute && (
        <header className="sticky top-0 z-50 w-full bg-[#080712]/80 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          {/* Brand & Experience Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-950/60">
                <Heart className="w-4 h-4 text-white fill-white/80" />
              </div>
              <span className="font-serif text-base sm:text-lg font-medium text-white tracking-wide">
                Closer
              </span>
            </div>

            {/* Recipient Link Switcher Dropdown in studio preview */}
            {mode === 'recipient' && activeExperience && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-rose-300 font-medium transition-colors cursor-pointer"
                >
                  <span>For {activeExperience.recipientName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl bg-[#0f0d1c] border border-white/10 shadow-2xl p-1.5 z-50 animate-fade-in">
                    <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                      Select Experience Link
                    </div>
                    {experiences.map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => handleSelectExperience(exp)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          activeExperience.id === exp.id
                            ? 'bg-rose-500/20 text-white font-semibold'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">For {exp.recipientName}</span>
                        <span className="text-[10px] text-white/30 font-mono">/f/{exp.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Device Viewport Toggle (when previewing Recipient mode) */}
          {mode === 'recipient' && (
            <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setDeviceFrame('mobile')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  deviceFrame === 'mobile' ? 'bg-rose-500 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                title="Mobile Phone View (390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('tablet')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  deviceFrame === 'tablet' ? 'bg-rose-500 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('full')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  deviceFrame === 'full' ? 'bg-rose-500 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
                title="Full Responsive Canvas"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mode Switcher: Recipient View vs Creator Studio */}
          <div className="flex items-center gap-2">
            {mode === 'recipient' && activeExperience && (
              <>
                <button
                  type="button"
                  onClick={handleSimulateLoading}
                  disabled={isFetching}
                  className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-medium transition-colors cursor-pointer text-xs"
                  title="Preview shimmer loading skeleton"
                >
                  {isFetching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>{isFetching ? 'Loading…' : 'Preview Shimmer'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentLink}
                  className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer text-xs"
                  title="Copy shareable link"
                >
                  <Share2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Share Link</span>
                </button>
              </>
            )}

            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('recipient');
                  if (activeExperience) {
                    window.location.hash = `/f/${activeExperience.slug}`;
                  }
                }}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  mode === 'recipient'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Recipient View
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('creator');
                  window.location.hash = `/studio/${studioTab}`;
                }}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  mode === 'creator'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Creator Studio</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {mode === 'creator' ? (
          <div className="w-full">
            <AdminDashboard
              initialTab={studioTab}
              onTabChange={(tab) => {
                setStudioTab(tab);
                window.location.hash = `/studio/${tab}`;
              }}
              onOpenExperience={handleOpenFromCreator}
            />
          </div>
        ) : (
          <div className="w-full flex-1 flex items-center justify-center p-0">
            {routeError ? (
              <div className="w-full max-w-md mx-auto p-8 sm:p-10 rounded-3xl glass-panel text-center flex flex-col items-center animate-card-enter border border-white/10 m-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5 shadow-lg shadow-rose-950/40">
                  <Heart className="w-8 h-8 text-rose-400/50" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-2">Link Unavailable</h2>
                <p className="text-sm text-white/60 mb-6 font-light leading-relaxed">
                  {routeError}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {experiences.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectExperience(experiences[0])}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium text-sm hover:from-rose-600 hover:to-pink-600 transition-all cursor-pointer shadow-md shadow-rose-500/20"
                    >
                      View Closer Experience
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('creator');
                      window.location.hash = '/studio/overview';
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white font-medium text-sm border border-white/10 transition-all cursor-pointer"
                  >
                    Creator Studio
                  </button>
                </div>
              </div>
            ) : activeExperience ? (
              <div
                className={`w-full transition-all duration-300 ${
                  !isRecipientRoute && deviceFrame === 'mobile'
                    ? 'max-w-[412px] min-h-[820px] rounded-[40px] border-[8px] border-[#1d182b] shadow-2xl overflow-hidden my-4 relative bg-[#06060c]'
                    : !isRecipientRoute && deviceFrame === 'tablet'
                    ? 'max-w-[768px] min-h-[900px] rounded-[32px] border-[6px] border-[#1d182b] shadow-2xl overflow-hidden my-4 relative bg-[#06060c]'
                    : 'w-full'
                }`}
              >
                {/* Simulated mobile speaker bar if in framed preview device mode */}
                {!isRecipientRoute && deviceFrame !== 'full' && (
                  <div className="w-full flex justify-center pt-2 pb-1 bg-transparent absolute top-0 left-0 z-30 pointer-events-none">
                    <div className="w-20 h-1.5 rounded-full bg-white/20" />
                  </div>
                )}

                <RecipientExperience
                  key={activeExperience.id}
                  experience={activeExperience}
                  isLoading={isFetching}
                  onExit={() => {
                    setMode('creator');
                    window.location.hash = '/studio/overview';
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-white/60">No connection experience selected.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification when Link is Copied */}
      {copiedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 py-2 px-4 rounded-full bg-[#1b152d]/95 border border-rose-400/40 text-rose-200 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in pointer-events-none"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Live Transactional Email Toast Notification */}
      {notificationToast && (
        <aside
          aria-label="Email notification"
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl bg-[#141024] border border-rose-500/40 shadow-2xl shadow-rose-950/80 flex items-start gap-3 animate-fade-in"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                Email Dispatched
              </span>
              <span className="text-[10px] text-white/40">Just now</span>
            </div>
            <p className="text-xs font-semibold text-white truncate mt-0.5">
              {notificationToast.recipientName} completed your experience! ❤️
            </p>
            <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">
              Subject: {notificationToast.subject}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('creator')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                View in Creator Studio &rarr;
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
