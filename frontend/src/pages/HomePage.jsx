import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Box, Shirt, Database, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Phase 0 • Foundation Architecture Ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Next-Generation{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            3D Virtual Costume
          </span>{' '}
          Try-On Experience
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          TryItOn brings hyper-realistic 3D garment fittings directly to your browser with Three.js, React Three Fiber, and high-performance backend micro-services.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-800/80 hover:text-white transition-all"
          >
            <span>View Architecture</span>
          </a>
        </div>

        {/* Foundation Feature Highlights */}
        <div id="architecture" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-purple-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3D Graphics Core</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Equipped with Three.js, React Three Fiber, and Drei ready for real-time 3D avatar visualization and garment overlay.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Virtual Costume Pipeline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modular frontend and backend architecture designed for seamless costume catalog browsing, fitting configs, and asset delivery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-emerald-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Enterprise Ready Backend</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Express.js REST API with PostgreSQL connection pooling, centralized routing, request logging, and health diagnostics.
            </p>
          </div>
        </div>

        {/* Phase Checklist Badge Card */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 max-w-2xl mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Phase 0 Foundation Checklist
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>React 18 & Vite</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>React Router v6</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Three.js & R3F Stack</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Express API Server</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GET /api/health</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tailwind CSS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
