import React from 'react';
import { usePose } from '../../context/PoseContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, RefreshCcw } from 'lucide-react';

export const PoseControls = () => {
  const { poseState, updatePose, applyPreset, resetPose } = usePose();
  const { isAuthenticated, syncAvatar } = useAuth();

  const handleApplyPreset = (preset) => {
    applyPreset(preset);
    if (isAuthenticated && syncAvatar) {
      syncAvatar({ posePreset: preset, poseData: poseState });
    }
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    updatePose({ [name]: parseFloat(value), preset: 'custom' });
  };

  return (
    <div className="bg-white border border-[#E9E1D6] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-[#E8DFC8] pb-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-[#1C1917] flex items-center gap-2">
            <User className="w-5 h-5 text-[#8C6D58]" />
            Avatar Posing Controls
          </h2>
          <p className="text-xs text-[#6E5341] mt-1">Adjust skeleton joints and avatar orientation.</p>
        </div>
        <button
          onClick={resetPose}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#1C1917] rounded-full transition-colors border border-[#E7DEC8]"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-[#8C6D58]" />
          Reset Pose
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#1C1917] mb-2 uppercase tracking-wider">
          Quick Posture Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {['t-pose', 'a-pose', 'hands-on-hips'].map((preset) => (
            <button
              key={preset}
              onClick={() => handleApplyPreset(preset)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                poseState.preset === preset
                  ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E7DEC8] text-[#6E5341] hover:border-[#8C6D58] hover:text-[#1C1917]'
              }`}
            >
              {preset.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-[#1C1917] mb-2 uppercase tracking-wider">
          Manual Articulation
        </label>
        
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6E5341] font-medium">Model Rotation (Y)</span>
              <span className="text-[#1C1917] font-semibold font-mono">{(poseState.rotationY * (180/Math.PI)).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              name="rotationY"
              min={-Math.PI}
              max={Math.PI}
              step={0.1}
              value={poseState.rotationY}
              onChange={handleSliderChange}
              className="w-full accent-[#1C1917]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6]">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#6E5341] font-medium">Left Arm Raise</span>
              </div>
              <input
                type="range"
                name="leftArmZ"
                min={0}
                max={2}
                step={0.1}
                value={poseState.leftArmZ}
                onChange={handleSliderChange}
                className="w-full accent-[#8C6D58]"
              />
            </div>
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6]">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#6E5341] font-medium">Right Arm Raise</span>
              </div>
              <input
                type="range"
                name="rightArmZ"
                min={-2}
                max={0}
                step={0.1}
                value={poseState.rightArmZ}
                onChange={handleSliderChange}
                className="w-full accent-[#8C6D58]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseControls;
