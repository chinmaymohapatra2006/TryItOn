import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCostume } from '../../context/CostumeContext.jsx';
import { useMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';
import { Bookmark, Sparkles, Check, Play, Clock, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SavedLooksDrawer = ({ isOpen, onClose }) => {
  const { user, savedLooks, saveLook, isAuthenticated } = useAuth();
  const { costume, selectCostume, updateActiveColor } = useCostume();
  const { measurements, updateMeasurements } = useMeasurements();
  const { poseState, updatePose } = usePose();

  const [lookName, setLookName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSaveCurrentLook = async (e) => {
    e.preventDefault();
    if (!lookName.trim()) return;

    setSaving(true);
    setMessage(null);
    try {
      await saveLook({
        costumeId: costume.id,
        lookName: lookName.trim(),
        colorway: costume.color,
        customParameters: {
          measurements,
          pose: poseState,
          savedAt: new Date().toISOString()
        }
      });
      setMessage({ type: 'success', text: 'Look saved to your wardrobe collection!' });
      setLookName('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save look' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyLook = (look) => {
    if (!look) return;
    const costumeId = look.costume_id || look.costumeId;
    if (costumeId) {
      selectCostume(costumeId);
    }
    if (look.colorway) {
      updateActiveColor(look.colorway);
    }
    if (look.custom_parameters?.measurements) {
      updateMeasurements(look.custom_parameters.measurements);
    }
    if (look.custom_parameters?.pose) {
      updatePose(look.custom_parameters.pose);
    }

    setMessage({ type: 'success', text: `Equipped "${look.look_name || look.lookName || 'Saved Look'}"!` });
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border-l border-[#E8DFC8] p-6 shadow-2xl flex flex-col h-full overflow-hidden text-[#1C1917]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#D5C4A1] flex items-center justify-center shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1C1917]">Wardrobe Looks</h3>
              <p className="text-[11px] text-[#6E5341]">Personal collection of custom fitted outfits & poses.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6E5341] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Outfit Section */}
        {isAuthenticated ? (
          <div className="my-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] shrink-0">
            <span className="text-[10px] font-bold text-[#6E5341] uppercase tracking-wider block mb-2">
              Save Current 3D Outfit
            </span>
            <form onSubmit={handleSaveCurrentLook} className="flex gap-2">
              <input
                type="text"
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
                placeholder="e.g. Silk Kurta Evening Fit"
                className="flex-1 bg-white border border-[#D9C4AF] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
              <button
                type="submit"
                disabled={saving || !lookName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#2E2824] text-white text-xs font-semibold uppercase tracking-wider shadow transition-all disabled:opacity-50 shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="my-4 p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E8DFC8] text-xs text-[#6E5341] shrink-0">
            Please sign in to save and sync looks to your personal wardrobe.
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg text-xs mb-3 flex items-center gap-2 shrink-0 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Saved Looks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedLooks.length === 0 ? (
            <div className="py-16 text-center text-[#8C6D58] text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-serif text-sm">No saved looks yet.</p>
              <p className="text-[11px] text-[#6E5341] mt-1">Configure an outfit and click "Save" above!</p>
            </div>
          ) : (
            savedLooks.map((look) => (
              <div
                key={look.id || Math.random()}
                className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] hover:border-[#8C6D58] hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0"
                    style={{ backgroundColor: look.colorway || '#8C6D58' }}
                  />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#1C1917]">{look.look_name || look.lookName || 'Custom Outfit'}</h4>
                    <span className="text-[10px] text-[#6E5341] capitalize">
                      {String(look.costume_id || look.costumeId || 'costume').replace('-female', '')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyLook(look)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#1C1917] text-[#1C1917] hover:text-white text-xs font-semibold uppercase tracking-wider border border-[#1C1917] transition-all"
                >
                  <Play className="w-3 h-3" />
                  <span>Equip</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedLooksDrawer;
