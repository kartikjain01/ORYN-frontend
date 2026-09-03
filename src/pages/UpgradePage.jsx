import { Crown } from "lucide-react";

export default function UpgradePage() {
  return (
    <main className="flex-1 p-8">
      <div className="flex items-center gap-3 mb-2">
        <Crown size={24} className="text-blue-600" />
        <h1 className="text-[28px] font-bold text-slate-900">Upgrade Plan</h1>
      </div>
      <p className="text-slate-500 mb-10">Unlock more features with a premium plan.</p>
      <div className="flex items-center justify-center h-[300px] rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 text-[15px]">Pricing plans coming soon.</p>
      </div>
    </main>
  );
}
