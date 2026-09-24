import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
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

  if (loading) return null;

  return (
    <ErrorBoundary>
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

          <Route path="/forgot-password" element={<ForgetPassword />} />

          <Route path="/reset-password" element={<ForgetPassword />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showProfile && <ProfilePanel user={session?.user} />}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
