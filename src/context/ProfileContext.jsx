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

    if (data?.deleted_at) {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setProfile(null);
      window.location.href = '/register';
      return;
    }

    if (!data.full_name) {
      const meta = user?.user_metadata || {};
      const oauthName = meta.full_name || meta.name || '';
      const oauthAvatar = meta.avatar_url || meta.picture || '';
      if (oauthName) {
        const updates = { full_name: oauthName };
        if (oauthAvatar && !data.avatar_url) updates.avatar_url = oauthAvatar;
        await supabase.from('profiles').update(updates).eq('id', userId);
        Object.assign(data, updates);
      }
    }

    setProfile(data);
  };

  /* ================= AUTO LOAD PROFILE ================= */

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
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
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
