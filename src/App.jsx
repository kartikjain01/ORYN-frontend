import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Correct this path if you moved the file!
import { supabase } from "./supabaseClient"; 
import AppLayout from "./components/layout/AppLayout";

// Page Imports
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import VoiceCloningPage from "./pages/VoiceCloningPage";
import TextToSpeechPage from "./pages/TextToSpeechPage";
import VoiceEditorPage from "./pages/VoiceEditorPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/register" 
        element={!session ? <RegisterPage /> : <Navigate to="/voice-clone" replace />} 
      />
      
      {/* Group Protected Routes */}
      <Route element={session ? <AppLayout /> : <Navigate to="/register" replace />}>
        <Route path="/voice-clone" element={<VoiceCloningPage />} />
        <Route path="/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/voice-editor" element={<VoiceEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;