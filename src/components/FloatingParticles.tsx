import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FloatingParticlesInner = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 8000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta / 10;
      ref.current.rotation.y += delta / 15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#fff"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
};

const FloatingParticles = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
    <Canvas camera={{ position: [0, 0, 1] }}>
      <FloatingParticlesInner />
    </Canvas>
  </div>
);

export default FloatingParticles; 