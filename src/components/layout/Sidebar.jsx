import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  Mic, 
  Type, 
  SlidersHorizontal, 
  Star, 
  Settings 
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-[92px] shrink-0 border-r border-white/10 bg-[#0b0616]/40 backdrop-blur-xl h-screen sticky top-0">
      <div className="flex h-full flex-col items-center justify-between py-8">
        
        {/* Main navigation - Top Section */}
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

        {/* Bottom actions - Integrated from friend's functional layout */}
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
  );
}

function SideNavIcon({ to, Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative grid h-12 w-12 place-items-center rounded-2xl transition duration-300 ${
          isActive
            ? "bg-white/15 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon className="h-6 w-6" strokeWidth={2} />
      <Tooltip>{label}</Tooltip>
    </NavLink>
  );
}

function IconButton({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative grid h-12 w-12 place-items-center rounded-2xl transition duration-300 text-white/60 hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-6 w-6" strokeWidth={2} />
      <Tooltip>{label}</Tooltip>
    </button>
  );
}

function Tooltip({ children }) {
  return (
    <span className="pointer-events-none absolute left-[75px] z-50 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#161122] px-3 py-1.5 text-[11px] font-medium text-white shadow-2xl backdrop-blur-md group-hover:block transition-all animate-in fade-in slide-in-from-left-2">
      {children}
    </span>
  );
}