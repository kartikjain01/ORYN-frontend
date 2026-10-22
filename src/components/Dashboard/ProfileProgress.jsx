import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { UserCircle } from 'lucide-react';

const FIELDS = [
  { key: 'full_name' },
  { key: 'avatar_url' },
  { key: 'age' },
  { key: 'gender' },
  { key: 'mobile' },
  { key: 'birthday' },
];

export default function ProfileProgress() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  if (!profile) return null;

  const filled = FIELDS.filter(f => profile[f.key] && String(profile[f.key]).trim() !== '').length;
  const total = FIELDS.length;
  const percent = Math.round((filled / total) * 100);

  if (percent === 100) return null;

  return (
    <div
      onClick={() => navigate('/settings')}
      className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 px-5 py-4 cursor-pointer transition hover:border-sky-300 hover:bg-sky-50"
    >
      <div className="relative shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" stroke="#bae6fd" strokeWidth="4" fill="none" />
          <circle
            cx="24" cy="24" r="20"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${(percent / 100) * 125.6} 125.6`}
            transform="rotate(-90 24 24)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-sky-700">{percent}%</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <UserCircle size={16} className="text-sky-600 shrink-0" />
          <p className="text-[13px] font-semibold text-slate-800">
            Complete your profile
          </p>
        </div>
      </div>

      <span className="shrink-0 text-[11px] font-medium text-sky-600 bg-sky-100 px-2.5 py-1 rounded-full">
        {filled}/{total}
      </span>
    </div>
  );
}
