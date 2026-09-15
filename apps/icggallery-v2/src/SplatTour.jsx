import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Splat, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Lenis from 'lenis';

// ── Gaussian Splatting tour (Option C POC) ────────────────────────────
// Photoreal + free camera, scroll-driven. Uses a public SAMPLE .splat as a
// placeholder — swap SPLAT_URL with the trained Epictower capture (see
// plans/epictower-splat-pipeline.md) and tune the camera path.
// Interior "room" scene (Mip-NeRF360) — closest public stand-in for a
// real-estate / BĐS interior. Swap with the trained Epictower capture.
const SPLAT_URL =
  'https://huggingface.co/cakewalk/splat-data/resolve/main/room.splat';

function Scene({ progressRef }) {
  const camera = useThree(s => s.camera);
  const target = new THREE.Vector3(0, 0, 0);

  const pos = new THREE.Vector3();
  useFrame(() => {
    const t = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);
    // Interior walk-through: stand inside the capture point, drift through
    // the room (dolly along z) while slowly panning the view around the
    // walls. External orbit just hits floaters — inside look-around is the
    // right paradigm for a real-estate space.
    const cz = THREE.MathUtils.lerp(0.5, -0.5, t); // small drift, stay in clean pocket
    pos.set(0, 0, cz);
    camera.position.lerp(pos, 0.08);
    // Pan a gentle arc centred on the picture/shelf wall (cleanest side),
    // looking slightly up to favour walls over central floaters.
    const az = THREE.MathUtils.lerp(Math.PI / 2 - 0.5, Math.PI / 2 + 0.7, t);
    target.set(Math.sin(az) * 4, 0.15, cz - Math.cos(az) * 4);
    camera.lookAt(target);
  });

  // 3DGS .splat is Y-down → rotate 180° on X to stand upright.
  return <Splat src={SPLAT_URL} rotation={[Math.PI, 0, 0]} />;
}

export default function SplatTour() {
  const progressRef = useRef(0);
  const enteredRef = useRef(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    const onScroll = () => {
      if (!enteredRef.current) {
        progressRef.current = 0;
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? window.scrollY / max : 0;
    };
    lenis.on('scroll', onScroll);
    const raf = t => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    const onKey = e => {
      if (e.key === 'o') setDebug(d => !d);
    };
    window.addEventListener('keydown', onKey);
    enteredRef.current = true; // POC: no gate
    return () => {
      lenis.destroy();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      <div className='fixed inset-0'>
        <Canvas
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.6, 6] }}
          dpr={[1, 2]}
        >
          <color attach='background' args={['#0d0d0f']} />
          <Suspense fallback={null}>
            <Scene progressRef={progressRef} />
          </Suspense>
          {debug && <OrbitControls makeDefault />}
        </Canvas>
      </div>

      <div style={{ height: '600vh' }} />

      <header className='pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 text-white'>
        <span className='text-sm tracking-[0.3em] uppercase'>Epictower</span>
        <span className='text-[11px] tracking-[0.2em] uppercase opacity-70'>
          Live Tour · Splat POC
        </span>
      </header>
      <div className='pointer-events-none fixed inset-x-0 bottom-6 z-20 text-center text-[11px] tracking-[0.25em] text-white/60 uppercase'>
        Scroll to move · press “o” to orbit · sample splat (placeholder)
      </div>
    </>
  );
}
