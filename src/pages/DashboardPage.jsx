import WelcomeSection from '../components/Dashboard/WelcomeSection';
import RecentProjects from '../components/Dashboard/RecentProjects';
import PlanCard from '../components/Dashboard/PlanCard';
// import MyVoices from '../components/Dashboard/MyVoices';

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6">
      {/* Top Section — Tools + Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-9">
          <WelcomeSection />
        </div>
        <div className="lg:col-span-3 flex">
          <PlanCard />
        </div>
      </div>

      {/* Bottom Section — Projects */}
      <div>
        <RecentProjects />
      </div>
    </main>
  );
}
