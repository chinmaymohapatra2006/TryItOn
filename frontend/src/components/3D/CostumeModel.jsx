import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';
import { useCostume } from '../../context/CostumeContext.jsx';
import { CostumeFitter } from '../../services/CostumeFitter.js';
import { getCostumeMetadata } from '../../config/costumeMetadata.js';

export const CostumeModel = ({ 
  modelUrl = '/costumes/shirt-female.glb',
  costumeId = 'shirt-female',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0] 
}) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const { measurements } = useMeasurements();
  const { poseState } = usePose();
  const { costume } = useCostume();
  const [fitResult, setFitResult] = useState(null);

  useEffect(() => {
    if (!scene) return;

    // Apply global root rotation from poseState matching avatar
    if (groupRef.current) {
      groupRef.current.rotation.y = poseState.rotationY;
    }

    const metadata = getCostumeMetadata(costumeId);

    // Apply styling overrides
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

    // Execute the complete CostumeFitter pipeline:
    // User measurements -> Body dimensions -> Read metadata -> Calculate scale & offsets -> Align & attach
    const result = CostumeFitter.fitCostumeToAvatar(
      scene,
      measurements,
      metadata,
      poseState
    );

    setFitResult(result);
  }, [scene, modelUrl, costumeId, measurements, poseState, costume]);

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

useGLTF.preload('/costumes/shirt-female.glb');

export default CostumeModel;
