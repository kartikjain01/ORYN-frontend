import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 size={24} className="text-blue-600" />
        <h1 className="text-[28px] font-bold text-slate-900">Analytics</h1>
      </div>
      <p className="text-slate-500 mb-8">Track your usage, engagement and performance.</p>

      <div className="relative">
        <div className="opacity-40 blur-[2px] pointer-events-none select-none space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Total Projects", "Voices Created", "Audio Generated", "This Month"].map((label) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100" />
                <div>
                  <p className="text-[12px] text-slate-400 font-medium">{label}</p>
                  <p className="text-[22px] font-bold text-slate-900 leading-tight">--</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 h-[200px]" />
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 h-[200px]" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-8 py-10 rounded-2xl bg-white/90 shadow-xl border border-slate-200/60 max-w-md backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
            <p className="text-[14px] text-slate-500 leading-relaxed">Detailed analytics and usage insights are being built. You'll be able to track projects, audio generation, and performance here.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
