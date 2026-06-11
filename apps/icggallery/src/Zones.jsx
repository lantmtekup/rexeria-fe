import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DRACO } from './floors.js';

const _p = new THREE.Vector3();
const _d = new THREE.Vector3();
const _t = new THREE.Vector3();

// 2D convex hull (Andrew's monotone chain). Keeps the projected zone a clean,
// non-self-intersecting outline even if the user clicked points out of order or
// at different depths (which otherwise produce a distorted "bowtie" polygon).
function hull(points) {
  if (points.length < 3) return points;
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Pure projection — MUST be called from Experience's own useFrame AFTER the
// camera pose for the frame is finalized (camera.updateMatrixWorld()), otherwise
// the polygon lags one frame and visibly slides past the object while scrolling.
const _c = new THREE.Vector3();

export function projectZones(camera, W, H, zones, draft) {
  camera.getWorldDirection(_d);
  const project = points => {
    if (!points || !points.length) return { pts: [], visible: false };
    let visible = true;
    const pts = [];
    for (const [x, y, z] of points) {
      _p.set(x, y, z);
      if (_t.copy(_p).sub(camera.position).dot(_d) <= 0.02) visible = false; // behind cam
      const n = _p.project(camera);
      pts.push([(n.x * 0.5 + 0.5) * W, (-n.y * 0.5 + 0.5) * H]);
    }
    return { pts, visible };
  };

  // Distance cull: a zone's world points project onto whatever is in front of the
  // camera even from another room (projection ignores occlusion), so the polygon
  // would "stick" to far walls. Only show a zone when the camera is actually NEAR
  // it. Threshold auto-scales with the zone's own size; override via `zone.range`.
  const inRange = z => {
    const pts = z.points;
    let cx = 0,
      cy = 0,
      cz = 0;
    for (const [x, y, zz] of pts) {
      cx += x;
      cy += y;
      cz += zz;
    }
    const n = pts.length || 1;
    _c.set(cx / n, cy / n, cz / n);
    let radius = 0;
    for (const [x, y, zz] of pts)
      radius = Math.max(radius, _t.set(x, y, zz).distanceTo(_c));
    const limit = z.range ?? radius + 9; // viewing-distance margin
    return _c.distanceTo(camera.position) <= limit;
  };

  return {
    zones: (zones || []).map(z => {
      const r = project(z.points);
      return { id: z.id, visible: r.visible && inRange(z), pts: hull(r.pts) };
    }),
    draft: project(draft || []),
  };
}

// ── In-scene image (type: 'image-inline') ──────────────────────────────────
// Renders the image as a real textured quad at the zone's world location — like
// a painting hung on the wall. Depth buffer handles occlusion, so no overlay /
// distance-cull / popup needed. Built from the polygon's best-fit rectangle.
function quadGeometry(points) {
  const pts = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const c = new THREE.Vector3();
  pts.forEach(p => c.add(p));
  c.divideScalar(pts.length);
  const normal = new THREE.Vector3();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i].clone().sub(c);
    const b = pts[(i + 1) % pts.length].clone().sub(c);
    normal.add(a.cross(b));
  }
  if (normal.lengthSq() < 1e-9) normal.set(0, 0, 1);
  normal.normalize();
  const up = new THREE.Vector3(0, 1, 0);
  let u = new THREE.Vector3().crossVectors(up, normal);
  if (u.lengthSq() < 1e-6) u.set(1, 0, 0);
  u.normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();
  let minU = Infinity,
    maxU = -Infinity,
    minV = Infinity,
    maxV = -Infinity;
  for (const p of pts) {
    const d = p.clone().sub(c);
    const pu = d.dot(u),
      pv = d.dot(v);
    minU = Math.min(minU, pu);
    maxU = Math.max(maxU, pu);
    minV = Math.min(minV, pv);
    maxV = Math.max(maxV, pv);
  }
  // Coplanar with the drawn points; polygonOffset (on the material) makes it win
  // the depth test against the coincident wall/artwork from EITHER side — no need
  // to guess which way is "in front".
  const corner = (su, sv) =>
    c.clone().addScaledVector(u, su).addScaledVector(v, sv);
  const p00 = corner(minU, minV),
    p10 = corner(maxU, minV);
  const p11 = corner(maxU, maxV),
    p01 = corner(minU, maxV);
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        ...p00.toArray(),
        ...p10.toArray(),
        ...p11.toArray(),
        ...p00.toArray(),
        ...p11.toArray(),
        ...p01.toArray(),
      ]),
      3
    )
  );
  g.setAttribute(
    'uv',
    new THREE.BufferAttribute(
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]),
      2
    )
  );
  g.computeVertexNormals();
  return g;
}

function InlineImage({ zone }) {
  const tex = useTexture(zone.src);
  const geom = useMemo(() => quadGeometry(zone.points), [zone.points]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return (
    <mesh geometry={geom} renderOrder={1}>
      <meshBasicMaterial
        map={tex}
        side={THREE.DoubleSide}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

// Same quad, but a looping muted video plays as a VideoTexture (in-scene).
function InlineVideo({ zone }) {
  const geom = useMemo(() => quadGeometry(zone.points), [zone.points]);
  const tex = useMemo(() => {
    const vid = Object.assign(document.createElement('video'), {
      src: zone.src,
      crossOrigin: 'anonymous',
      loop: true,
      muted: true,
      playsInline: true,
    });
    vid.play().catch(() => {});
    const t = new THREE.VideoTexture(vid);
    t.colorSpace = THREE.SRGBColorSpace;
    t.userData.video = vid;
    return t;
  }, [zone.src]);
  useEffect(
    () => () => {
      tex.userData.video?.pause();
      tex.dispose();
    },
    [tex]
  );
  return (
    <mesh geometry={geom} renderOrder={1}>
      <meshBasicMaterial
        map={tex}
        side={THREE.DoubleSide}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

export function InlineImages({ zones }) {
  return (zones || [])
    .filter(
      z => (z.type === 'image-inline' || z.type === 'video-inline') && z.src
    )
    .map(z =>
      z.type === 'video-inline' ? (
        <InlineVideo key={z.id} zone={z} />
      ) : (
        <InlineImage key={z.id} zone={z} />
      )
    );
}

// ── In-scene 3D model (type: 'model-inline') ────────────────────────────────
// Places the GLB right on the zone (e.g. on a table top) — no popup. Auto-scaled
// to the zone footprint and seated on the zone's top surface.
function InlineModel({ zone }) {
  const { scene } = useGLTF(zone.src, DRACO);
  // Wrap in a Group whose origin is the model's centre (xz) at its base, placed
  // on the zone — so rotating the group spins the model around its own axis.
  const group = useMemo(() => {
    const root = scene.clone(true);
    const pts = zone.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const zc = new THREE.Vector3();
    pts.forEach(p => zc.add(p));
    zc.divideScalar(pts.length);
    let zw = 0;
    for (const a of pts)
      for (const b of pts) zw = Math.max(zw, Math.hypot(a.x - b.x, a.z - b.z));
    const topY = Math.max(...pts.map(p => p.y));
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = (zw * 0.7) / (Math.max(size.x, size.z) || 1);
    root.scale.setScalar(scale);
    const box2 = new THREE.Box3().setFromObject(root);
    const c2 = box2.getCenter(new THREE.Vector3());
    root.position.set(-c2.x, -box2.min.y, -c2.z); // centre xz at origin, base at y=0
    const g = new THREE.Group();
    g.add(root);
    g.position.set(zc.x, topY, zc.z);
    return g;
  }, [scene, zone]);

  // Gentle auto-rotate (showcases the model); pauses while the user drags.
  const dragging = useRef(false);
  useFrame((_, dt) => {
    if (!dragging.current) group.rotation.y += dt * 0.4;
  });

  // Drag to rotate (window listeners so the drag keeps working off the model).
  const onDown = e => {
    e.stopPropagation();
    dragging.current = true;
    let px = e.clientX,
      py = e.clientY;
    document.body.style.cursor = 'grabbing';
    const move = ev => {
      group.rotation.y += (ev.clientX - px) * 0.01;
      group.rotation.x = Math.max(
        -0.6,
        Math.min(0.6, group.rotation.x + (ev.clientY - py) * 0.01)
      );
      px = ev.clientX;
      py = ev.clientY;
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <primitive
      object={group}
      onPointerDown={onDown}
      onPointerOver={() => {
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    />
  );
}

export function InlineModels({ zones }) {
  return (zones || [])
    .filter(z => z.type === 'model-inline' && z.src)
    .map(z => <InlineModel key={z.id} zone={z} />);
}

const fmt = pts =>
  pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

// Full-screen SVG overlay (DOM). Root is pointer-events:none so the scene still
// scrolls; only the zone polygons capture hover/click. In author mode polygons
// are click-through so you can place points on the model underneath.
export function ZoneOverlay({ zones, author, outRef, onOpen }) {
  const elRefs = useRef({});
  const draftRef = useRef(null);
  const [hover, setHover] = useState(null);
  const typeOf = useMemo(() => {
    const m = {};
    (zones || []).forEach(z => {
      m[z.id] = z.type;
    });
    return m;
  }, [zones]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const data = outRef.current;
      if (data) {
        for (const z of data.zones) {
          const el = elRefs.current[z.id];
          if (!el) continue;
          const ok = z.visible && z.pts.length >= 3;
          if (!ok) {
            el.style.display = 'none';
            continue;
          }
          el.style.display = '';
          if (typeOf[z.id] === 'hotspot') {
            // marker group positioned at the polygon centroid
            let cx = 0,
              cy = 0;
            for (const p of z.pts) {
              cx += p[0];
              cy += p[1];
            }
            cx /= z.pts.length;
            cy /= z.pts.length;
            el.setAttribute(
              'transform',
              `translate(${cx.toFixed(1)},${cy.toFixed(1)})`
            );
          } else {
            el.setAttribute('points', fmt(z.pts));
          }
        }
        const d = draftRef.current;
        if (d) {
          if (data.draft && data.draft.pts.length) {
            d.style.display = '';
            d.setAttribute('points', fmt(data.draft.pts));
          } else d.style.display = 'none';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [outRef, typeOf]);

  return (
    <svg
      className='fixed inset-0 z-30 h-full w-full'
      style={{ pointerEvents: 'none' }}
    >
      {zones.map(z => {
        const on = hover === z.id;
        const common = {
          ref: el => {
            if (el) elRefs.current[z.id] = el;
          },
          style: {
            display: 'none',
            cursor: 'pointer',
            pointerEvents: author ? 'none' : 'all',
          },
          onMouseEnter: () => setHover(z.id),
          onMouseLeave: () => setHover(h => (h === z.id ? null : h)),
          onClick: () => onOpen(z),
        };
        if (z.type === 'hotspot') {
          // Pulsing ring + dot, positioned via the group's transform each frame.
          return (
            <g
              key={z.id}
              ref={common.ref}
              style={{ display: 'none', cursor: 'pointer' }}
              transform='translate(-9999,-9999)'
              onMouseEnter={common.onMouseEnter}
              onMouseLeave={common.onMouseLeave}
              onClick={common.onClick}
            >
              <circle
                r='8'
                fill='none'
                stroke='#ffcc66'
                strokeWidth='2'
                style={{ pointerEvents: 'none' }}
              >
                <animate
                  attributeName='r'
                  values='8;22'
                  dur='1.8s'
                  repeatCount='indefinite'
                />
                <animate
                  attributeName='opacity'
                  values='0.7;0'
                  dur='1.8s'
                  repeatCount='indefinite'
                />
              </circle>
              <circle
                r='16'
                fill='transparent'
                style={{ pointerEvents: author ? 'none' : 'all' }}
              />
              <circle
                r={on ? 10 : 7}
                fill={on ? '#ffcc66' : 'rgba(255,204,102,0.9)'}
                stroke='#fff'
                strokeWidth='2'
                style={{
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.5))',
                  transition: 'r .2s ease, fill .2s ease',
                }}
              />
            </g>
          );
        }
        return (
          <polygon
            {...common}
            key={z.id}
            points=''
            style={{
              ...common.style,
              // Hover-only outline; transparent but hittable (pointerEvents:all).
              fill: on ? 'rgba(255,204,102,0.18)' : 'transparent',
              stroke: on ? '#ffcc66' : 'transparent',
              strokeWidth: on ? 2.5 : 0,
              strokeLinejoin: 'round',
              transition: 'fill .2s ease, stroke .2s ease',
            }}
          />
        );
      })}
      {author && (
        <polyline
          ref={draftRef}
          points=''
          style={{
            display: 'none',
            fill: 'rgba(255,204,102,0.15)',
            stroke: '#ffcc66',
            strokeWidth: 2,
            strokeDasharray: '6 4',
          }}
        />
      )}
    </svg>
  );
}
