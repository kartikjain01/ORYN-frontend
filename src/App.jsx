import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AppLayout from "./components/layout/AppLayout";

// Pages
import HomePage from "./pages/HomePage"; // Create or import your Home Page
import RegisterPage from "./pages/RegisterPage";
import ForgetPassword from "./pages/Forgetpassword";
import VoiceCloningPage from "./pages/VoiceCloningPage";
import TextToSpeechPage from "./pages/TextToSpeechPage";
import VoiceEditorPage from "./pages/VoiceEditorPage";
import SettingsPage from "./pages/SettingsPage";


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Routes>
      {/* 1. PUBLIC HOME PAGE
          This is always the first page. No redirect here.
      */}
      <Route path="/" element={<HomePage />} />

      {/* 2. AUTH PAGE
          If logged in, send them to Home. If not, show Register/Login.
      */}
      <Route
        path="/register"
        element={!session ? <RegisterPage /> : <Navigate to="/" replace />}
      />
       {/* ✅ Public Forgot Password Route */}
  <Route path="/forgot-password" element={<ForgetPassword />} />

      <Route
        path="/login"
        element={!session ? <RegisterPage /> : <Navigate to="/" replace />}
      />

      {/* 3. PROTECTED ROUTES
          Requires login. If no session, redirect to /register.
      */}
      <Route
        element={session ? <AppLayout /> : <Navigate to="/register" replace />}
      >
        <Route path="/voice-clone" element={<VoiceCloningPage />} />
        <Route path="/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/voice-editor" element={<VoiceEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
