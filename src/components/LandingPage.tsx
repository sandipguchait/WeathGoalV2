import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans selection:text-emerald-400">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">Zenith Portfolio</span>
        </div>
        <button 
          onClick={onSignIn}
          className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-colors active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none opacity-40">
           <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-emerald-600 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[150px] animate-pulse delay-75"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
              The Architecture of Wealth
            </span>
            <h1 className="text-6xl md:text-[140px] font-black leading-[0.85] tracking-tighter uppercase italic mb-8">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">Milestones</span>
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-10">
              Stop guessing. Start orchestrating. Zenith is the premier portfolio strategy platform designed for the disciplined accumulator.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onSignIn}
                className="group w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                Launch Console
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#features" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                Explore Tech
              </a>
            </div>
          </motion.div>

          {/* Hero Decorative Image Replacement (Glassy Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[40px] border border-white/10 shadow-2xl p-4 overflow-hidden relative group">
              <img 
                src="https://picsum.photos/seed/wealth-tech/1200/800?grayscale" 
                alt="Product Preview" 
                className="w-full h-full object-cover rounded-[32px] opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[2s]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce cursor-pointer hover:scale-110 transition-transform" onClick={onSignIn}>
                   <Zap className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              {/* Floating UI elements simulations */}
              <div className="absolute top-10 left-10 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hidden md:block">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Projection</div>
                      <div className="text-lg font-black font-mono">₹1.4M Cr</div>
                   </div>
                </div>
              </div>
              <div className="absolute bottom-10 right-10 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hidden md:block">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Strategic Gap</div>
                      <div className="text-lg font-black font-mono text-emerald-400">0.00%</div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-white/5 pb-10">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">Master your <br />Asset Allocation</h2>
              <p className="text-zinc-400 text-lg">Sophisticated tools for modern builders. Track ETFs, Mutual Funds, Stocks, and International exposure with zero latency.</p>
            </div>
            <div className="hidden md:block">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[.5em]">System Protocols v4.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <PieChart className="w-6 h-6" />,
                title: "Asset Intelligence",
                desc: "Granular breakdown of your portfolio across 8 distinct asset classes with real-time target variance."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Monthly Registry",
                desc: "A focused execution chamber where monthly goals are tracked and verified against your master strategy."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Projection Engine",
                desc: "Advanced logic models that calculate your 2026 trajectory based on current deployment velocity."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-zinc-900/50 border border-white/5 p-10 rounded-[32px] hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tight mb-4">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-6 bg-emerald-600 text-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-12 flex-wrap opacity-60 grayscale mb-20">
             {/* Mock Partner Logos */}
             <span className="text-2xl font-black italic tracking-tighter uppercase">Nexus Cap</span>
             <span className="text-2xl font-black italic tracking-tighter uppercase">Iron Gate</span>
             <span className="text-2xl font-black italic tracking-tighter uppercase">Blackstone</span>
             <span className="text-2xl font-black italic tracking-tighter uppercase">Vanguard</span>
             <span className="text-2xl font-black italic tracking-tighter uppercase">Fidelity</span>
          </div>
          <h2 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] mb-12">
            Built for those <br />who build value.
          </h2>
          <button 
            onClick={onSignIn}
            className="px-12 py-6 bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 mx-auto text-lg shadow-2xl"
          >
            Get Infinite Access
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">Zenith V1.0</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Security</a>
             <a href="#" className="hover:text-white transition-colors">Open Source</a>
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase">© 2026 ZENITH STRATEGIC. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
