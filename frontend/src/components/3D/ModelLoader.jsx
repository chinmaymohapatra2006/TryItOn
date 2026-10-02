import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

/**
 * Procedural Stylized Tailor's Mannequin
 * Used as high-quality default 3D geometry for Phase 1.
 */
export const ProceduralMannequin = ({ wireframe = false, color = '#e2e8f0' }) => {
  const groupRef = useRef();

  return (
    <group ref={groupRef} position={[0, 0, 0]} castShadow receiveShadow>
      {/* --- Mannequin Torso & Head --- */}

      {/* Head */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.12, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Upper Torso / Chest / Shoulders */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.19, 0.32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Shoulders caps */}
      <mesh position={[-0.22, 1.54, 0]} castShadow>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>
      <mesh position={[0.22, 1.54, 0]} castShadow>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Waist */}
      <mesh position={[0, 1.23, 0]} castShadow>
        <cylinderGeometry args={[0.165, 0.18, 0.22, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Hips / Lower Form */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.21, 0.24, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Form Cap Bottom */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.20, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.5}
          metalness={0.2}
          wireframe={wireframe}
        />
      </mesh>

      {/* --- Display Stand & Pedestal --- */}

      {/* Vertical Chrome Rod */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.88, 24]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Pedestal Base Collar */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.08, 32]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Circular Heavy Pedestal Base */}
      <mesh position={[0, 0.015, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.35, 0.38, 0.03, 48]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* Subtle Glowing Indicator Ring on Base */}
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.30, 48]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.65} />
      </mesh>
    </group>
  );
};

/**
 * GLTF Model Loader component with fallback to ProceduralMannequin
 */
export const ExternalGLTFModel = ({ url, ...props }) => {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} {...props} />;
};

/**
 * Reusable ModelLoader component
 */
export const ModelLoader = ({ 
  modelUrl = null, 
  wireframe = false, 
  color = '#e2e8f0',
  autoSpin = false 
}) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (autoSpin && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {modelUrl ? (
        <ExternalGLTFModel url={modelUrl} />
      ) : (
        <ProceduralMannequin wireframe={wireframe} color={color} />
      )}
    </group>
  );
};

export default ModelLoader;
