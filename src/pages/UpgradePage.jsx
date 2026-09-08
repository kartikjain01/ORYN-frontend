import { Crown, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Get started with basic AI voice tools.",
    features: ["5 voice clones per month", "10 minutes TTS generation", "Basic voice editor", "500 MB storage", "Community support"],
  },
  {
    name: "Pro",
    description: "For creators and professionals who need more.",
    features: ["Unlimited voice clones", "120 minutes TTS generation", "Advanced voice editor + effects", "Caption generation", "10 GB storage", "Priority support", "API access"],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and businesses at scale.",
    features: ["Everything in Pro", "Unlimited TTS generation", "Custom voice models", "Dedicated infrastructure", "50 GB storage", "SLA & priority support", "SSO & team management"],
  },
];

export default function UpgradePage() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <Crown size={24} className="text-blue-600" />
        <h1 className="text-[28px] font-bold text-slate-900">Upgrade Plan</h1>
      </div>
      <p className="text-slate-500 mb-8">Unlock more features with a premium plan.</p>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto opacity-40 blur-[2px] pointer-events-none select-none">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white rounded-2xl border p-6 ${plan.popular ? "border-blue-300" : "border-slate-200"}`}>
              <h3 className="text-[18px] font-bold text-slate-900">{plan.name}</h3>
              <p className="text-[12px] text-slate-400 mt-1 mb-4">{plan.description}</p>
              <div className="text-[36px] font-bold text-slate-900 mb-6">--</div>
              <div className="w-full h-[44px] rounded-xl bg-slate-100" />
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                    <span className="text-[13px] text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-8 py-10 rounded-2xl bg-white/90 shadow-xl border border-slate-200/60 max-w-md backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
            <p className="text-[14px] text-slate-500 leading-relaxed">Premium plans are being finalized. You're currently on the Free plan with full access to all core features.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
