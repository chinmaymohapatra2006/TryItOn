import React from 'react';
import { useCostume } from '../../context/CostumeContext.jsx';
import CostumeCard from './CostumeCard.jsx';
import { Layers, Sparkles, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export const CostumeCatalog = () => {
  const {
    filteredCatalog,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoadingCostume,
    costumeError,
    resetCostume,
    costume
  } = useCostume();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            3D Virtual Wardrobe
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and switch between traditional, casual, and formal garments in real-time.
          </p>
        </div>

        {/* Loading / Status pill */}
        <div className="flex items-center gap-2">
          {isLoadingCostume ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              Loading 3D Mesh...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/60 text-slate-300 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Active: {costume.name}
            </span>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 pt-4 pb-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error state if asset fails to load */}
      {costumeError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Failed to load 3D costume: {costumeError}</span>
          </div>
          <button
            onClick={resetCostume}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-medium text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>
      )}

      {/* Costume Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => (
          <CostumeCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CostumeCatalog;
