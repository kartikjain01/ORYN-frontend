import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="flex-1 p-8">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 size={24} className="text-blue-600" />
        <h1 className="text-[28px] font-bold text-slate-900">Analytics</h1>
      </div>
      <p className="text-slate-500 mb-10">Track your usage, engagement and performance.</p>
      <div className="flex items-center justify-center h-[300px] rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 text-[15px]">Analytics data will appear here.</p>
      </div>
    </main>
  );
}
