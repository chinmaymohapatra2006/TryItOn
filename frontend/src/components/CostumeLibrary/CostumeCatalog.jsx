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
    <div className="bg-white border border-[#E9E1D6] rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DFC8]">
        <div>
          <h2 className="font-serif text-xl font-medium text-[#1C1917] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8C6D58]" />
            3D Virtual Wardrobe
          </h2>
          <p className="text-xs text-[#6E5341] mt-1">
            Browse and switch between traditional, casual, and formal garments in real-time.
          </p>
        </div>

        {/* Loading / Status pill */}
        <div className="flex items-center gap-2">
          {isLoadingCostume ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EDE2] text-[#8C6D58] border border-[#E7DEC8] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D58]" />
              Fitting 3D Mesh...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#1C1917] border border-[#E7DEC8]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Equipped: {costume.name}
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
                : 'bg-[#FAF7F2] text-[#6E5341] border-[#E7DEC8] hover:border-[#8C6D58] hover:text-[#1C1917]'
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
