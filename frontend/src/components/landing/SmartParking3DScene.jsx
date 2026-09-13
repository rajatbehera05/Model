import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Parking3DEnvironment } from './Parking3DEnvironment';

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading 3D Parking Environment...</span>
      </div>
    </div>
  );
}

export function SmartParking3DScene() {
  // Center of facility geometry
  const facilityTarget = [1.3, 0.6, 0.2];

  return (
    <div className="w-full h-full relative select-none">
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.18
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Close, elevated 3/4 isometric architectural camera */}
          <PerspectiveCamera
            makeDefault
            position={[8.2, 6.9, 8.6]}
            fov={34}
            near={0.1}
            far={80}
          />

          {/* Balanced Environmental & Ambient Lighting */}
          <ambientLight intensity={0.7} />
          
          <hemisphereLight
            skyColor="#E0E7FF"
            groundColor="#F8FAFC"
            intensity={0.6}
          />

          {/* Strong Primary Sunlight casting crisp architectural shadows */}
          <directionalLight
            position={[10, 16, 8]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={35}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-bias={-0.0001}
          />

          {/* Soft fill light from opposite angle */}
          <directionalLight
            position={[-8, 10, -6]}
            intensity={0.35}
            color="#DBEAFE"
          />

          {/* The High-Density Smart Parking Environment */}
          <Parking3DEnvironment />

          {/* Soft Ground Contact Ambient Shadows */}
          <ContactShadows
            position={[1.3, -0.22, 0.2]}
            opacity={0.45}
            scale={18}
            blur={2.0}
            far={5}
            color="#0F172A"
          />

          {/* Smooth Interactive Orbit Controls centered directly on the facility */}
          <OrbitControls
            target={facilityTarget}
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.35}
            minPolarAngle={Math.PI / 3.6}
            maxAzimuthAngle={Math.PI / 2.6}
            minAzimuthAngle={Math.PI / 10}
            rotateSpeed={0.45}
            dampingFactor={0.06}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
