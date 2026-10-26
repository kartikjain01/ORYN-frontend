import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useProfile } from "./context/ProfileContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgetPassword = lazy(() => import("./pages/Forgetpassword"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const VoiceCloningPage = lazy(() => import("./pages/VoiceCloningPage"));
const TextToSpeechPage = lazy(() => import("./pages/TextToSpeechPage"));
const VoiceEditorPage = lazy(() => import("./pages/VoiceEditorPage"));
const CaptionGenerationPage = lazy(
  () => import('./pages/CaptionGenerationPage')
);
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const UpgradePage = lazy(() => import("./pages/UpgradePage"));
const ProfilePanel = lazy(() => import('./components/layout/ProfilePanel'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const BlogIndex = lazy(() => import('./pages/blog/BlogIndex'));
const AiVoiceCloningGuide = lazy(() => import('./pages/blog/AiVoiceCloningGuide'));
const TextToSpeechCreators = lazy(() => import('./pages/blog/TextToSpeechCreators'));
const AiCaptionsVideo = lazy(() => import('./pages/blog/AiCaptionsVideo'));
const VoiceEditorGuide = lazy(() => import('./pages/blog/VoiceEditorGuide'));
const HowAiVoiceCloningWorks = lazy(() => import('./pages/blog/HowAiVoiceCloningWorks'));
const BestFreeTtsTools2026 = lazy(() => import('./pages/blog/BestFreeTtsTools2026'));
const AiAudioEnhancement = lazy(() => import('./pages/blog/AiAudioEnhancement'));
const PodcastWithAi = lazy(() => import('./pages/blog/PodcastWithAi'));
const VoiceCloningEthics = lazy(() => import('./pages/blog/VoiceCloningEthics'));
const AiToolsYoutubers = lazy(() => import('./pages/blog/AiToolsYoutubers'));

import CookieConsent from './components/CookieConsent';
import { startKeepAlive, stopKeepAlive } from './lib/keepAlive';

const VoiceCloningLanding = lazy(() => import("./pages/landing/VoiceCloningLanding"));
const TextToSpeechLanding = lazy(() => import("./pages/landing/TextToSpeechLanding"));
const VoiceEditorLanding = lazy(() => import("./pages/landing/VoiceEditorLanding"));
const CaptionGenerationLanding = lazy(() => import("./pages/landing/CaptionGenerationLanding"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[13px] text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function VerifySuccess() {
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      setStatus('done');
      return;
    }

    supabase.auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        setStatus(error ? 'error' : 'done');
      })
      .catch(() => setStatus('error'))
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, []);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400 font-medium">Verifying...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-sm">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
          <p className="mt-2 text-[14px] text-slate-500">This link may have expired. Please request a new verification email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 max-w-sm">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
        <p className="mt-2 text-[14px] text-slate-500">You can close this tab and return to your original window.</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showProfile } = useProfile();

  useEffect(() => {
    const init = async () => {
      const urlCode = new URLSearchParams(window.location.search).get('code');
      if (urlCode && window.location.pathname !== '/verify-success') {
        const isOAuth = sessionStorage.getItem('oauth_redirect');
        sessionStorage.removeItem('oauth_redirect');

        if (isOAuth) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(urlCode);
          window.history.replaceState({}, '', window.location.pathname);
          if (!error && data?.session) {
            const termsAccepted = sessionStorage.getItem('terms_accepted_at');
            sessionStorage.removeItem('terms_accepted_at');
            if (termsAccepted) {
              supabase.auth.updateUser({
                data: {
                  terms_accepted_at: termsAccepted,
                  privacy_accepted_at: termsAccepted,
                },
              });
            }
            setSession(data.session);
            setLoading(false);
            return;
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) startKeepAlive();
    else stopKeepAlive();
    return () => stopKeepAlive();
  }, [session]);

  if (loading) return null;

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              session ? <Navigate to="/dashboard" replace /> : <HomePage />
            }
          />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/verify-success" element={<VerifySuccess />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="/terms" element={<TermsOfUse />} />

          <Route path="/cookies" element={<CookiePolicy />} />

          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/ai-voice-cloning-guide" element={<AiVoiceCloningGuide />} />
          <Route path="/blog/text-to-speech-creators" element={<TextToSpeechCreators />} />
          <Route path="/blog/ai-captions-video" element={<AiCaptionsVideo />} />
          <Route path="/blog/ai-voice-editor-guide" element={<VoiceEditorGuide />} />
          <Route path="/blog/how-ai-voice-cloning-works" element={<HowAiVoiceCloningWorks />} />
          <Route path="/blog/best-free-tts-tools-2026" element={<BestFreeTtsTools2026 />} />
          <Route path="/blog/ai-audio-enhancement-guide" element={<AiAudioEnhancement />} />
          <Route path="/blog/start-podcast-with-ai-tools" element={<PodcastWithAi />} />
          <Route path="/blog/voice-cloning-ethics-legal-guide" element={<VoiceCloningEthics />} />
          <Route path="/blog/ai-tools-for-youtubers-2026" element={<AiToolsYoutubers />} />

          <Route path="/forgot-password" element={<ForgetPassword />} />

          <Route path="/reset-password" element={<ForgetPassword />} />

          {!session && (
            <>
              <Route path="/voice-clone" element={<VoiceCloningLanding />} />
              <Route path="/text-to-speech" element={<TextToSpeechLanding />} />
              <Route path="/voice-editor" element={<VoiceEditorLanding />} />
              <Route path="/caption-generation" element={<CaptionGenerationLanding />} />
            </>
          )}

          <Route
            element={
              session ? <AppLayout /> : <Navigate to="/register" replace />
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/voice-clone" element={<VoiceCloningPage />} />

            <Route path="/text-to-speech" element={<TextToSpeechPage />} />

            <Route path="/voice-editor" element={<VoiceEditorPage />} />

            <Route
              path="/caption-generation"
              element={<CaptionGenerationPage />}
            />

            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/projects" element={<ProjectsPage />} />

            <Route path="/analytics" element={<AnalyticsPage />} />

            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/upgrade" element={<UpgradePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {showProfile && <ProfilePanel user={session?.user} />}
        <CookieConsent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
