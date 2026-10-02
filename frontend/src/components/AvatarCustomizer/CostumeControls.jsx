import React from 'react';
import { useCostume } from '../../context/CostumeContext.jsx';
import { useMeasurements } from '../../context/MeasurementContext.jsx';
import { CostumeFitter } from '../../services/CostumeFitter.js';
import { getCostumeMetadata } from '../../config/costumeMetadata.js';
import { Shirt, Eye, EyeOff, Palette, Layers, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

const colorPresets = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#475569' },
  { name: 'White', value: '#f8fafc' },
];

export const CostumeControls = () => {
  const { costume, toggleVisibility, updateCostume, resetCostume } = useCostume();
  const { measurements } = useMeasurements();

  const metadata = getCostumeMetadata(costume.id);
  const dimensions = CostumeFitter.calculateBodyDimensions(measurements, metadata);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur mt-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shirt className="w-5 h-5 text-indigo-400" />
            3D Costume Fitting Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time anatomical alignment, dynamic ease, and fabric styling.</p>
        </div>

        <button
          onClick={resetCostume}
          title="Reset Costume"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Selected Garment Card */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{costume.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400">{costume.category}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">Rigged SkinnedMesh</span>
            </div>
          </div>
        </div>

        {/* Visibility Toggle Button */}
        <button
          onClick={toggleVisibility}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            costume.visible
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {costume.visible ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Hidden</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Fitting Diagnostics Badge Card */}
      <div className="mb-6 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/90 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 font-medium">Fitted Body Profile:</span>
          <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold text-[11px]">
            {dimensions.profile}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 font-medium">Torso Scale Ratio:</span>
          <span className="font-mono text-slate-200">
            {(dimensions.chestRatio * 100).toFixed(1)}% Chest • {(dimensions.waistRatio * 100).toFixed(1)}% Waist
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">Anti-Clipping Ease:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active (+2.8% to +3.5%)
          </span>
        </div>
      </div>

      {/* Fabric Color Swatches */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fabric Colorway</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {colorPresets.map((swatch) => (
            <button
              key={swatch.name}
              onClick={() => updateCostume({ color: swatch.value })}
              title={swatch.name}
              className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                costume.color === swatch.value
                  ? 'border-white scale-110 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'border-slate-700 hover:scale-105 hover:border-slate-500'
              }`}
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </div>
      </div>

      {/* Wireframe toggle & Fitting Status */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <button
          onClick={() => updateCostume({ wireframe: !costume.wireframe })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            costume.wireframe
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mesh Wireframe</span>
        </button>

        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>CostumeFitter: <strong className="text-emerald-400 font-medium">Synchronized</strong></span>
        </span>
      </div>
    </div>
  );
};

export default CostumeControls;
