import { useEffect, useMemo, useState } from 'react';
import { createPortal } from '@react-three/fiber';
import { useGLTF, Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { DRACO } from './floors.js';
import { fabricTexture } from './fabricOverride.js';

// Model nội thất đặt vào scene POV thay cho đồ gốc (đồ gốc bị giấu bằng
// `hide` trong fabricOverride.js). Material tên `material` đổi map sang vải đã
// chọn, giữ wrap/repeat của map gốc.
export default function PlacedModel({
  src,
  material,
  fabricSrc,
  position,
  rotationY = 0,
  zone,
  onOpen,
}) {
  const [hover, setHover] = useState(false);
  const { scene } = useGLTF(src, DRACO);
  const root = useMemo(() => {
    const r = scene.clone(true);
    r.traverse(o => {
      if (o.isMesh && o.material?.name === material) {
        const base = o.material.map;
        o.material = o.material.clone();
        o.userData.baseMap = base;
      }
    });
    // Node trong GLB có thể mang offset từ file gốc (Armchair.fbx lệch
    // 3.46, 0, -2.26) → dời để tâm đáy model về gốc, `position` = điểm đặt.
    const box = new THREE.Box3().setFromObject(r);
    const c = box.getCenter(new THREE.Vector3());
    r.position.set(-c.x, -box.min.y, -c.z);
    return r;
  }, [scene, material]);

  useEffect(() => {
    if (!fabricSrc) return;
    root.traverse(o => {
      if (!o.isMesh || o.material?.name !== material) return;
      const tex = fabricTexture(fabricSrc);
      const base = o.userData.baseMap;
      if (base) {
        tex.repeat.copy(base.repeat);
        tex.offset.copy(base.offset);
        tex.channel = base.channel;
      }
      o.material.map = tex;
      o.material.needsUpdate = true;
    });
  }, [root, material, fabricSrc]);

  // Model thay thế nhận hover/click thay cho vùng gốc (MeshZone) — viền bám
  // từng mesh bằng Outlines portal vào mesh đó.
  const meshes = useMemo(() => {
    const out = [];
    root.traverse(o => o.isMesh && out.push(o));
    return out;
  }, [root]);
  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);

  return (
    <>
      <group position={position} rotation={[0, rotationY, 0]}>
        <primitive
          object={root}
          onPointerMove={
            zone
              ? e => {
                  e.stopPropagation();
                  setHover(true);
                }
              : undefined
          }
          onPointerOut={zone ? () => setHover(false) : undefined}
          onClick={
            zone
              ? e => {
                  e.stopPropagation();
                  onOpen?.(zone);
                }
              : undefined
          }
        />
      </group>
      {hover &&
        meshes.map(m =>
          createPortal(
            <Outlines
              key={m.uuid}
              // drei 9.122 Outlines đảo nhánh: screenspace=false mới là độ dày theo
              // PIXEL (screenspace=true lại cộng theo mét world).
              screenspace={false}
              thickness={2.5}
              color='#ffcc66'
              angle={Math.PI}
              toneMapped={false}
            />,
            m
          )
        )}
    </>
  );
}
