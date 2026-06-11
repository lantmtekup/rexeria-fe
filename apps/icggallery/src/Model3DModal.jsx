import { useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { DRACO } from './floors.js';

const DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');

// Standalone furniture model (Draco glTF). Optionally maps a video/image onto
// named meshes (`surfaces`) — e.g. a screen mesh that plays a video, or a frame
// mesh that shows an image. Find mesh names by opening the popup with `?debug`.
function Model({ url, surfaces }) {
  const { scene } = useGLTF(url, DRACO);
  // Clone so applied textures don't mutate the shared cached glTF.
  const root = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (DEBUG) {
      const names = [];
      root.traverse(o => o.isMesh && names.push(o.name));
      console.log('[Model3DModal] meshes:', names);
    }
    const videos = [];
    (surfaces ?? []).forEach(s => {
      const mesh = root.getObjectByName(s.mesh);
      if (!mesh || !mesh.isMesh) {
        console.warn('[Model3DModal] surface mesh not found:', s.mesh);
        return;
      }
      let tex;
      if (s.video) {
        const vid = Object.assign(document.createElement('video'), {
          src: s.video,
          crossOrigin: 'anonymous',
          loop: true,
          muted: true,
          playsInline: true,
        });
        vid.play().catch(() => {});
        videos.push(vid);
        tex = new THREE.VideoTexture(vid);
      } else if (s.image) {
        tex = new THREE.TextureLoader().load(s.image);
      }
      if (!tex) return;
      tex.flipY = false; // glTF UV convention
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = mesh.material.clone();
      mat.map = tex;
      mat.emissiveMap = tex; // self-lit so it reads like a screen
      mat.emissive = new THREE.Color(0xffffff);
      mat.emissiveIntensity = s.video ? 1 : 0.5;
      mat.needsUpdate = true;
      mesh.material = mat;
    });
    return () =>
      videos.forEach(v => {
        v.pause();
        v.src = '';
      });
  }, [root, surfaces]);

  return <primitive object={root} />;
}

// Popup that loads a 3D model of a clicked furniture item — drag to orbit,
// scroll to zoom. Opened from Experience when a `clickables` mesh is clicked.
export default function Model3DModal({ data, onClose }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role='dialog'
      aria-modal='true'
      onClick={onClose}
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-8'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='popup-card relative h-[70vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#f1ece2] shadow-2xl ring-1 ring-black/5'
      >
        {/* Header */}
        <div className='pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-5'>
          <div>
            {data.eyebrow && (
              <span className='block text-[10px] font-medium tracking-[0.24em] text-neutral-400 uppercase'>
                {data.eyebrow}
              </span>
            )}
            <h2
              className='mt-1 font-serif leading-tight font-light'
              style={{ fontSize: 'clamp(20px,3vw,26px)' }}
            >
              {data.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label='Close'
            className='pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-900'
          >
            ✕
          </button>
        </div>

        {/* 3D viewer */}
        {data.model3d ? (
          <Canvas
            camera={{ fov: 40, position: [2.2, 1.6, 2.8] }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Stage
                environment='apartment'
                intensity={0.45}
                adjustCamera={1.1}
                shadows='contact'
              >
                <Model url={data.model3d} surfaces={data.surfaces} />
              </Stage>
            </Suspense>
            <OrbitControls
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.7}
              minDistance={1.2}
              maxDistance={9}
            />
          </Canvas>
        ) : (
          <div className='grid h-full place-items-center px-8 text-center text-sm text-neutral-400'>
            Chưa cấu hình model 3D cho vật này — thêm URL GLB vào{' '}
            <code className='mx-1 rounded bg-black/5 px-1'>
              FURNITURE_MODELS
            </code>{' '}
            trong floors.js.
          </div>
        )}

        {data.model3d && (
          <span className='pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] tracking-wide text-neutral-400'>
            Kéo để xoay · cuộn để zoom
          </span>
        )}
      </div>
    </div>
  );
}
