// Đổi chất liệu vải cho mesh trong scene POV mà KHÔNG mất ánh sáng bake.
// Texture phòng (ht_living_room.glb) là bake atlas: màu vải gốc × sáng/bóng
// đã nướng sẵn trên UV trải phẳng — thay thẳng bằng texture vải thì mất bóng.
// Nên giữ nguyên map bake và nhân thêm: diffuse *= fabric(uv × repeat) / base,
// với base = màu trung bình (linear) của vải gốc → vải gốc cho ra ≈ bản bake,
// vải khác đổi màu + vân nhưng vẫn giữ đúng sáng/bóng của phòng.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();
const fabricTexture = src => {
  if (!cache.has(src)) {
    const tex = loader.load(src);
    tex.flipY = false; // glTF UV convention
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    cache.set(src, tex);
  }
  return cache.get(src);
};

function fabricMaterial(original) {
  const mat = original.clone();
  mat.userData.fabric = {
    uFabricMap: { value: null },
    uFabricRepeat: { value: 1 },
    uFabricBase: { value: new THREE.Color(1, 1, 1) },
  };
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, mat.userData.fabric);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform sampler2D uFabricMap;
uniform float uFabricRepeat;
uniform vec3 uFabricBase;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
#ifdef USE_MAP
  diffuseColor.rgb *= texture2D(uFabricMap, vMapUv * uFabricRepeat).rgb / uFabricBase;
#endif`
      );
  };
  mat.customProgramCacheKey = () => 'fabric-override';
  return mat;
}

// overrides: [{ nodes: ['Box015', ...], src, repeat, base: [r,g,b] }]
// Material gốc được giữ trong userData để trả lại khi bỏ override.
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
    u.uFabricMap.value = fabricTexture(o.src);
    u.uFabricRepeat.value = o.repeat ?? 1;
    u.uFabricBase.value.setRGB(...(o.base ?? [1, 1, 1]));
  });
}
