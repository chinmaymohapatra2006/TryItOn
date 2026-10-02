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
    <div className="bg-white border border-[#E9E1D6] rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[#E8DFC8] pb-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-[#1C1917] flex items-center gap-2">
            <Shirt className="w-5 h-5 text-[#8C6D58]" />
            3D Costume Fitting Engine
          </h2>
          <p className="text-xs text-[#6E5341] mt-1">Real-time anatomical alignment, dynamic ease, and fabric styling.</p>
        </div>

        <button
          onClick={handleResetAll}
          title="Reset Costume, Poses, and Measurements"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] rounded-full transition-colors border border-[#E7DEC8]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#8C6D58]" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Selected Garment Card */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C6D58] shadow-xs">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-[#1C1917]">{costume.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#6E5341]">{costume.category}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBDDCE] text-[#382920] font-medium">Rigged Mesh</span>
            </div>
          </div>
        </div>

        {/* Visibility Toggle Button */}
        <button
          onClick={toggleVisibility}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            costume.visible
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-[#FAF7F2] text-[#6E5341] border-[#E7DEC8]'
          }`}
        >
          {costume.visible ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#8C6D58]" />
              <span>Hidden</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Fitting Diagnostics Badge Card */}
      <div className="mb-6 p-4 rounded-xl bg-[#F7F2EC] border border-[#E9E1D6] text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#6E5341] font-medium">Fitted Body Profile:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1C1917] text-white font-semibold text-[11px]">
            {dimensions.profile}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#6E5341] font-medium">Torso Scale Ratio:</span>
          <span className="font-mono text-[#1C1917] font-semibold">
            {(dimensions.chestRatio * 100).toFixed(1)}% Chest • {(dimensions.waistRatio * 100).toFixed(1)}% Waist
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6E5341] font-medium">Anti-Clipping Ease:</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active (+2.8% to +3.5%)
          </span>
        </div>
      </div>

      {/* Fabric Color Swatches */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#1C1917] mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#8C6D58]" />
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
                  ? 'border-[#1C1917] scale-110 shadow-md ring-2 ring-[#8C6D58]'
                  : 'border-[#E7DEC8] hover:scale-105 hover:border-[#8C6D58]'
              }`}
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </div>
      </div>

      {/* Save Look Action Flow */}
      <div className="mb-6 p-4 rounded-xl bg-[#F4EFE6] border border-[#E8DFC8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#8C6D58]" />
            <span>Save Custom Look</span>
          </span>
          {saveSuccess && (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
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
              className="flex-1 bg-white border border-[#D9C4AF] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
            />
            <button
              type="submit"
              disabled={savingLook}
              className="px-4 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider shadow transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {savingLook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSaveInput(false)}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EBDDCE] text-[#6E5341] text-xs transition-colors"
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
            className="w-full mt-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D5C4A1]" />
            <span>{isAuthenticated ? 'Save This Look to Wardrobe' : 'Sign In to Save This Look'}</span>
          </button>
        )}
      </div>

      {/* Wireframe toggle & Fitting Status */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8DFC8]">
        <button
          onClick={() => updateCostume({ wireframe: !costume.wireframe })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            costume.wireframe
              ? 'bg-[#1C1917] text-white border-[#1C1917]'
              : 'bg-[#FAF7F2] text-[#6E5341] border-[#E7DEC8] hover:text-[#1C1917]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mesh Wireframe</span>
        </button>

        <span className="text-[11px] text-[#6E5341] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>CostumeFitter: <strong className="text-emerald-700 font-semibold">Synchronized</strong></span>
        </span>
      </div>
    </div>
  );
};

export default CostumeControls;
