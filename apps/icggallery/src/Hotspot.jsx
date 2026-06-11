import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const _v = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _to = new THREE.Vector3();

// A 3D-anchored hotspot. Fades in when its world point is on screen and in
// front of the camera, fades out once the camera scrolls past. Click → popup.
export default function Hotspot({ data, onOpen }) {
  const wrap = useRef(null);
  const shown = useRef(false);
  const camera = useThree(s => s.camera);

  useFrame(() => {
    const el = wrap.current;
    if (!el) return;
    // Must be in front of the camera (project() alone wrongly maps points
    // behind the camera onto the screen → eye stayed visible after scrolling by).
    camera.getWorldDirection(_fwd);
    _to.copy(data.position).sub(camera.position);
    const dist = _to.length();
    const inFront = _to.dot(_fwd) > 0;
    _v.copy(data.position).project(camera);
    // Only show when the camera is genuinely NEAR the hotspot (not from across the
    // room as you scroll). Override per hotspot via data.range.
    const visible =
      inFront &&
      dist < (data.range ?? 11) &&
      Math.abs(_v.x) < 0.6 &&
      Math.abs(_v.y) < 0.6;
    if (visible !== shown.current) {
      shown.current = visible;
      el.style.opacity = visible ? '1' : '0';
      el.style.transform = visible ? 'scale(1)' : 'scale(0.7)';
      el.style.pointerEvents = visible ? 'auto' : 'none';
    }
  });

  return (
    <Html
      position={data.position}
      center
      zIndexRange={[30, 10]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        ref={wrap}
        className='group flex items-center gap-0'
        style={{
          opacity: 0,
          transform: 'scale(0.7)',
          transition: 'opacity .45s ease, transform .45s ease',
        }}
      >
        <button
          type='button'
          onClick={() => onOpen(data)}
          aria-label={data.title}
          className='hotspot-btn relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:scale-110'
        >
          {/* pulsing ring */}
          <span className='hotspot-pulse pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70' />
          <img
            src='/eye.svg'
            alt=''
            aria-hidden='true'
            className='hotspot-eye h-auto w-6'
          />
        </button>
        {/* connector line + label (slide/fade in on hover) */}
        {data.title && (
          <div className='pointer-events-none flex items-center'>
            <span className='hotspot-line block h-px w-0 bg-white/80 transition-all duration-300 group-hover:w-8' />
            <span className='hotspot-label -translate-x-2 rounded-full bg-white/90 px-3 py-1 text-[11px] tracking-[0.18em] whitespace-nowrap text-neutral-900 uppercase opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
              {data.title}
            </span>
          </div>
        )}
      </div>
    </Html>
  );
}
