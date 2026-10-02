import React, { createContext, useContext, useState } from 'react';

const PoseContext = createContext();

export const defaultPoseState = {
  preset: 't-pose', // 't-pose', 'a-pose', 'custom'
  rotationY: 0, // overall avatar rotation
  leftArmX: 0,
  leftArmZ: 0,
  rightArmX: 0,
  rightArmZ: 0,
  leftForeArmZ: 0,
  rightForeArmZ: 0
};

export const PoseProvider = ({ children }) => {
  const [poseState, setPoseState] = useState(defaultPoseState);

  const updatePose = (updates) => {
    setPoseState((prev) => ({ ...prev, ...updates }));
  };

  const resetPose = () => {
    setPoseState(defaultPoseState);
  };

  const applyPreset = (presetName) => {
    if (presetName === 't-pose') {
      setPoseState({
        ...defaultPoseState,
        preset: 't-pose',
        rotationY: poseState.rotationY // preserve rotation
      });
    } else if (presetName === 'a-pose') {
      setPoseState({
        ...defaultPoseState,
        preset: 'a-pose',
        rotationY: poseState.rotationY,
        leftArmZ: 1.1,
        rightArmZ: -1.1,
      });
    } else if (presetName === 'hands-on-hips') {
      setPoseState({
        ...defaultPoseState,
        preset: 'hands-on-hips',
        rotationY: poseState.rotationY,
        leftArmX: 0.5,
        leftArmZ: 1.0,
        rightArmX: 0.5,
        rightArmZ: -1.0,
        leftForeArmZ: -1.8,
        rightForeArmZ: 1.8,
      });
    }
  };

  return (
    <PoseContext.Provider value={{ poseState, updatePose, resetPose, applyPreset }}>
      {children}
    </PoseContext.Provider>
  );
};

export const usePose = () => {
  const context = useContext(PoseContext);
  if (!context) {
    throw new Error('usePose must be used within a PoseProvider');
  }
  return context;
};
