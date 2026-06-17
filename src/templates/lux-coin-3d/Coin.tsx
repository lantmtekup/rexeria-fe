'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  Text,
} from '@react-three/drei';
import * as THREE from 'three';

interface CoinSceneProps {
  accent?: string;
  topText?: string;
  bottomText?: string;
}

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Coin vàng procedural — không cần GLB. Cylinder + 2 rim ring + chữ emboss. */
function Coin({ accent = '#c9a96e', topText, bottomText }: CoinSceneProps) {
  const group = React.useRef<THREE.Group>(null);
  const scrollRef = React.useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(
        1,
        window.scrollY / Math.max(1, window.innerHeight)
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!REDUCED) g.rotation.y += delta * 0.35;
    // scroll-link: nghiêng nhẹ + lật theo cuộn
    const p = scrollRef.current;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.25 + p * 0.9, 0.08);
  });

  const gold = (
    <meshStandardMaterial
      color={accent}
      metalness={1}
      roughness={0.26}
      envMapIntensity={1.25}
    />
  );

  return (
    <Float speed={REDUCED ? 0 : 1.4} rotationIntensity={0} floatIntensity={0.6}>
      <group ref={group} rotation={[-0.25, 0, 0]}>
        {/* thân coin */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.2, 96]} />
          {gold}
        </mesh>
        {/* viền nổi 2 mặt */}
        {[0.101, -0.101].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <torusGeometry args={[1.34, 0.05, 24, 96]} />
            {gold}
          </mesh>
        ))}
        {/* chữ mặt trước (emboss tối hơn nền vàng) */}
        {topText && (
          <Text
            position={[0, 0.95, 0.11]}
            fontSize={0.2}
            letterSpacing={0.06}
            color='#5a4a22'
            anchorX='center'
            anchorY='middle'
          >
            {topText}
          </Text>
        )}
        {bottomText && (
          <Text
            position={[0, -0.95, 0.11]}
            fontSize={0.2}
            letterSpacing={0.04}
            color='#5a4a22'
            anchorX='center'
            anchorY='middle'
          >
            {bottomText}
          </Text>
        )}
        {/* hình tròn trung tâm */}
        <mesh position={[0, 0, 0.105]}>
          <ringGeometry args={[0.55, 0.62, 64]} />
          <meshStandardMaterial
            color={accent}
            metalness={1}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function CoinScene({
  accent,
  topText,
  bottomText,
}: CoinSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow />
      <directionalLight
        position={[-5, 2, -3]}
        intensity={0.5}
        color='#fff4d6'
      />
      <React.Suspense fallback={null}>
        <Coin accent={accent} topText={topText} bottomText={bottomText} />
        <Environment preset='apartment' />
      </React.Suspense>
      <ContactShadows
        position={[0, -1.7, 0]}
        opacity={0.45}
        blur={2.4}
        scale={8}
        far={4}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
