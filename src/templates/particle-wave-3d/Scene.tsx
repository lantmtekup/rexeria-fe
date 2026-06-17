'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  colorA?: string;
  colorB?: string;
  /** Mật độ lưới mỗi cạnh. Default 140. */
  density?: number;
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vH;
  void main() {
    vec3 p = position;
    // sóng cơ bản (2 hướng) + gợn theo con trỏ
    float w = sin(p.x * 0.55 + uTime) * 0.5 + cos(p.z * 0.55 + uTime * 0.8) * 0.5;
    float d = distance(p.xz, uMouse);
    w += sin(d * 1.4 - uTime * 2.2) * exp(-d * 0.28) * 0.9;
    p.y = w;
    vH = w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (16.0 / -mv.z) * (0.6 + 0.4 * (w * 0.5 + 0.5));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vH;
  void main() {
    float dd = distance(gl_PointCoord, vec2(0.5));
    if (dd > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dd);
    vec3 col = mix(uColorA, uColorB, clamp(vH * 0.5 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha);
  }
`;

function ParticleWave({
  colorA = '#3b82f6',
  colorB = '#c9a96e',
  density = 140,
}: SceneProps) {
  const matRef = React.useRef<THREE.ShaderMaterial>(null);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const positions = React.useMemo(() => {
    const range = 28;
    const step = range / density;
    const arr = new Float32Array(density * density * 3);
    let i = 0;
    for (let xi = 0; xi < density; xi++) {
      for (let zi = 0; zi < density; zi++) {
        arr[i++] = -range / 2 + xi * step;
        arr[i++] = 0;
        arr[i++] = -range / 2 + zi * step;
      }
    }
    return arr;
  }, [density]);

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    [colorA, colorB]
  );

  useFrame(({ clock, pointer }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = reduced ? 0.6 : clock.elapsedTime * 0.6;
    // pointer (-1..1) → toạ độ lưới
    m.uniforms.uMouse.value.lerp(
      new THREE.Vector2(pointer.x * 14, -pointer.y * 14),
      0.06
    );
  });

  return (
    <points rotation={[-Math.PI / 2.6, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig() {
  // parallax camera nhẹ theo con trỏ
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 2 - camera.position.x) * 0.03;
    camera.position.y += (3 + pointer.y * 1.2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 3, 11], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach='background' args={['#06070b']} />
      <fog attach='fog' args={['#06070b', 14, 30]} />
      <ParticleWave {...props} />
      <Rig />
    </Canvas>
  );
}
