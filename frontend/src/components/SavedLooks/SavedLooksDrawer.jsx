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
    // 1. Select the costume
    selectCostume(look.costume_id);
    // 2. Apply colorway
    if (look.colorway) {
      updateActiveColor(look.colorway);
    }
    // 3. Apply saved body measurements if present
    if (look.custom_parameters?.measurements) {
      updateMeasurements(look.custom_parameters.measurements);
    }
    // 4. Apply saved pose if present
    if (look.custom_parameters?.pose) {
      updatePose(look.custom_parameters.pose);
    }

    setMessage({ type: 'success', text: `Equipped "${look.look_name}"!` });
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Saved Wardrobe Looks</h3>
              <p className="text-[11px] text-slate-400">Personal collection of custom fitted outfits & poses.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Outfit Section */}
        {isAuthenticated ? (
          <div className="my-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Save Current 3D Outfit
            </span>
            <form onSubmit={handleSaveCurrentLook} className="flex gap-2">
              <input
                type="text"
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
                placeholder="e.g. Silk Kurta Evening Fit"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={saving || !lookName.trim()}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="my-4 p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 shrink-0">
            Please sign in to save and sync looks to your account.
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg text-xs mb-3 flex items-center gap-2 shrink-0 ${
            message.type === 'success' 
              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' 
              : 'bg-rose-950/50 text-rose-300 border border-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Saved Looks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedLooks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No saved looks yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">Configure an outfit and click "Save" above!</p>
            </div>
          ) : (
            savedLooks.map((look) => (
              <div
                key={look.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-slate-700 shrink-0 shadow-sm"
                    style={{ backgroundColor: look.colorway || '#6366f1' }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{look.look_name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {look.costume_id.replace('-female', '')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyLook(look)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 hover:border-purple-500 transition-all"
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
