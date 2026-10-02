import React, { useState } from 'react';
import { useApiHealth } from '../hooks/useApiHealth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCostume } from '../context/CostumeContext.jsx';
import { 
  Activity, 
  RefreshCw, 
  Server, 
  Database, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Box, 
  Compass, 
  Ruler, 
  User, 
  Shirt, 
  RotateCw, 
  Bookmark 
} from 'lucide-react';
import { Scene } from '../components/3D/index.js';
import MeasurementForm from '../components/AvatarCustomizer/MeasurementForm.jsx';
import PoseControls from '../components/AvatarCustomizer/PoseControls.jsx';
import CostumeControls from '../components/AvatarCustomizer/CostumeControls.jsx';
import CostumeCatalog from '../components/CostumeLibrary/CostumeCatalog.jsx';
import MediaGallery from '../components/MediaManager/MediaGallery.jsx';
import AuthModal from '../components/Auth/AuthModal.jsx';
import SavedLooksDrawer from '../components/SavedLooks/SavedLooksDrawer.jsx';

export const DashboardPage = () => {
  const { healthData, loading, error, latency, refresh } = useApiHealth(false);
  const { user, isAuthenticated } = useAuth();
  const { costume } = useCostume();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [looksDrawerOpen, setLooksDrawerOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/40 text-purple-400 text-xs font-semibold mb-2 border border-purple-800/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Virtual Try-On Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            TryItOn Virtual Fitting Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAuthenticated 
              ? `Welcome back, ${user.name}! Your tailored looks and body parameters are active.` 
              : 'Seamless 3D try-on: customize body parameters, equip costumes, and save your look.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLooksDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-200 text-sm font-semibold transition-all shadow-md"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>View Wardrobe</span>
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-all hover:border-slate-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{loading ? 'Pinging...' : 'Check API'}</span>
          </button>
        </div>
      </div>

      {/* Visual Journey Stepper (Phase 10 Flow) */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-purple-400">
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
          <span>Measurements</span>
        </div>
        <div className="h-0.5 w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-indigo-400">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
          <span>3D Avatar</span>
        </div>
        <div className="h-0.5 w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-pink-400">
          <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
          <span>Select Costume</span>
        </div>
        <div className="h-0.5 w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-emerald-400">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
          <span>Automatic Fit</span>
        </div>
        <div className="h-0.5 w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
          <span>3D Orbit & Save</span>
        </div>
      </div>

      {/* Main Grid: Left Column (3D Viewport + Wardrobe Catalog), Right Column (Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: 3D Canvas Studio & Costume Catalog */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* 3D Viewport Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">3D Fitting Canvas</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 font-semibold">
                  Equipped: {costume.name}
                </span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>360° Orbit & Zoom Enabled</span>
              </span>
            </div>

            {/* 3D Scene Viewport */}
            <div className="h-[530px] w-full">
              <Scene
                autoRotateDefault={false}
                showGridDefault={true}
                className="w-full h-full shadow-2xl"
              />
            </div>
          </div>

          {/* Data-Driven Costume Library Catalog (Phase 7) */}
          <CostumeCatalog />

          {/* Cloudinary Media Management (Phase 8) */}
          <MediaGallery />
        </div>

        {/* Right Column: Customization, Posing & Diagnostics */}
        <div className="space-y-6">
          {/* 3D Costume Fitting Engine Controls (Phase 5/6/10) */}
          <CostumeControls
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSavedLooks={() => setLooksDrawerOpen(true)}
          />

          {/* Body Measurements & Fitting Profiles (Phase 3/6) */}
          <MeasurementForm />

          {/* Avatar Posing Controls (Phase 4) */}
          <PoseControls />

          {/* API Health Monitor Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">API Health Status</h2>
                  <p className="text-xs text-slate-400"><code className="text-purple-300">GET /api/health</code></p>
                </div>
              </div>

              <div>
                {error ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Offline
                  </span>
                ) : healthData ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-950/60 text-yellow-300 border border-yellow-800">
                    Checking...
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">Latency</span>
                <p className="text-base font-bold text-white mt-0.5">{latency || '--'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">Uptime</span>
                <p className="text-base font-bold text-white mt-0.5 truncate">{healthData?.uptime || '--'}</p>
              </div>
            </div>

            {/* Sub-services */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>Express Backend</span>
                </div>
                <span className="font-semibold text-emerald-400">
                  {healthData?.services?.server || (error ? 'Unreachable' : 'Initializing')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Database Pool</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {healthData?.services?.database || 'configured'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal & Saved Looks Drawer Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SavedLooksDrawer isOpen={looksDrawerOpen} onClose={() => setLooksDrawerOpen(false)} />
    </div>
  );
};

export default DashboardPage;
