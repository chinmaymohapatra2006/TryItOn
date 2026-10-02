import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Box, Shirt, Database, ArrowRight, CheckCircle2, User, Ruler, RotateCw, Bookmark } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Full 3D Fitting Journey • Production Ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Experience Next-Gen{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
            3D Virtual Costume
          </span>{' '}
          Try-On In Real Time
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Input your body measurements, generate an anatomical 3D avatar, browse our curated wardrobe catalog, and witness automatic garment fitting in full 360° orbit.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start 3D Fitting Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#journey"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-all"
          >
            <span>Explore User Journey</span>
          </a>
        </div>

        {/* Complete User Journey Walkthrough */}
        <div id="journey" className="mt-24 text-left">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Step-by-Step Experience</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">The Complete TryItOn Journey</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              From entering raw measurements to saving personalized tailored looks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-colors relative">
              <span className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30 mb-3">1</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-purple-400" />
                <span>Body Parameters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Enter your exact height, shoulders, chest, waist, and hips, or choose from Small, Average, and Large body presets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-colors relative">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 mb-3">2</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Avatar Generation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Our skeletal modifier adapts the humanoid 3D rig in real-time to match your silhouette and posture presets.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-colors relative">
              <span className="w-7 h-7 rounded-lg bg-pink-600/20 text-pink-400 font-bold text-xs flex items-center justify-center border border-pink-500/30 mb-3">3</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-pink-400" />
                <span>Wardrobe & Auto-Fit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Select Traditional Kurtas, Casual Shirts, or Formal Blazers. CostumeFitter automatically scales cloth with anti-clipping ease.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors relative">
              <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30 mb-3">4</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-emerald-400" />
                <span>3D Orbit & Save Look</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Rotate, zoom, and inspect your outfit in 360°. Save and persist your styled looks to your personal account.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Three.js Studio Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3-point studio lighting, contact ground shadows, OrbitControls, preset camera angles, and smooth damping.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Garment Wardrobe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Data-driven catalog featuring Traditional, Casual, and Formal garments with instantaneous 3D preloading.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secure User Persistence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PostgreSQL schemas, bcrypt password hashing, JWT sessions, and Cloudinary media management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
