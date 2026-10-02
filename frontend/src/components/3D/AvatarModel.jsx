import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useMeasurements, defaultMeasurements } from '../../context/MeasurementContext.jsx';
import { usePose } from '../../context/PoseContext.jsx';

export const AvatarModel = ({ modelUrl = '/models/female.glb', scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const groupRef = useRef();
  
  // useGLTF will throw a promise caught by Suspense if loading, and return the gltf object when done.
  const { scene, nodes, materials, animations } = useGLTF(modelUrl);
  const { measurements } = useMeasurements();
  const { poseState } = usePose();
  
  useEffect(() => {
    if (!scene) return;

    // Apply global root rotation from poseState
    if (groupRef.current) {
      groupRef.current.rotation.y = poseState.rotationY;
    }

    // Normalize measurements relative to default baseline (assumes default avatar matches default measurements)
    const norm = {
      height: measurements.height / defaultMeasurements.height,
      shoulder: measurements.shoulderWidth / defaultMeasurements.shoulderWidth,
      chest: measurements.chest / defaultMeasurements.chest,
      waist: measurements.waist / defaultMeasurements.waist,
      hip: measurements.hip / defaultMeasurements.hip,
      arm: (measurements.armLength || defaultMeasurements.armLength) / defaultMeasurements.armLength,
      leg: (measurements.legLength || defaultMeasurements.legLength) / defaultMeasurements.legLength,
    };

    // Apply safe bone scaling dynamically
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }

      if (object.isBone) {
        const name = object.name.toLowerCase();

        // -------------------------
        // 1. MEASUREMENT SCALING
        // -------------------------

        // Hips (Root): Controls overall height & hip width/depth
        if (name.includes('hips')) {
          object.scale.set(norm.hip, norm.height, norm.hip);
        }
        
        // Spine/Waist (Spine, Spine1)
        if (name === 'mixamorig:spine' || name === 'mixamorig:spine1') {
          object.scale.set(norm.waist, 1, norm.waist);
        }
        
        // Chest (Spine2)
        if (name === 'mixamorig:spine2') {
          object.scale.set(norm.chest, 1, norm.chest);
        }

        // Shoulders
        if (name.includes('shoulder')) {
          object.scale.set(norm.shoulder, 1, norm.shoulder);
        }

        // Arms (Arm, ForeArm)
        if (name.includes('arm') || name.includes('forearm')) {
          object.scale.set(1, norm.arm, 1);
        }

        // Legs (UpLeg, Leg)
        if ((name.includes('upleg') || name.includes('leg')) && !name.includes('hips')) {
           const relativeLegScale = norm.leg / norm.height;
           object.scale.set(1, relativeLegScale, 1);
        }

        // -------------------------
        // 2. POSE ROTATIONS
        // -------------------------
        
        // Reset rotations to default first (T-Pose) before applying offsets
        // To prevent cumulative rotation errors, we overwrite X and Z.
        // The default Mixamo T-Pose has specific default rotations, but for arms 
        // overwriting X and Z is usually safe relative to their T-pose local axes.

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
    
  }, [scene, modelUrl, measurements, poseState]);

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the default models
useGLTF.preload('/models/female.glb');
useGLTF.preload('/models/male.glb');

export default AvatarModel;
