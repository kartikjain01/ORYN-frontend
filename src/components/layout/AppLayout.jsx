// src/layouts/AppLayout.jsx

import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { supabase } from "../../supabaseClient";

export default function AppLayout() {
  const navigate = useNavigate();

  // Logout Function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }

      // Redirect to login/home
      navigate("/");
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020817]">
      {' '}
      {/* Added a dark background base if needed */}
      {/* Sidebar */}
      <Sidebar />
      {/* Page content */}
      <main className="flex-1 flex flex-col">
        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
