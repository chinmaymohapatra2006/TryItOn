import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';
import { useCostume } from '../../context/CostumeContext.jsx';
import { CostumeFitter } from '../../services/CostumeFitter.js';
import { getCostumeMetadata, COSTUME_CATALOG } from '../../config/costumeMetadata.js';

export const CostumeModel = ({ 
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0] 
}) => {
  const groupRef = useRef();
  const { costume, setCostumeError } = useCostume();
  const { measurements } = useMeasurements();
  const { poseState } = usePose();

  // Load the currently selected costume GLB
  const { scene } = useGLTF(costume.modelUrl);

  useEffect(() => {
    if (!scene) return;

    try {
      // Synchronize overall root rotation matching avatar
      if (groupRef.current) {
        groupRef.current.rotation.y = poseState.rotationY;
      }

      const metadata = getCostumeMetadata(costume.id);

      // Apply material properties and colorway
      scene.traverse((object) => {
        if (object.isMesh && object.material) {
          if (costume.color) {
            object.material.color.set(costume.color);
          }
          if (costume.wireframe !== undefined) {
            object.material.wireframe = costume.wireframe;
          }
          object.material.roughness = 0.45;
          object.material.metalness = 0.1;
        }
      });

      // Execute CostumeFitter pipeline to fit the active costume to the avatar
      CostumeFitter.fitCostumeToAvatar(
        scene,
        measurements,
        metadata,
        poseState
      );
    } catch (err) {
      console.error('Error fitting costume:', err);
      if (setCostumeError) {
        setCostumeError(err.message || 'Failed to fit costume');
      }
    }
  }, [scene, costume.id, costume.modelUrl, costume.color, costume.wireframe, measurements, poseState, setCostumeError]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
      visible={costume.visible}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  );
};

// Preload all catalog costumes into memory for instant seamless switching
COSTUME_CATALOG.forEach(item => {
  useGLTF.preload(item.modelUrl);
});

export default CostumeModel;
