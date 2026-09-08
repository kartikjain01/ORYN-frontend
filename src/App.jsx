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
const CaptionGenerationPage = lazy(() => import("./pages/CaptionGenerationPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const UpgradePage = lazy(() => import("./pages/UpgradePage"));
const ProfilePanel = lazy(() => import("./components/layout/ProfilePanel"));

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

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showProfile } = useProfile();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

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
          <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <HomePage />} />

          <Route
            path="/register"
            element={!session ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
          />

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
            <Route path="/caption-generation" element={<CaptionGenerationPage />} />
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
