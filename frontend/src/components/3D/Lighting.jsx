import React from 'react';

export const Lighting = ({ 
  intensity = 1.0, 
  enableShadows = true 
}) => {
  return (
    <group name="studio-lighting">
      {/* Soft base ambient light */}
      <ambientLight intensity={0.45 * intensity} />

      {/* Hemispheric ambient bounce */}
      <hemisphereLight
        skyColor="#e0e7ff"
        groundColor="#0f172a"
        intensity={0.35 * intensity}
      />

      {/* Key Light (Front Right, Main illumination) */}
      <directionalLight
        position={[3.5, 4.5, 3.5]}
        intensity={1.2 * intensity}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0001}
      />

      {/* Fill Light (Front Left, Softens harsh shadows) */}
      <directionalLight
        position={[-3.5, 3.0, 2.5]}
        intensity={0.6 * intensity}
      />

      {/* Rim / Hair Light (Behind, Outlines silhouette) */}
      <directionalLight
        position={[0, 4.0, -3.5]}
        intensity={0.75 * intensity}
        color="#c084fc"
      />

      {/* Subtle floor bounce light */}
      <pointLight
        position={[0, 0.2, 1.5]}
        intensity={0.25 * intensity}
        color="#a78bfa"
      />
    </group>
  );
};

export default Lighting;
