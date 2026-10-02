import React, { useState } from 'react';
import { useCostume } from '../../context/CostumeContext.jsx';
import { useMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CostumeFitter } from '../../services/CostumeFitter.js';
import { getCostumeMetadata } from '../../config/costumeMetadata.js';
import { 
  Shirt, 
  Eye, 
  EyeOff, 
  Palette, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Bookmark, 
  Plus, 
  Loader2,
  Check
} from 'lucide-react';

const colorPresets = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#475569' },
  { name: 'White', value: '#f8fafc' },
];

export const CostumeControls = ({ onOpenAuth, onOpenSavedLooks }) => {
  const { costume, toggleVisibility, updateCostume, resetCostume } = useCostume();
  const { measurements, resetMeasurements } = useMeasurements();
  const { poseState, resetPose } = usePose();
  const { isAuthenticated, saveLook } = useAuth();

  const [savingLook, setSavingLook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lookName, setLookName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const metadata = getCostumeMetadata(costume.id);
  const dimensions = CostumeFitter.calculateBodyDimensions(measurements, metadata);

  const handleResetAll = () => {
    resetCostume();
    resetPose();
    resetMeasurements();
  };

  const handleSaveLook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const finalName = lookName.trim() || `${costume.name} Look`;
    setSavingLook(true);
    try {
      await saveLook({
        costumeId: costume.id,
        lookName: finalName,
        colorway: costume.color,
        customParameters: {
          measurements,
          pose: poseState,
          profile: dimensions.profile
        }
      });
      setSaveSuccess(true);
      setShowSaveInput(false);
      setLookName('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save look:', err);
    } finally {
      setSavingLook(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shirt className="w-5 h-5 text-indigo-400" />
            3D Costume Fitting Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time anatomical alignment, dynamic ease, and fabric styling.</p>
        </div>

        <button
          onClick={handleResetAll}
          title="Reset Costume, Poses, and Measurements"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All</span>
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

      {/* Save Look Action Flow */}
      <div className="mb-6 p-4 rounded-xl bg-purple-950/30 border border-purple-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>Save Custom Look</span>
          </span>
          {saveSuccess && (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Saved to Wardrobe!
            </span>
          )}
        </div>

        {showSaveInput ? (
          <form onSubmit={handleSaveLook} className="flex gap-2 mt-2">
            <input
              type="text"
              value={lookName}
              onChange={(e) => setLookName(e.target.value)}
              placeholder="e.g. My Custom Silk Fit"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={savingLook}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {savingLook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSaveInput(false)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated && onOpenAuth) {
                onOpenAuth();
              } else {
                setShowSaveInput(true);
              }
            }}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all hover:scale-[1.01]"
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAuthenticated ? 'Save This Look to Wardrobe' : 'Sign In to Save This Look'}</span>
          </button>
        )}
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
