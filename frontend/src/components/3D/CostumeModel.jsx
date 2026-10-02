import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useMeasurements, defaultMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';
import { useCostume } from '../../context/CostumeContext.jsx';

export const CostumeModel = ({ 
  modelUrl = '/costumes/shirt-female.glb',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0] 
}) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const { measurements } = useMeasurements();
  const { poseState } = usePose();
  const { costume } = useCostume();

  useEffect(() => {
    if (!scene) return;

    // Apply global root rotation from poseState matching avatar
    if (groupRef.current) {
      groupRef.current.rotation.y = poseState.rotationY;
    }

    // Normalize measurements relative to default baseline
    const norm = {
      height: measurements.height / defaultMeasurements.height,
      shoulder: measurements.shoulderWidth / defaultMeasurements.shoulderWidth,
      chest: measurements.chest / defaultMeasurements.chest,
      waist: measurements.waist / defaultMeasurements.waist,
      hip: measurements.hip / defaultMeasurements.hip,
      arm: (measurements.armLength || defaultMeasurements.armLength) / defaultMeasurements.armLength,
      leg: (measurements.legLength || defaultMeasurements.legLength) / defaultMeasurements.legLength,
    };

    // Traverse costume bones and meshes to align perfectly with avatar
    scene.traverse((object) => {
      // 1. Mesh rendering and anti-z-fighting configuration
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          // Polygon offset ensures costume renders cleanly over avatar skin without z-fighting
          object.material.polygonOffset = true;
          object.material.polygonOffsetFactor = -1.5;
          object.material.polygonOffsetUnits = -1.5;
          
          if (costume.color) {
            object.material.color.set(costume.color);
          }
          if (costume.wireframe !== undefined) {
            object.material.wireframe = costume.wireframe;
          }
          object.material.roughness = 0.45;
          object.material.metalness = 0.1;
          object.material.needsUpdate = true;
        }
      }

      // 2. Bone transformation alignment
      if (object.isBone) {
        const name = object.name.toLowerCase();

        // Measurement Scaling (matching AvatarModel exactly)
        if (name.includes('hips')) {
          object.scale.set(norm.hip, norm.height, norm.hip);
        }

        if (name === 'mixamorig:spine' || name === 'mixamorig:spine1') {
          object.scale.set(norm.waist, 1, norm.waist);
        }

        if (name === 'mixamorig:spine2') {
          object.scale.set(norm.chest, 1, norm.chest);
        }

        if (name.includes('shoulder')) {
          object.scale.set(norm.shoulder, 1, norm.shoulder);
        }

        if (name.includes('arm') || name.includes('forearm')) {
          object.scale.set(1, norm.arm, 1);
        }

        if ((name.includes('upleg') || name.includes('leg')) && !name.includes('hips')) {
          const relativeLegScale = norm.leg / norm.height;
          object.scale.set(1, relativeLegScale, 1);
        }

        // Pose Rotations (matching AvatarModel exactly)
        if (name === 'mixamorig:leftarm') {
          object.rotation.x = poseState.leftArmX;
          object.rotation.z = poseState.leftArmZ;
        }
        if (name === 'mixamorig:rightarm') {
          object.rotation.x = poseState.rightArmX;
          object.rotation.z = poseState.rightArmZ;
        }
        if (name === 'mixamorig:leftforearm') {
          object.rotation.z = poseState.leftForeArmZ;
        }
        if (name === 'mixamorig:rightforearm') {
          object.rotation.z = poseState.rightForeArmZ;
        }
      }
    });
  }, [scene, modelUrl, measurements, poseState, costume]);

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
