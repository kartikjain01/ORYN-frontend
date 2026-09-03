import { Bell, Check, CheckCheck, Trash2, Info, Sparkles, AlertTriangle, ArrowUpCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const TYPE_CONFIG = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    dot: 'bg-blue-500',
  },
  success: {
    icon: Sparkles,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  update: {
    icon: ArrowUpCircle,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    dot: 'bg-violet-500',
  },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications();

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-blue-600" />
            <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[12px] font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-[14px] text-slate-500 mt-1">
            Real-time updates from ORYN Engine
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-4 px-6 py-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mt-2" />
                <div className="h-2.5 bg-slate-100 rounded w-16 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Bell size={28} className="text-slate-200" />
          </div>
          <p className="text-[16px] text-slate-400 font-medium">No notifications yet</p>
          <p className="text-[13px] text-slate-300 mt-1">
            You'll see real-time updates here when we send them
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-6 py-5 transition group ${
                  !n.isRead ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={config.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
                    )}
                    <h3 className={`text-[14px] font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                  </div>
                  {n.body && (
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                  )}
                  <p className="text-[12px] text-slate-400 mt-1.5">{n.time}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(n.id)}
                    title="Dismiss"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
