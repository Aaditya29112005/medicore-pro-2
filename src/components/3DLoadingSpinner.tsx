import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";

const LoadingSpinner3D = () => {
  const boxRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (boxRef.current) {
      boxRef.current.rotation.x = time * 2;
      boxRef.current.rotation.y = time * 1.5;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.z = time * 1.8;
      sphereRef.current.position.y = Math.sin(time * 2) * 0.5;
    }
    
    if (cylinderRef.current) {
      cylinderRef.current.rotation.x = time * 1.2;
      cylinderRef.current.rotation.z = time * 0.8;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      
      <Box ref={boxRef} args={[1, 1, 1]} position={[-2, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
      </Box>
      
      <Sphere ref={sphereRef} args={[0.8, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.7} />
      </Sphere>
      
      <Cylinder ref={cylinderRef} args={[0.6, 0.6, 1.5, 8]} position={[2, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.8} />
      </Cylinder>
    </>
  );
};

interface LoadingSpinner3DProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner3DComponent = ({ className = "", size = "md" }: LoadingSpinner3DProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <LoadingSpinner3D />
        </Canvas>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm font-medium text-gray-600">Loading...</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner3DComponent; 