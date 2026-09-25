// Đổi chất liệu vải cho mesh trong scene POV mà KHÔNG mất ánh sáng bake.
// Texture phòng (ht_living_room.glb, ff_pov.glb) là bake atlas: màu vải gốc ×
// sáng/bóng đã nướng sẵn trên UV trải phẳng — thay thẳng bằng texture vải thì
// mất bóng. Nên giữ nguyên map bake và nhân thêm: diffuse *= fabric(uv ×
// repeat) / base, với base = màu trung bình (linear) của vải gốc → vải gốc cho
// ra ≈ bản bake, vải khác đổi màu + vân nhưng vẫn giữ đúng sáng/bóng.
//
// Mesh gộp nhiều đồ vật (vd. ff_split-002_wall-002 chứa cả tường + ghế bành):
// `box` giới hạn vùng đổi vải, `hide` giấu hẳn một vùng (discard) để đặt model
// khác vào chỗ đó. Cả hai là AABB trong toạ độ LOCAL của mesh (attribute
// position, trước modelMatrix) — file tách riêng giữ cùng node transform nên
// dùng chung được hộp giữa scene và popup.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();
export const fabricTexture = src => {
  if (!cache.has(src)) {
    const tex = loader.load(src);
    tex.flipY = false; // glTF UV convention
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    cache.set(src, tex);
  }
  return cache.get(src);
};

const BIG = 1e9;
const setBox = (u, box) => {
  u.min.value.set(...(box?.[0] ?? [-BIG, -BIG, -BIG]));
  u.max.value.set(...(box?.[1] ?? [BIG, BIG, BIG]));
};

function fabricMaterial(original) {
  const mat = original.clone();
  mat.userData.fabric = {
    uFabricOn: { value: 0 },
    uFabricMap: { value: null },
    uFabricRepeat: { value: 1 },
    uFabricBase: { value: new THREE.Color(1, 1, 1) },
    uFabricBoxMin: { value: new THREE.Vector3() },
    uFabricBoxMax: { value: new THREE.Vector3() },
    uHideOn: { value: 0 },
    uHideBoxMin: { value: new THREE.Vector3() },
    uHideBoxMax: { value: new THREE.Vector3() },
  };
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, mat.userData.fabric);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vFabricLocal;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vFabricLocal = transformed;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vFabricLocal;
uniform float uFabricOn;
uniform sampler2D uFabricMap;
uniform float uFabricRepeat;
uniform vec3 uFabricBase;
uniform vec3 uFabricBoxMin;
uniform vec3 uFabricBoxMax;
uniform float uHideOn;
uniform vec3 uHideBoxMin;
uniform vec3 uHideBoxMax;
bool fabricInBox(vec3 p, vec3 mn, vec3 mx) {
  return all(greaterThanEqual(p, mn)) && all(lessThanEqual(p, mx));
}`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (uHideOn > 0.5 && fabricInBox(vFabricLocal, uHideBoxMin, uHideBoxMax)) discard;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
#ifdef USE_MAP
  if (uFabricOn > 0.5 && fabricInBox(vFabricLocal, uFabricBoxMin, uFabricBoxMax))
    diffuseColor.rgb *= texture2D(uFabricMap, vMapUv * uFabricRepeat).rgb / uFabricBase;
#endif`
      );
  };
  mat.customProgramCacheKey = () => 'fabric-override-v2';
  return mat;
}

// overrides: [{ nodes: ['Box015', ...], src?, repeat, base: [r,g,b],
//               box?: [[x,y,z],[x,y,z]], hide?: [[x,y,z],[x,y,z]] }]
// src → đổi vải (trong `box` nếu có); hide → giấu vùng đó. Material gốc được
// giữ trong userData để trả lại khi bỏ override.
export function applyFabricOverrides(scene, overrides) {
  const byNode = new Map();
  (overrides ?? []).forEach(o => o.nodes.forEach(n => byNode.set(n, o)));
  scene.traverse(obj => {
    if (!obj.isMesh) return;
    const o = byNode.get(obj.name) ?? byNode.get(obj.parent?.name);
    if (!o) {
      if (obj.userData.fabricOriginal) {
        obj.material = obj.userData.fabricOriginal;
        delete obj.userData.fabricOriginal;
      }
      return;
    }
    if (!obj.userData.fabricOriginal) {
      obj.userData.fabricOriginal = obj.material;
      obj.material = fabricMaterial(obj.material);
    }
    const u = obj.material.userData.fabric;
    u.uFabricOn.value = o.src ? 1 : 0;
    if (o.src) u.uFabricMap.value = fabricTexture(o.src);
    u.uFabricRepeat.value = o.repeat ?? 1;
    u.uFabricBase.value.setRGB(...(o.base ?? [1, 1, 1]));
    setBox({ min: u.uFabricBoxMin, max: u.uFabricBoxMax }, o.box);
    u.uHideOn.value = o.hide ? 1 : 0;
    setBox({ min: u.uHideBoxMin, max: u.uHideBoxMax }, o.hide);
  });
}
