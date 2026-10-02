import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import Camera from './Camera.jsx';
import Lighting from './Lighting.jsx';
import FloorGrid from './FloorGrid.jsx';
import AvatarModel from './AvatarModel.jsx';
import CostumeModel from './CostumeModel.jsx';
import ErrorBoundary3D from './ErrorBoundary3D.jsx';
import { 
  RotateCw, 
  Eye, 
  Grid as GridIcon, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

/**
 * 3D Loading Fallback indicator inside Three.js Canvas
 */
const CanvasLoader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur shadow-2xl min-w-[160px]">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-purple-200">Loading 3D Mesh...</span>
      </div>
    </Html>
  );
};

/**
 * Main Reusable 3D Scene Viewport
 */
export const Scene = ({
  modelUrl = null,
  initialCameraPosition = [0, 1.3, 3.2],
  autoRotateDefault = false,
  showGridDefault = true,
  className = "w-full h-full min-h-[460px]",
}) => {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [showGrid, setShowGrid] = useState(showGridDefault);
  const [wireframe, setWireframe] = useState(false);
  const [mannequinColor, setMannequinColor] = useState('#e2e8f0');
  const [showHelp, setShowHelp] = useState(false);

  // Camera presets
  const setCameraView = useCallback((position, target = [0, 1.1, 0]) => {
    if (!controlsRef.current) return;
    controlsRef.current.object.position.set(...position);
    controlsRef.current.target.set(...target);
    controlsRef.current.update();
  }, []);

  const handleResetCamera = () => {
    setCameraView(initialCameraPosition);
  };

  const handleFrontView = () => {
    setCameraView([0, 1.25, 3.0]);
  };

  const handleSideView = () => {
    setCameraView([3.0, 1.25, 0]);
  };

  const handleThreeQuarterView = () => {
    setCameraView([2.1, 1.4, 2.1]);
  };

  return (
    <ErrorBoundary3D>
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl ${className}`}>
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
          {/* View presets */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 shadow-md">
            <button
              onClick={handleFrontView}
              title="Front View"
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Front
            </button>
            <button
              onClick={handleThreeQuarterView}
              title="3/4 Isometric View"
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              3/4
            </button>
            <button
              onClick={handleSideView}
              title="Side Profile View"
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Side
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetCamera}
            title="Reset Camera Position"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>

        {/* Top Right Tooling Overlay */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Toggle Auto Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto-Rotation" : "Enable Auto-Rotation"}
            className={`p-2 rounded-xl text-xs font-medium border backdrop-blur transition-all shadow-md ${
              autoRotate
                ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Toggle Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Studio Grid"
            className={`p-2 rounded-xl text-xs font-medium border backdrop-blur transition-all shadow-md ${
              showGrid
                ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <GridIcon className="w-4 h-4" />
          </button>

          {/* Toggle Wireframe */}
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Mesh Wireframe"
            className={`p-2 rounded-xl text-xs font-medium border backdrop-blur transition-all shadow-md ${
              wireframe
                ? "bg-pink-600/30 border-pink-500/50 text-pink-300"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Help button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            title="Interaction Instructions"
            className="p-2 rounded-xl text-xs font-medium border backdrop-blur bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 shadow-md transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Interaction Guide Modal/Tooltip */}
        {showHelp && (
          <div className="absolute top-16 right-4 z-20 p-4 rounded-xl bg-slate-900/95 border border-slate-700 text-xs text-slate-300 shadow-2xl max-w-xs backdrop-blur animate-in fade-in">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>3D Viewport Controls</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong className="text-white">Rotate:</strong> Left Click + Drag</li>
              <li><strong className="text-white">Zoom:</strong> Mouse Scroll / Pinch</li>
              <li><strong className="text-white">Pan:</strong> Right Click + Drag</li>
            </ul>
          </div>
        )}

        {/* Bottom Status Tag */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur border border-slate-800/80 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>WebGL 3D Studio • Phase 1 Viewport</span>
          </div>
        </div>

        {/* 3D Canvas */}
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Custom Camera */}
          <Camera position={initialCameraPosition} fov={45} />

          {/* Lighting Rig */}
          <Lighting intensity={1.1} enableShadows={true} />

          {/* Floor & Grid */}
          <FloorGrid showGrid={showGrid} showShadow={true} />

          {/* Model & Costume with Suspense */}
          <Suspense fallback={<CanvasLoader />}>
            <AvatarModel 
              modelUrl="/models/female.glb" 
              position={[0, 0, 0]}
              scale={1}
            />
            <CostumeModel
              modelUrl="/costumes/shirt-female.glb"
              position={[0, 0, 0]}
              scale={1}
            />
          </Suspense>

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1.8}
            minDistance={1.2}
            maxDistance={7.0}
            maxPolarAngle={Math.PI / 2 + 0.05} // Do not clip under the floor
            target={[0, 1.1, 0]} // Center rotation on torso
          />
        </Canvas>
      </div>
    </ErrorBoundary3D>
  );
};

export default Scene;
