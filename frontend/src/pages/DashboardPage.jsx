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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FAF7F2] text-[#1C1917]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DFC8]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EDE2] text-[#8C6D58] text-xs font-semibold mb-2 border border-[#E7DEC8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Virtual Fitting Studio • Real-Time 3D</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] tracking-tight">
            TryItOn Atelier & Fitting Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5341] mt-1">
            {isAuthenticated 
              ? `Welcome back, ${user.name}! Your tailored looks and body parameters are active.` 
              : 'Precision 3D simulation: customize body measurements, select fabrics, and save your look.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLooksDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D5C4A1]" />
            <span>View Wardrobe</span>
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E7DEC8] hover:border-[#8C6D58] text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8C6D58]' : 'text-[#8C6D58]'}`} />
            <span className="hidden sm:inline">{loading ? 'Pinging...' : 'API Health'}</span>
          </button>
        </div>
      </div>

      {/* Visual Journey Stepper (Phase 10 Flow) */}
      <div className="my-6 p-4 rounded-2xl bg-white border border-[#E9E1D6] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#1C1917]">
          <span className="w-5 h-5 rounded-full bg-[#1C1917] text-white flex items-center justify-center text-[10px] font-bold">1</span>
          <span>Measurements</span>
        </div>
        <div className="h-0.5 w-6 bg-[#E8DFC8] hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-[#8C6D58]">
          <span className="w-5 h-5 rounded-full bg-[#8C6D58] text-white flex items-center justify-center text-[10px] font-bold">2</span>
          <span>3D Avatar</span>
        </div>
        <div className="h-0.5 w-6 bg-[#E8DFC8] hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-[#6E5341]">
          <span className="w-5 h-5 rounded-full bg-[#6E5341] text-white flex items-center justify-center text-[10px] font-bold">3</span>
          <span>Select Costume</span>
        </div>
        <div className="h-0.5 w-6 bg-[#E8DFC8] hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-[#8A734C]">
          <span className="w-5 h-5 rounded-full bg-[#8A734C] text-white flex items-center justify-center text-[10px] font-bold">4</span>
          <span>Automatic Fit</span>
        </div>
        <div className="h-0.5 w-6 bg-[#E8DFC8] hidden sm:block" />

        <div className="flex items-center gap-2 font-semibold text-[#1C1917]">
          <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#D5C4A1] flex items-center justify-center text-[10px] font-bold">5</span>
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
                <Box className="w-5 h-5 text-[#8C6D58]" />
                <h2 className="font-serif text-xl font-medium text-[#1C1917]">3D Fitting Canvas</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F3EDE2] text-[#8C6D58] border border-[#E7DEC8] font-semibold">
                  Equipped: {costume.name}
                </span>
              </div>
              <span className="text-xs text-[#6E5341] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#8C6D58]" />
                <span>360° Orbit & Zoom Active</span>
              </span>
            </div>

            {/* 3D Scene Viewport */}
            <div className="h-[530px] w-full rounded-2xl overflow-hidden border border-[#E9E1D6] shadow-md bg-[#1C1917]">
              <Scene
                autoRotateDefault={false}
                showGridDefault={true}
                className="w-full h-full"
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
          <div className="p-6 rounded-2xl bg-white border border-[#E9E1D6] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3EDE2] flex items-center justify-center text-[#8C6D58]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1C1917]">API Health Status</h2>
                  <p className="text-xs text-[#8C6D58] font-mono">GET /api/health</p>
                </div>
              </div>

              <div>
                {error ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Offline
                  </span>
                ) : healthData ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Checking...
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6]">
                <span className="text-[11px] text-[#6E5341] font-medium">Latency</span>
                <p className="text-base font-bold text-[#1C1917] mt-0.5">{latency || '--'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6]">
                <span className="text-[11px] text-[#6E5341] font-medium">Uptime</span>
                <p className="text-base font-bold text-[#1C1917] mt-0.5 truncate">{healthData?.uptime || '--'}</p>
              </div>
            </div>

            {/* Sub-services */}
            <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#1C1917]">
                  <Server className="w-3.5 h-3.5 text-[#8C6D58]" />
                  <span>Express Backend</span>
                </div>
                <span className="font-semibold text-emerald-700">
                  {healthData?.services?.server || (error ? 'Unreachable' : 'Initializing')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#1C1917]">
                  <Database className="w-3.5 h-3.5 text-[#8C6D58]" />
                  <span>Database Pool</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#EBDDCE] text-[#382920] font-mono text-[11px]">
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
