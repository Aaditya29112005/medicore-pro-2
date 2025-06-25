import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";

interface Animated3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  rotationSpeed?: number;
}

// 3D Background Component
const AnimatedBackground = ({ intensity = 0.5, rotationSpeed = 0.01 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * rotationSpeed) * intensity;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * rotationSpeed * 0.5) * intensity;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed * 0.3;
    }
    if (cylinderRef.current) {
      cylinderRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      <Box ref={meshRef} args={[2, 2, 2]} position={[-3, 0, -5]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </Box>
      
      <Sphere ref={sphereRef} args={[1, 16, 16]} position={[3, 2, -3]}>
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.4} />
      </Sphere>
      
      <Cylinder ref={cylinderRef} args={[0.5, 0.5, 2, 8]} position={[0, -2, -4]}>
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.3} />
      </Cylinder>
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
};

const Animated3DCard = ({ children, className = "", intensity = 20, rotationSpeed = 0.01 }: Animated3DCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-intensity, intensity], [intensity, -intensity]);
  const rotateY = useTransform(mouseX, [-intensity, intensity], [-intensity, intensity]);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(isHovered ? 1.05 : 1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div className="relative group">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <AnimatedBackground intensity={0.3} rotationSpeed={rotationSpeed} />
        </Canvas>
      </div>
      
      {/* Animated Card */}
      <motion.div
        ref={cardRef}
        className={`relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden ${className}`}
        style={{
          transformStyle: "preserve-3d",
          transform: "perspective(1000px)",
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Animated3DCard; 