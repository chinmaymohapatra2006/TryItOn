import React from 'react';
import { usePose } from '../../context/PoseContext.jsx';
import { User, RefreshCcw } from 'lucide-react';

export const PoseControls = () => {
  const { poseState, updatePose, applyPreset, resetPose } = usePose();

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    updatePose({ [name]: parseFloat(value), preset: 'custom' });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur mt-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Avatar Posing Controls
          </h2>
          <p className="text-xs text-slate-400 mt-1">Adjust skeleton joints and avatar orientation.</p>
        </div>
        <button
          onClick={resetPose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset Pose
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {['t-pose', 'a-pose', 'hands-on-hips'].map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all border ${
                poseState.preset === preset
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {preset.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Manual Adjustments
        </label>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Model Rotation (Y)</span>
              <span className="text-slate-200 font-mono">{(poseState.rotationY * (180/Math.PI)).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              name="rotationY"
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              value={poseState.rotationY}
              onChange={handleSliderChange}
              className="w-full accent-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Left Arm Raise (Z)</span>
              </div>
              <input
                type="range"
                name="leftArmZ"
                min={0}
                max={2}
                step={0.1}
                value={poseState.leftArmZ}
                onChange={handleSliderChange}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Right Arm Raise (Z)</span>
              </div>
              <input
                type="range"
                name="rightArmZ"
                min={-2}
                max={0}
                step={0.1}
                value={poseState.rightArmZ}
                onChange={handleSliderChange}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseControls;
