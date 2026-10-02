import React from 'react';
import { ContactShadows, Grid } from '@react-three/drei';

export const FloorGrid = ({ showGrid = true, showShadow = true }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Contact Shadows on the ground */}
      {showShadow && (
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.7}
          scale={5}
          blur={1.5}
          far={3}
          resolution={512}
          color="#090d16"
        />
      )}

      {/* Ground Grid Helper */}
      {showGrid && (
        <Grid
          position={[0, -0.001, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.8}
          cellColor="#334155"
          sectionSize={1.5}
          sectionThickness={1.2}
          sectionColor="#6366f1"
          fadeDistance={6}
          fadeStrength={1.5}
        />
      )}
    </group>
  );
};

export default FloorGrid;
