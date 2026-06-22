---
name: landing-3d
description: "Build production-grade landing pages with 3D visuals (Three.js, React Three Fiber, GLB models, scroll-linked animations). Use this skill whenever the user wants to create a landing page, marketing site, product showcase, or single-page website that includes 3D models, WebGL scenes, interactive viewers, scroll-driven animations, or immersive visual experiences. Also trigger when the user mentions: real estate landing page, luxury brand page, 3D product viewer, architectural visualization, property showcase, hero section with 3D, scroll animation landing page, or any combination of 'landing page' + '3D'."
---

# Landing Page with 3D — Implementation Skill

You are building a modern, high-performance landing page with immersive 3D visuals. This skill encodes battle-tested patterns from production real estate / luxury brand sites using React + Three.js.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 18 + TypeScript | Type safety, ecosystem |
| Build | Vite 5 | Fast HMR, optimized chunks |
| 3D Engine | Three.js + React Three Fiber | Declarative 3D in React |
| 3D Utilities | @react-three/drei | OrbitControls, useGLTF, Environment, ContactShadows, Html |
| Styling | styled-components | Scoped CSS-in-JS, theme tokens, keyframe animations |
| Animation | GSAP (scroll), CSS keyframes (UI) | GPU-accelerated, scroll-linked |
| Routing | React Router DOM v6 | SPA navigation |
| i18n | react-i18next | Multi-language support |

## Project Scaffold

When starting a new project, create this structure:

```
project-root/
├── public/
│   ├── models/          # GLB/GLTF 3D models
│   ├── textures/        # HDR environments, textures
│   ├── images/          # Hero images, backgrounds
│   └── fonts/           # Custom web fonts
├── src/
│   ├── components/
│   │   ├── layout/      # Header, Footer, Navigation
│   │   ├── sections/    # Hero3D, Features, Gallery, CTA, etc.
│   │   ├── three/       # 3D components (ModelViewer, Scene, etc.)
│   │   └── ui/          # Buttons, Cards, Badges
│   ├── hooks/           # useScrollProgress, useModelPreloader
│   ├── styles/
│   │   ├── theme.ts     # Design tokens
│   │   ├── global.ts    # Global styles + keyframes
│   │   └── animations.ts # Reusable keyframe definitions
│   ├── utils/
│   │   └── three-helpers.ts  # Model centering, preloading
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Phase 1: Foundation Setup

### 1.1 Vite Config with Three.js Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
    dedupe: ['three'], // Critical: prevent Three.js duplication
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-gsap': ['gsap'],
        },
      },
    },
  },
  server: { port: 3000 },
});
```

### 1.2 Dependencies

```bash
# Core
npm create vite@latest my-landing -- --template react-ts
cd my-landing

# 3D
npm i three @react-three/fiber @react-three/drei

# Styling & Animation
npm i styled-components gsap

# Types
npm i -D @types/three @types/styled-components

# Optional: i18n, routing, 360 panorama
npm i react-router-dom react-i18next i18next
npm i @photo-sphere-viewer/core  # if 360 panoramas needed
```

### 1.3 Theme System

Design tokens should adapt to light/dark mode via CSS custom properties. A luxury/premium landing page typically uses a dark palette with metallic accents:

```typescript
// src/styles/theme.ts
export const T = {
  // Layout
  maxW: '1320px',
  sectionPad: 'clamp(80px, 12vh, 140px)',
  
  // Colors — dark luxury palette
  bg: '#0A0A0F',
  bgDeep: '#050508',
  surface: '#12121A',
  card: '#1A1A24',
  border: 'rgba(255, 255, 255, 0.08)',
  
  // Text
  text: '#FFFFFF',
  textSec: 'rgba(255, 255, 255, 0.7)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  
  // Accent — warm gold for luxury feel
  accent: '#C9A96E',
  accentLight: '#E8D5A8',
  accentGlow: 'rgba(201, 169, 110, 0.15)',
  
  // Typography
  fontHeading: "'Barlow Condensed', sans-serif",
  fontBody: "'Inter', sans-serif",
  
  // Responsive font sizes
  h1: 'clamp(2.5rem, 6vw, 5rem)',
  h2: 'clamp(2rem, 4vw, 3.5rem)',
  h3: 'clamp(1.25rem, 2vw, 1.75rem)',
  body: 'clamp(0.95rem, 1.2vw, 1.1rem)',
} as const;
```

## Phase 2: 3D Components

### 2.1 Model Viewer (React Three Fiber)

The core 3D viewer pattern — auto-centers any GLB model, supports orbit controls, environment lighting, and annotations:

```typescript
// src/components/three/ModelViewer.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  scale?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

function Model({ url, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    // Auto-center model regardless of origin position
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = (scale * 2) / maxDim;

    scene.position.sub(center);
    scene.scale.setScalar(scaleFactor);
  }, [scene, scale]);

  return <primitive ref={ref} object={scene} />;
}

export function ModelViewer({
  url,
  scale = 1,
  autoRotate = true,
  rotateSpeed = 0.5,
}: ModelProps) {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Model url={url} scale={scale} />
        <Environment preset="apartment" />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} blur={2} />
      </Suspense>
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={rotateSpeed}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={2}
        maxDistance={8}
      />
    </Canvas>
  );
}
```

### 2.2 Scroll-Linked 3D Hero

The hero section where a 3D model responds to scroll — the user scrolls and the building/product rotates, camera zooms in:

```typescript
// src/components/sections/Hero3D.tsx
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import styled from 'styled-components';
import { T } from '@/styles/theme';

export function Hero3D({ modelUrl, title, subtitle }: {
  modelUrl: string;
  title: string;
  subtitle?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const handleScroll = useCallback(() => {
    if (!modelRef.current || !cameraRef.current) return;
    const progress = Math.min(1, window.scrollY / window.innerHeight);

    // Rotate model based on scroll
    modelRef.current.rotation.y = progress * Math.PI * 0.5;

    // Zoom camera as user scrolls
    const startFov = 50;
    const endFov = 35;
    cameraRef.current.fov = startFov - (startFov - endFov) * progress;
    cameraRef.current.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Load model with DRACO compression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      // Auto-center
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);
      modelRef.current = model;
    });

    // Scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [modelUrl, handleScroll]);

  return (
    <HeroWrapper>
      <ThreeCanvas ref={containerRef} />
      <HeroContent>
        <HeroTitle>{title}</HeroTitle>
        {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
      </HeroContent>
    </HeroWrapper>
  );
}

const HeroWrapper = styled.section`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: ${T.bgDeep};
`;

const ThreeCanvas = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const HeroContent = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  pointer-events: none;
  padding: 0 24px;
`;

const HeroTitle = styled.h1`
  font-family: ${T.fontHeading};
  font-size: ${T.h1};
  font-weight: 700;
  color: ${T.text};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 2px 40px rgba(0, 0, 0, 0.6);
`;

const HeroSubtitle = styled.p`
  font-family: ${T.fontBody};
  font-size: ${T.body};
  color: ${T.textSec};
  margin-top: 16px;
  max-width: 600px;
`;
```

### 2.3 Model Preloader

Pre-fetch heavy 3D assets to avoid loading jank when the user reaches 3D sections:

```typescript
// src/utils/model-preloader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const cache = new Map<string, THREE.Object3D>();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export function preloadModel(
  url: string,
  onProgress?: (pct: number) => void,
): Promise<THREE.Object3D> {
  if (cache.has(url)) return Promise.resolve(cache.get(url)!.clone());

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        cache.set(url, gltf.scene);
        resolve(gltf.scene.clone());
      },
      (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      },
      reject,
    );
  });
}

export function preloadModels(urls: string[]): void {
  urls.forEach((url) => preloadModel(url));
}
```

## Phase 3: Landing Page Sections

A typical landing page flows: **Hero → Features → Gallery → Specs → CTA → Footer**. Each section should be a standalone component in `src/components/sections/`.

### 3.1 Section Wrapper Pattern

Every section uses consistent padding, max-width, and fade-in animation:

```typescript
// src/components/sections/Section.tsx
import styled, { keyframes } from 'styled-components';
import { T } from '@/styles/theme';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Section = styled.section<{ $dark?: boolean }>`
  padding: ${T.sectionPad} 24px;
  background: ${(p) => (p.$dark ? T.bgDeep : T.bg)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SectionInner = styled.div`
  width: 100%;
  max-width: ${T.maxW};
`;

export const SectionTitle = styled.h2`
  font-family: ${T.fontHeading};
  font-size: ${T.h2};
  font-weight: 700;
  color: ${T.text};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0 0 16px;
`;

export const SectionSub = styled.p`
  font-family: ${T.fontBody};
  font-size: ${T.body};
  color: ${T.textSec};
  max-width: 640px;
  margin: 0 0 48px;
  line-height: 1.6;
`;

// Use with IntersectionObserver for scroll-triggered animation
export const FadeInDiv = styled.div<{ $visible: boolean; $delay?: number }>`
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: translateY(${(p) => (p.$visible ? 0 : 40)}px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: ${(p) => p.$delay ?? 0}ms;
`;
```

### 3.2 useScrollReveal Hook

Reusable IntersectionObserver hook for triggering fade-in animations:

```typescript
// src/hooks/useScrollReveal.ts
import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
```

### 3.3 Scroll-Scrubber (Frame Sequence Animation)

For cinematic scroll-driven animations using pre-rendered image sequences:

```typescript
// src/components/sections/ScrollScrubber.tsx
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Props {
  frameUrls: string[];       // Array of sequential frame image URLs
  height?: string;           // Scroll distance, e.g., "300vh"
}

export function ScrollScrubber({ frameUrls, height = '300vh' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // Preload all frames
    const images = frameUrls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
    framesRef.current = images;
  }, [frameUrls]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollH = container.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollH));
      const frameIndex = Math.min(
        framesRef.current.length - 1,
        Math.floor(progress * framesRef.current.length),
      );

      const img = framesRef.current[frameIndex];
      if (img?.complete) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <ScrubberWrap ref={containerRef} style={{ height }}>
      <StickyCanvas ref={canvasRef} />
    </ScrubberWrap>
  );
}

const ScrubberWrap = styled.div`
  position: relative;
`;

const StickyCanvas = styled.canvas`
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  object-fit: contain;
`;
```

## Phase 4: Performance Optimization

Performance is critical for 3D landing pages. A slow-loading page kills conversion.

### 4.1 Code Splitting Strategy

```typescript
// Lazy-load 3D components — they're heavy
const Hero3D = lazy(() => import('@/components/sections/Hero3D'));
const ModelViewer = lazy(() => import('@/components/three/ModelViewer'));

// In your page:
<Suspense fallback={<LoadingSkeleton />}>
  <Hero3D modelUrl="/models/building.glb" title="..." />
</Suspense>
```

### 4.2 Performance Checklist

- **Renderer**: Set `dpr={[1, 2]}` — caps pixel ratio at 2x (retina), prevents 3x on high-DPI
- **Models**: Use DRACO-compressed GLB files. Target < 5MB per model
- **Textures**: Use KTX2/basis for GPU-compressed textures when possible
- **Scroll listeners**: Always `{ passive: true }` — never block the compositor
- **Animations**: Only animate `transform` and `opacity` — these are GPU-composited
- **Resize**: Debounce resize handlers or use ResizeObserver
- **Canvas cleanup**: Always `renderer.dispose()` and cancel `requestAnimationFrame` in useEffect cleanup
- **Preloading**: Call `preloadModels()` on page mount for below-fold 3D content
- **will-change**: Apply `will-change: transform` on animated elements, but remove after animation completes

### 4.3 Responsive 3D

Mobile devices have limited GPU. Adapt the 3D experience:

```typescript
const isMobile = window.innerWidth < 768;

// Lower quality on mobile
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

// Simpler lighting on mobile
if (isMobile) {
  scene.remove(pointLight);  // Remove expensive lights
}

// In R3F Canvas
<Canvas dpr={isMobile ? 1 : [1, 2]} frameloop={isMobile ? 'demand' : 'always'}>
```

## Phase 5: SEO & Accessibility

### 5.1 HTML Structure

```html
<!-- index.html — critical fonts & meta -->
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="..." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
```

### 5.2 Accessibility

- 3D Canvas sections must have `role="img"` and `aria-label` describing the visual
- All interactive elements use `<button>` or `<a>`, never `<div onClick>`
- Respect `prefers-reduced-motion`: disable auto-rotate, scroll animations
- Provide text alternatives for all 3D content — screen readers can't see WebGL

```typescript
// Respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In R3F
<OrbitControls autoRotate={!prefersReducedMotion} />

// In scroll handlers
if (prefersReducedMotion) return; // Skip scroll animations
```

## Deployment (Vite + Vercel)

```bash
# Build
npx vite build

# Deploy
npx vercel --prod --yes

# SPA rewrite (vercel.json in project root)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }]
}
```

## Quick Reference: Common Patterns

| Pattern | Where | Key |
|---------|-------|-----|
| Auto-center GLB model | `Box3().setFromObject()` → `position.sub(center)` | Always do this |
| Scroll progress 0→1 | `Math.min(1, scrollY / innerHeight)` | Use with `{ passive: true }` |
| Fade-in on scroll | IntersectionObserver + CSS transition | One-shot, unobserve after |
| Lazy 3D import | `lazy(() => import(...))` + `Suspense` | Keeps initial bundle small |
| Staggered animation | `animation-delay: ${index * 100}ms` | Use CSS, not JS timeouts |
| Responsive 3D | Check `innerWidth`, lower dpr on mobile | `frameloop="demand"` saves battery |
| GPU animation only | `transform` + `opacity` only | Never animate `width`, `height`, `top` |
