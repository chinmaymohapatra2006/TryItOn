import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth.js';
import { 
  Activity, 
  RefreshCw, 
  Server, 
  Database, 
  Layers, 
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Box,
  Compass
} from 'lucide-react';
import { Scene } from '../components/3D/index.js';
import MeasurementForm from '../components/AvatarCustomizer/MeasurementForm.jsx';
import PoseControls from '../components/AvatarCustomizer/PoseControls.jsx';
import CostumeControls from '../components/AvatarCustomizer/CostumeControls.jsx';

export const DashboardPage = () => {
  const { healthData, loading, error, latency, lastChecked, refresh } = useApiHealth(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/40 text-purple-400 text-xs font-semibold mb-2 border border-purple-800/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 • 3D Viewport Core</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            TryItOn 3D Virtual Fitting Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time WebGL canvas, Three.js studio lighting, orbit controls, and live system monitoring.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-all self-start sm:self-auto hover:border-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
          <span>{loading ? 'Pinging Server...' : 'Check Connection'}</span>
        </button>
      </div>

      {/* Main Grid: 3D Viewport on Left (2 cols), Diagnostics & Roadmaps on Right (1 col) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core 3D Viewport Studio */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">3D Fitting Canvas</h2>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full 360° Orbit & Zoom Enabled</span>
            </span>
          </div>

          {/* 3D Scene Container */}
          <div className="h-[520px] w-full">
            <Scene
              autoRotateDefault={false}
              showGridDefault={true}
              className="w-full h-full shadow-2xl"
            />
          </div>

          {/* Viewport Features Legend */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Rendering Engine</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5">Three.js + R3F</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Controls</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5">Drei OrbitControls</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Studio Rig</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5">3-Point + Contact Shadow</p>
            </div>
          </div>
        </div>

        {/* Right Column: API Health & Upcoming Modules */}
        <div className="space-y-6">
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

            {/* Sub-services breakdown */}
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

          {/* 3D Costume Fitting Controls (Phase 5) */}
          <CostumeControls />

          {/* Measurement Form (Phase 3) */}
          <MeasurementForm />

          {/* Pose Controls (Phase 4) */}
          <PoseControls />
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 mb-3">
              3D Architecture Specs
            </h3>
            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>WebGL Canvas:</span>
                <span className="text-slate-200 font-mono">React Three Fiber 8</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Helpers & Controls:</span>
                <span className="text-slate-200 font-mono">Drei 9</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Shadows:</span>
                <span className="text-slate-200 font-mono">Soft ContactShadows</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Camera:</span>
                <span className="text-slate-200 font-mono">Perspective (FOV 45°)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
