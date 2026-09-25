import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import * as THREE from 'three';

// Vùng hover/click bám ĐÚNG hình vật thể (thay cho polygon bao lồi SVG): lấy
// các tam giác của node `zone.mesh` (lọc theo `zone.box` — AABB local — khi
// vật nằm lẫn trong mesh gộp), dựng mesh con world-space để raycast + vẽ viền
// (drei Outlines, inverted hull theo screen space) và lớp phủ khi hover.

const inBox = (v, box) =>
  !box ||
  (v.x >= box[0][0] &&
    v.x <= box[1][0] &&
    v.y >= box[0][1] &&
    v.y <= box[1][1] &&
    v.z >= box[0][2] &&
    v.z <= box[1][2]);

function subsetGeometry(root, name, box) {
  const obj = root.getObjectByName(name);
  if (!obj) {
    console.warn('[MeshZone] mesh not found:', name);
    return null;
  }
  obj.updateWorldMatrix(true, true);
  const out = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  obj.traverse(o => {
    const g = o.isMesh && o.geometry;
    if (!g) return;
    const pos = g.attributes.position;
    const idx = g.index;
    const tri = idx ? idx.count / 3 : pos.count / 3;
    for (let t = 0; t < tri; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3;
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, i0);
      b.fromBufferAttribute(pos, i1);
      c.fromBufferAttribute(pos, i2);
      if (!inBox(a, box) || !inBox(b, box) || !inBox(c, box)) continue;
      for (const v of [a, b, c]) {
        v.applyMatrix4(o.matrixWorld);
        out.push(v.x, v.y, v.z);
      }
    }
  });
  if (!out.length) return null;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  geom.computeVertexNormals();
  return geom;
}

const _rc = new THREE.Raycaster();

export default function MeshZone({ scene, zone, onOpen, color = '#ffcc66' }) {
  const geometry = useMemo(
    () => subsetGeometry(scene, zone.mesh, zone.box),
    [scene, zone.mesh, zone.box]
  );
  const [hover, setHover] = useState(false);
  const fill = useRef();

  // Chỉ nhận hover khi vật KHÔNG bị che: R3F chỉ raycast object có handler,
  // nên tự raycast cả scene POV và so khoảng cách (mesh con trùng mặt với mesh
  // gốc → cho sai số 2cm).
  const visibleHit = e => {
    _rc.set(e.ray.origin, e.ray.direction);
    const first = _rc.intersectObject(scene, true)[0];
    return !first || first.distance >= e.distance - 0.02;
  };

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);

  // Lớp phủ thở nhẹ khi hover.
  useFrame(({ clock }) => {
    if (fill.current)
      fill.current.opacity = hover
        ? 0.14 + Math.sin(clock.elapsedTime * 3) * 0.04
        : 0;
  });

  if (!geometry) return null;
  return (
    <mesh
      geometry={geometry}
      renderOrder={2}
      onPointerMove={e => {
        const ok = visibleHit(e);
        if (ok) e.stopPropagation();
        setHover(ok);
      }}
      onPointerOut={() => setHover(false)}
      onClick={e => {
        if (!visibleHit(e)) return;
        e.stopPropagation();
        onOpen(zone);
      }}
    >
      <meshBasicMaterial
        ref={fill}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
        toneMapped={false}
      />
      {hover && (
        <Outlines
          // drei 9.122 Outlines đảo nhánh: screenspace=false mới là độ dày theo
          // PIXEL (screenspace=true lại cộng theo mét world).
          screenspace={false}
          thickness={2.5}
          color={color}
          angle={Math.PI}
          toneMapped={false}
        />
      )}
    </mesh>
  );
}
