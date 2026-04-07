import { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [showProfile, setShowProfile] = useState(false);

  // 🔥 NEW: global profile data
  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    email: "",
  });

  return (
    <ProfileContext.Provider
      value={{
        showProfile,
        setShowProfile,
        profile,
        setProfile, // 🔥 important
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);