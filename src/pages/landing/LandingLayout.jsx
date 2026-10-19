import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={null} />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function ServiceCrossLinks({ current }) {
  const services = [
    { name: 'AI Voice Cloning', to: '/voice-clone', desc: 'Clone any voice with AI' },
    { name: 'AI Text to Speech', to: '/text-to-speech', desc: 'Turn text into natural speech' },
    { name: 'AI Voice Editor', to: '/voice-editor', desc: 'Enhance and clean up audio' },
    { name: 'AI Caption Generator', to: '/caption-generation', desc: 'Add captions to your videos' },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Explore More AI Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.filter(s => s.to !== current).map(s => (
            <Link
              key={s.to}
              to={s.to}
              className="group block p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {s.name}
              </h3>
              <p className="text-[13px] text-slate-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
