import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth.js';

export const HealthStatusBadge = () => {
  const { healthData, loading, error } = useApiHealth(true, 15000);

  if (loading && !healthData && !error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
        <span>Connecting API...</span>
      </div>
    );
  }

  if (error || !healthData || healthData.status !== 'ok') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <span>API Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>API Online</span>
    </div>
  );
};

export default HealthStatusBadge;
