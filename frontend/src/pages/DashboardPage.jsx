import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth.js';
import { 
  Activity, 
  RefreshCw, 
  Server, 
  Database, 
  Clock, 
  Layers, 
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { formatTimestamp } from '../utils/formatters.js';

export const DashboardPage = () => {
  const { healthData, loading, error, latency, lastChecked, refresh } = useApiHealth(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/40 text-purple-400 text-xs font-semibold mb-2 border border-purple-800/30">
            <span>Phase 0 • Platform Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            TryItOn Control Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System status monitoring, service communication verification, and try-on module readiness.
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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Health Monitor Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Backend Health Diagnostics</h2>
                <p className="text-xs text-slate-400">Verifying endpoint: <code className="text-purple-300">GET /api/health</code></p>
              </div>
            </div>

            <div>
              {error ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Disconnected
                </span>
              ) : healthData ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Operational
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-950/60 text-yellow-300 border border-yellow-800">
                  Checking...
                </span>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Latency</span>
              <p className="text-lg font-bold text-white mt-1">{latency || '--'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Server Uptime</span>
              <p className="text-lg font-bold text-white mt-1">
                {healthData?.uptime || '--'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Environment</span>
              <p className="text-lg font-bold text-white mt-1 capitalize">
                {healthData?.environment || 'development'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Last Ping</span>
              <p className="text-sm font-semibold text-white mt-1 truncate">
                {lastChecked || 'Pending'}
              </p>
            </div>
          </div>

          {/* Sub-services breakdown */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Subsystem Connectivity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Express HTTP Service</span>
                </div>
                <span className="font-semibold text-emerald-400">
                  {healthData?.services?.server || (error ? 'Unreachable' : 'Initializing')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>PostgreSQL Database Pool</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {healthData?.services?.database || 'configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Raw Health Response Payload</span>
              <span>application/json</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs text-purple-300 overflow-x-auto max-h-48">
              {healthData
                ? JSON.stringify(healthData, null, 2)
                : error
                ? JSON.stringify({ error, note: 'Ensure backend server is running on port 5000' }, null, 2)
                : 'Loading response payload...'}
            </pre>
          </div>
        </div>

        {/* Future Modules Placeholder & Diagnostics */}
        <div className="space-y-6">
          {/* Phase 1 Preview Card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 relative group overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                <Layers className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40">
                <Lock className="w-3 h-3" /> Phase 1
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">3D Fitting Canvas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Three.js & React Three Fiber canvas viewport with orbit controls and 3D humanoid avatar loader.
            </p>
          </div>

          {/* Phase 2 Preview Card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 relative group overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/40">
                <Lock className="w-3 h-3" /> Phase 2
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Costume Wardrobe Catalog</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Garment selection drawer, texture swatches, size selector, and mesh layer attachments.
            </p>
          </div>

          {/* Quick Environment Specs */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              System Environment
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Frontend:</span>
                <span className="text-slate-200 font-mono">React 18 + Vite 6</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Backend:</span>
                <span className="text-slate-200 font-mono">Node.js + Express 4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>3D Engine:</span>
                <span className="text-slate-200 font-mono">Three.js + R3F + Drei</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Routing:</span>
                <span className="text-slate-200 font-mono">React Router DOM 6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
