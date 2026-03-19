import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { supabase } from "../../supabaseClient"; // Ensure this path points to your src/supabaseClient.js

export default function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      // This clears the session and redirects to home/login
      navigate("/"); 
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020817]">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <div className="flex justify-end items-center p-4 border-b border-white/10 gap-4">
          {/* Settings Button */}
          <button
            className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors shadow-lg"
            onClick={() => navigate("/settings")}
            title="Settings"
          >
            S
          </button>

          {/* Logout Button */}
          <button
            className="px-4 py-2 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
}