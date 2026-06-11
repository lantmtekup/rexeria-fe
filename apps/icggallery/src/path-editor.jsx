// Camera Path Editor — bật bằng query ?patheditor trên URL.
// Cho phép chỉnh waypoint (POS = vị trí camera, TGT = điểm nhìn) ngay trên UI,
// camera scrub theo draft tức thì. "Copy JSON" → gửi dev bake vào camera_paths.glb
// (scripts/make-ht-camera-path.mjs). Draft lưu localStorage theo floor.
import { useEffect, useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Seed khớp scripts/make-ht-camera-path.mjs (v8 — anchor đo từ hình học:
// lan can z=-53.25 đỉnh y=7.0, cột ghế x=58/60.9, bar tường phải x=62.5).
export const PATH_SEEDS = {
  'home-theatre': {
    pos: [
      [59.45, 7.2, -52.7],
      [59.45, 7.2, -54.3],
      [59.45, 7.2, -55.2],
      [60.2, 7.2, -55.9],
      [60.5, 7.2, -56.4],
      [60.4, 7.2, -56.6],
      [58.6, 7.2, -55.6],
      [57.4, 7.2, -55.0],
    ],
    tgt: [
      [59.45, 7.0, -59.5],
      [59.45, 7.0, -59.5],
      [59.0, 6.95, -59.5],
      [58.0, 6.9, -59.3],
      [62.3, 7.0, -56.5],
      [62.5, 7.4, -53.5],
      [62.5, 7.6, -52.5],
      [62.4, 7.6, -52.2],
    ],
  },
};

const storeKey = floor => `pathdraft:${floor}`;
const seedOf = floor =>
  PATH_SEEDS[floor] ? JSON.parse(JSON.stringify(PATH_SEEDS[floor])) : null;

export function usePathDraft(floor, enabled) {
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    if (!enabled) {
      setDraft(null);
      return;
    }
    try {
      const saved = localStorage.getItem(storeKey(floor));
      if (saved) {
        setDraft(JSON.parse(saved));
        return;
      }
    } catch {
      /* hỏng thì reseed */
    }
    setDraft(seedOf(floor));
  }, [floor, enabled]);
  useEffect(() => {
    if (draft)
      try {
        localStorage.setItem(storeKey(floor), JSON.stringify(draft));
      } catch {
        /* quota */
      }
  }, [floor, draft]);
  return [draft, setDraft];
}

// Cùng công thức với make-ht-camera-path.mjs: CatmullRom centripetal + lookAt.
export function buildDraftRig(draft) {
  const v3 = a => new THREE.Vector3(...a);
  const posCurve = new THREE.CatmullRomCurve3(
    draft.pos.map(v3),
    false,
    'centripetal'
  );
  const tgtCurve = new THREE.CatmullRomCurve3(
    draft.tgt.map(v3),
    false,
    'centripetal'
  );
  const m = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const g = new THREE.Vector3();
  return {
    posCurve,
    getPose(t, outPos, outQuat) {
      posCurve.getPoint(t, p);
      tgtCurve.getPoint(t, g);
      m.lookAt(p, g, up);
      outPos.copy(p);
      outQuat.setFromRotationMatrix(m);
    },
  };
}

// Đường path + chấm waypoint render trong scene (xanh = POS, cam = TGT).
export function PathMarkers({ draft }) {
  const linePts = useMemo(
    () => buildDraftRig(draft).posCurve.getPoints(80),
    [draft]
  );
  return (
    <group>
      <Line points={linePts} color='#2a7fff' lineWidth={2} />
      {draft.pos.map((a, i) => (
        <mesh key={`p${i}`} position={a}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color='#2a7fff' depthTest={false} />
        </mesh>
      ))}
      {draft.tgt.map((a, i) => (
        <mesh key={`t${i}`} position={a}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color='#ff8c2a' depthTest={false} />
        </mesh>
      ))}
    </group>
  );
}

function Row({ kind, i, pt, onChange, onRemove, removable }) {
  return (
    <div className='flex items-center gap-1'>
      <span className='w-5 text-right opacity-50'>{i}</span>
      {[0, 1, 2].map(ax => (
        <input
          key={ax}
          type='number'
          step='0.1'
          value={pt[ax]}
          aria-label={`${kind} ${i} ${'xyz'[ax]}`}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (Number.isFinite(v)) onChange(kind, i, ax, v);
          }}
          className='w-[64px] rounded bg-white/10 px-1.5 py-0.5 text-right text-white outline-none focus:bg-white/20'
        />
      ))}
      <button
        type='button'
        aria-label={`Xoá điểm ${i}`}
        disabled={!removable}
        onClick={() => onRemove(kind, i)}
        className='px-1 opacity-50 hover:opacity-100 disabled:opacity-15'
      >
        ✕
      </button>
    </div>
  );
}

export function PathEditorPanel({ floor, draft, setDraft, progressRef }) {
  const [t, setT] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setT(progressRef.current ?? 0), 120);
    return () => clearInterval(id);
  }, [progressRef]);
  if (!draft) return null;

  const update = (kind, i, ax, v) =>
    setDraft(d => {
      const next = structuredClone(d);
      next[kind][i][ax] = v;
      return next;
    });
  const remove = (kind, i) =>
    setDraft(d => {
      const next = structuredClone(d);
      next[kind].splice(i, 1);
      return next;
    });
  const append = kind =>
    setDraft(d => {
      const next = structuredClone(d);
      next[kind].push([...next[kind][next[kind].length - 1]]);
      return next;
    });
  const copy = () => {
    navigator.clipboard
      .writeText(JSON.stringify({ floor, ...draft }))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
  };
  const reset = () => {
    localStorage.removeItem(storeKey(floor));
    setDraft(seedOf(floor));
  };

  const section = (kind, label, color) => (
    <div>
      <div className='mt-2 mb-1 flex items-center justify-between'>
        <span
          style={{ color }}
          className='text-[10px] tracking-[0.18em] uppercase'
        >
          {label}
        </span>
        <button
          type='button'
          onClick={() => append(kind)}
          className='opacity-60 hover:opacity-100'
        >
          + điểm
        </button>
      </div>
      <div className='space-y-0.5'>
        {draft[kind].map((pt, i) => (
          <Row
            key={i}
            kind={kind}
            i={i}
            pt={pt}
            onChange={update}
            onRemove={remove}
            removable={draft[kind].length > 2}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className='pointer-events-auto fixed top-16 left-4 z-30 max-h-[78vh] w-[280px] overflow-y-auto rounded-xl bg-black/75 p-3 font-mono text-[11px] text-white backdrop-blur'>
      <div className='flex items-center justify-between'>
        <span className='text-[10px] tracking-[0.2em] uppercase opacity-70'>
          Path Editor
        </span>
        <span className='tabular-nums opacity-70'>
          scroll {(t * 100).toFixed(0)}%
        </span>
      </div>
      {section('pos', 'Vị trí camera (xanh)', '#7ab3ff')}
      {section('tgt', 'Điểm nhìn (cam)', '#ffb37a')}
      <div className='mt-3 flex gap-2'>
        <button
          type='button'
          onClick={copy}
          className='flex-1 rounded bg-white/15 py-1.5 hover:bg-white/25'
        >
          {copied ? '✓ Đã copy' : 'Copy JSON'}
        </button>
        <button
          type='button'
          onClick={reset}
          className='rounded bg-white/10 px-3 py-1.5 hover:bg-white/20'
        >
          Reset
        </button>
      </div>
      <p className='mt-2 leading-snug opacity-50'>
        Sửa số → camera cập nhật ngay khi scroll. Xong bấm Copy JSON gửi dev để
        bake vào file path.
      </p>
    </div>
  );
}
