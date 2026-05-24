import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Mic,
  Type,
  SlidersHorizontal,
  Star,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-[#0b0616]/90 px-4 py-4 backdrop-blur-xl md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-lg font-semibold text-white">ORYN</h2>

        <button
          onClick={() => navigate("/settings")}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] transform border-r border-white/10 bg-[#0b0616] transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-6">
          {/* TOP */}
          <div>
            {/* HEADER */}
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">ORYN</h2>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* NAVIGATION */}
            <nav className="space-y-3">
              <MobileNavItem
                to="/"
                Icon={Home}
                label="Home"
                end
                onClick={() => setMobileOpen(false)}
              />

              <MobileNavItem
                to="/voice-clone"
                Icon={Mic}
                label="Voice Clone"
                onClick={() => setMobileOpen(false)}
              />

              <MobileNavItem
                to="/text-to-speech"
                Icon={Type}
                label="Text to Speech"
                onClick={() => setMobileOpen(false)}
              />

              <MobileNavItem
                to="/voice-editor"
                Icon={SlidersHorizontal}
                label="Voice Editor"
                onClick={() => setMobileOpen(false)}
              />
            </nav>
          </div>

          {/* BOTTOM */}
          <div className="space-y-3">
            <MobileButton Icon={Star} label="Favorites" />

            <MobileButton
              Icon={Settings}
              label="Settings"
              onClick={() => {
                navigate("/settings");
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      </aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:block w-[88px] lg:w-[92px] shrink-0 border-r border-white/10 bg-[#0b0616]/40 backdrop-blur-xl h-screen sticky top-0">
        <div className="flex h-full flex-col items-center justify-between py-8">
          {/* MAIN NAVIGATION */}
          <nav className="flex flex-col items-center gap-6">
            <SideNavIcon to="/" Icon={Home} label="Home" end />

            <SideNavIcon
              to="/voice-clone"
              Icon={Mic}
              label="Voice Clone"
            />

            <SideNavIcon
              to="/text-to-speech"
              Icon={Type}
              label="Text to Speech"
            />

            <SideNavIcon
              to="/voice-editor"
              Icon={SlidersHorizontal}
              label="Voice Editor"
            />
          </nav>

          {/* BOTTOM ACTIONS */}
          <div className="flex flex-col items-center gap-6">
            <IconButton Icon={Star} label="Favorites" />

            <IconButton
              Icon={Settings}
              label="Settings"
              onClick={() => navigate("/settings")}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

/* ================= DESKTOP NAV ITEM ================= */
function SideNavIcon({ to, Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative grid h-12 w-12 place-items-center rounded-2xl transition duration-300 ${
          isActive
            ? "border border-white/10 bg-white/15 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon className="h-6 w-6" strokeWidth={2} />
      <Tooltip>{label}</Tooltip>
    </NavLink>
  );
}

/* ================= DESKTOP ICON BUTTON ================= */
function IconButton({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative grid h-12 w-12 place-items-center rounded-2xl text-white/60 transition duration-300 hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-6 w-6" strokeWidth={2} />
      <Tooltip>{label}</Tooltip>
    </button>
  );
}

/* ================= MOBILE NAV ITEM ================= */
function MobileNavItem({ to, Icon, label, onClick, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-4 rounded-2xl px-4 py-4 transition ${
          isActive
            ? "border border-white/10 bg-white/10 text-white"
            : "text-white/65 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={22} strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}

/* ================= MOBILE BUTTON ================= */
function MobileButton({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-white/65 transition hover:bg-white/5 hover:text-white"
    >
      <Icon size={22} strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/* ================= TOOLTIP ================= */
function Tooltip({ children }) {
  return (
    <span className="pointer-events-none absolute left-[75px] z-50 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#161122] px-3 py-1.5 text-[11px] font-medium text-white shadow-2xl backdrop-blur-md transition-all group-hover:block animate-in fade-in slide-in-from-left-2">
      {children}
    </span>
  );
}