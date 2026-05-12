import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BioNode() {
  const mesh = useRef();
  const points = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.1;
    mesh.current.rotation.x = t * 0.05;
    points.current.rotation.y = t * 0.08;
  });

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      const x = THREE.MathUtils.randFloatSpread(10);
      const y = THREE.MathUtils.randFloatSpread(10);
      const z = THREE.MathUtils.randFloatSpread(10);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={mesh} args={[2, 64, 64]}>
          <MeshDistortMaterial
            color="#ECD06F"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </Float>
      
      <Points ref={points} positions={particles}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      <gridHelper args={[20, 20, 0x333333, 0x111111]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -5]} />
    </>
  );
}

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ECD06F" />
      <BioNode />
    </Canvas>
  );
}
