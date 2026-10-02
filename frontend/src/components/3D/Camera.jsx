import React, { useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export const Camera = ({ 
  position = [0, 1.3, 3.2], 
  fov = 45, 
  near = 0.1, 
  far = 100,
  makeDefault = true 
}) => {
  const cameraRef = useRef();
  const { set } = useThree();

  useEffect(() => {
    if (cameraRef.current && makeDefault) {
      set({ camera: cameraRef.current });
    }
  }, [makeDefault, set]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      position={position}
      fov={fov}
      near={near}
      far={far}
    />
  );
};

export default Camera;
