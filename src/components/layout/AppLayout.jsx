// src/layouts/AppLayout.jsx

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { supabase } from "../../supabaseClient";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on settings page
  const hideSidebar = location.pathname.startsWith("/settings");

  // Logout Function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  return (
    <div className="flex min-h-dvh w-full overflow-x-hidden bg-[#020817]">
      
      {/* Sidebar (hidden on /settings) */}
      {!hideSidebar && <Sidebar />}

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}