import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "../Dashboard/DashboardSidebar";
import DashboardHeader from "../Dashboard/DashboardHeader";

export default function AppLayout() {
  const location = useLocation();
  const isSettings = location.pathname.startsWith("/settings");

  if (isSettings) {
    return (
      <div className="relative h-dvh w-full overflow-y-auto bg-[#f8fafc]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
