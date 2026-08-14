import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 new

  /* ================= GET USER ================= */

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };

    getUser();

    // 🔥 listen to login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async userId => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error.message);
      return;
    }

    setProfile(data);
  };

  /* ================= AUTO LOAD PROFILE ================= */

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null); // logout cleanup
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        showProfile,
        setShowProfile,
        profile,
        setProfile,
        fetchProfile,
        user,
        loading, // 🔥 important
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
