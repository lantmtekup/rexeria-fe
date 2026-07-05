/**
 * Engine cảnh 3D cho block `q80_experience` — three.js thuần (KHÔNG r3f).
 *
 * Tái dựng cảnh WebGL của quadplex80.com với thông số ĐO TRỰC TIẾP từ bundle
 * gốc (vendor 2_41x0yF.js, đã beautify — xem claudedocs playbook):
 *  - Camera PerspectiveCamera(45°, near .1, far 1000); CLOUDS z=-700 → CITY
 *    z=-20, luôn lookAt (0, 0, camera.z + 40).
 *  - Tòa 111W57: GLB scale 7.66, pos (-0.21, -9.5, 8.21), rotY -0.4916.
 *  - 5 lớp mây billboard layer0..4 + 4 tòa lân cận building0..3new + 3 đám mây
 *    intro + ~200 sprite Cloud-tint instanced fade theo khoảng cách camera.
 *  - Lens flare 7 element (flare-1/2.jpg, màu 0xFCF2ED/0xD9D1C1), alpha theo
 *    tiến trình vào CITY.
 *  - HDR UltraHDR jpg làm background + environment.
 *  - Press&hold ZOOM: pos → (0, -2.75, -0.895), lookAt (0, 3.5, 8.21).
 *
 * Import động từ component (three vào async chunk riêng, không phình bundle /p).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';
import {
  Lensflare,
  LensflareElement,
} from 'three/examples/jsm/objects/Lensflare.js';

export interface Q80SceneAssets {
  glbUrl: string;
  hdrUrl: string;
  cloudTintUrl: string;
  introCloudUrl: string;
  layerUrls: string[];
  buildingUrls: string[];
  flare1Url: string;
  flare2Url: string;
}

export interface Q80Scene {
  /** 0..1: bay từ trong mây (z −700) tới city (z −20). */
  setScroll(p: number): void;
  /** Chuột chuẩn hoá −1..1 (parallax khi ở CITY). */
  setPointer(x: number, y: number): void;
  /** 0..1: press & hold zoom về phía ban công tháp. */
  setZoom(t: number): void;
  resize(w: number, h: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

// ── Thông số đo từ bundle gốc ────────────────────────────────────────────
const CAM_FOV = 45;
const CAM_FAR = 1000;
const Z_CLOUDS = -700;
const Z_CITY = -20;
const LOOKAT_AHEAD = 40;
const MOUSE_FORCE_X = 1.4;
const MOUSE_FORCE_Y = 0.8;
const REACTIVENESS = 3;

const TOWER = {
  scale: 7.66,
  pos: [-0.21, -9.5, 8.21] as const,
  rotY: -0.491592653589793,
};

const LAYERS = [
  { pos: [0, -4.93, 0], scale: 7.25, order: 0 },
  { pos: [0, -7.11, 4.96], scale: 12, order: -1 },
  { pos: [0, -10, 10.39], scale: 14, order: -3 },
  { pos: [0, -10.41, 18.54], scale: 28.95, order: -4 },
  { pos: [3.25, 1.15, 24.09], scale: 70.1, order: -10 },
] as const;

const BUILDINGS = [
  { pos: [20, -5.65, 17.28], scale: 7.46, order: -4 },
  { pos: [7.44, -4.61, 5.5], scale: 8.77, order: -3 },
  { pos: [-9.84, -3.56, 18.59], scale: 10.08, order: -8 },
  { pos: [-20.52, -3.56, 23.82], scale: 5.5, order: -5 },
] as const;

const INTRO_CLOUDS = [
  { pos: [-32.45, -8.9, 42.41], rotZ: -0.1, scale: 31.02, order: -11 },
  { pos: [-50, -12.82, 26.71], rotZ: -0.1, scale: 50, order: -17 },
  { pos: [26.44, -6.6, 21.47], rotZ: 0.03, scale: 27.1, order: -6 },
] as const;

// Zoom press&hold (từ transitionToZoom gốc: ((it.y+12-8)*.5, (it.z-10)*.5)).
const ZOOM_POS = new THREE.Vector3(0, -2.75, -0.895);
const ZOOM_LOOKAT = new THREE.Vector3(0, 3.5, 8.21);

/** RNG seeded (mulberry32) — sprite mây rải cùng vị trí mỗi lần load, như gốc seed 7059401. */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPRITE_COUNT = 200;

export async function createQ80Scene(
  canvas: HTMLCanvasElement,
  assets: Q80SceneAssets,
  onProgress?: (loaded: number, total: number) => void
): Promise<Q80Scene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, CAM_FAR);
  camera.position.set(0, 0, Z_CLOUDS);

  // ── Loader chung + đếm tiến trình cho thanh loading của gate ──
  const total =
    1 /*glb*/ +
    1 /*hdr*/ +
    assets.layerUrls.length +
    assets.buildingUrls.length +
    3; /*introCloud + tint + flare(2 gộp 1 nhịp)*/
  let loaded = 0;
  const tick = () => {
    loaded += 1;
    onProgress?.(loaded, total);
  };

  const texLoader = new THREE.TextureLoader();
  const loadTex = (url: string) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      texLoader.load(
        url,
        t => {
          t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        },
        undefined,
        reject
      );
    });

  const disposables: { dispose(): void }[] = [renderer];
  const track = <T extends { dispose(): void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  // ── HDR background/environment ──
  const hdrPromise = new Promise<void>(resolve => {
    const hdrLoader = new UltraHDRLoader();
    hdrLoader.load(
      assets.hdrUrl,
      tex => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = tex;
        scene.environment = tex;
        track(tex);
        tick();
        resolve();
      },
      undefined,
      () => {
        // fallback: nền trời xanh nhạt như tông gốc
        scene.background = new THREE.Color('#bfd3e4');
        tick();
        resolve();
      }
    );
  });

  const plane = new THREE.PlaneGeometry(1, 1);
  track(plane);

  const addBillboard = (
    tex: THREE.Texture,
    cfg: {
      pos: readonly [number, number, number] | number[];
      scale: number;
      order: number;
      rotZ?: number;
      rotY?: number;
      depthWrite?: boolean;
    }
  ) => {
    const ratio =
      (tex.image as { width: number; height: number }).width /
      (tex.image as { width: number; height: number }).height;
    const mat = track(
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: cfg.depthWrite ?? false,
        alphaTest: 0.01,
      })
    );
    const mesh = new THREE.Mesh(plane, mat);
    mesh.scale.set(ratio * cfg.scale, cfg.scale, cfg.scale);
    mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    if (cfg.rotZ) mesh.rotation.z = cfg.rotZ;
    if (cfg.rotY !== undefined) mesh.rotation.y = cfg.rotY;
    mesh.renderOrder = cfg.order;
    scene.add(mesh);
    track(tex);
    return mesh;
  };

  // ── Layer clouds (5 dải mây chính quanh chân tháp) ──
  const layerPromises = assets.layerUrls.map(async (url, i) => {
    const cfg = LAYERS[Math.min(i, LAYERS.length - 1)];
    const tex = await loadTex(url);
    addBillboard(tex, cfg);
    tick();
  });

  // ── Buildings lân cận (rotY π như gốc — texture vẽ mặt sau) ──
  const buildingPromises = assets.buildingUrls.map(async (url, i) => {
    const cfg = BUILDINGS[Math.min(i, BUILDINGS.length - 1)];
    const tex = await loadTex(url);
    addBillboard(tex, { ...cfg, rotY: Math.PI });
    tick();
  });

  // ── Intro clouds (3 đám lớn camera bay xuyên qua) ──
  const introPromise = (async () => {
    const tex = await loadTex(assets.introCloudUrl);
    for (const cfg of INTRO_CLOUDS) addBillboard(tex, cfg);
    tick();
  })();

  // ── Sprite mây instanced (bay xuyên khi intro; fade theo khoảng cách) ──
  let sprites: THREE.InstancedMesh | null = null;
  let spriteMat: THREE.ShaderMaterial | null = null;
  const spritePromise = (async () => {
    const tex = await loadTex(assets.cloudTintUrl);
    const rng = seededRandom(7059401);
    const ratio =
      (tex.image as { width: number }).width /
      (tex.image as { height: number }).height;
    spriteMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: tex },
          uCamZ: { value: Z_CLOUDS },
        },
        vertexShader: /* glsl */ `
          attribute float aSeed;
          uniform float uCamZ;
          varying vec2 vUv;
          varying float vAlpha;
          void main() {
            vUv = uv;
            vec4 world = instanceMatrix * vec4(position, 1.0);
            // fade theo khoảng cách z tới camera: rõ ở 30..220, mất ở <12 (bay xuyên)
            float d = abs(world.z - uCamZ);
            float far = 1.0 - smoothstep(220.0, 420.0, d);
            float near = smoothstep(8.0, 36.0, d);
            vAlpha = far * near * (0.45 + 0.4 * aSeed);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          varying vec2 vUv;
          varying float vAlpha;
          void main() {
            vec4 c = texture2D(uMap, vUv);
            // đẩy sáng về trắng như material gốc (color 0xF3F1F6 trên nền HDR)
            vec3 col = mix(c.rgb, vec3(1.0), 0.35);
            gl_FragColor = vec4(col, c.a * vAlpha);
            if (gl_FragColor.a < 0.01) discard;
          }
        `,
      })
    );
    sprites = new THREE.InstancedMesh(plane, spriteMat, SPRITE_COUNT);
    const seeds = new Float32Array(SPRITE_COUNT);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < SPRITE_COUNT; i++) {
      // spawns gốc: scale 80±15, x ±900, y ±10 offsetY 38 (deck dưới tầm mắt);
      // giữ tỉ lệ ngang/dọc của texture (981×339) để mây dẹt như gốc.
      const scale = 80 + (rng() - 0.5) * 2 * 15;
      p.set(
        (rng() - 0.5) * 2 * 900,
        (rng() - 0.5) * 2 * 10 - 52,
        Z_CLOUDS + rng() * (300 - Z_CLOUDS)
      );
      s.set(scale * ratio * 0.55, scale * 0.55, scale * 0.55);
      m.compose(p, q, s);
      sprites.setMatrixAt(i, m);
      seeds[i] = rng();
    }
    sprites.geometry = plane;
    (sprites.geometry as THREE.BufferGeometry).setAttribute(
      'aSeed',
      new THREE.InstancedBufferAttribute(seeds, 1)
    );
    sprites.renderOrder = 50;
    sprites.frustumCulled = false;
    scene.add(sprites);
    tick();
  })();

  // ── Tòa 111W57 (GLB) ──
  const gltfPromise = (async () => {
    const gltf = await new GLTFLoader().loadAsync(assets.glbUrl);
    gltf.scene.scale.setScalar(TOWER.scale);
    gltf.scene.position.set(TOWER.pos[0], TOWER.pos[1], TOWER.pos[2]);
    gltf.scene.rotation.y = TOWER.rotY;
    scene.add(gltf.scene);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    tick();
  })();

  // ── Lens flare (7 element như gốc, alpha theo tiến trình vào city) ──
  let flare: Lensflare | null = null;
  let flareLight: THREE.PointLight | null = null;
  const flarePromise = (async () => {
    const [f1, f2] = await Promise.all([
      loadTex(assets.flare1Url),
      loadTex(assets.flare2Url),
    ]);
    flareLight = new THREE.PointLight(0xfcf2ed, 0, 0);
    flareLight.position.set(20, 12, -50);
    flare = new Lensflare();
    const c1 = new THREE.Color(0xfcf2ed);
    const c2 = new THREE.Color(0xd9d1c1);
    flare.addElement(new LensflareElement(f1, 0, 0, c1));
    flare.addElement(new LensflareElement(f2, 440, 0.1, c1));
    flare.addElement(new LensflareElement(f1, 60, 0.34, c1));
    flare.addElement(new LensflareElement(f1, 90, 0.22, c1));
    flare.addElement(new LensflareElement(f1, 500, 0.5, c2));
    flare.addElement(new LensflareElement(f1, 180, 0.68, c1));
    flare.addElement(new LensflareElement(f1, 120, 0.74, c1));
    flareLight.add(flare);
    flare.visible = false;
    scene.add(flareLight);
    track(f1);
    track(f2);
    tick();
  })();

  await Promise.all([
    hdrPromise,
    ...layerPromises,
    ...buildingPromises,
    introPromise,
    spritePromise,
    gltfPromise,
    flarePromise,
  ]);

  // ── Trạng thái runtime ──
  let scroll = 0; // 0 clouds → 1 city
  let zoom = 0; // press & hold
  const mouse = { x: 0, y: 0 };
  let mouseEffect = 0;
  let raf = 0;
  let running = false;
  let lastT = 0;
  const basePos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const zoomedPos = new THREE.Vector3();
  const zoomedLook = new THREE.Vector3();

  const render = (t: number) => {
    if (!running) return;
    raf = requestAnimationFrame(render);
    const dt = Math.min((t - lastT) / 1000 || 0.016, 0.2);
    lastT = t;

    const z = THREE.MathUtils.lerp(Z_CLOUDS, Z_CITY, scroll);
    // Parallax chuột chỉ khi đã vào city (mouseEffect ramp như gốc ±dt*3)
    mouseEffect = THREE.MathUtils.clamp(
      mouseEffect + (scroll > 0.97 ? 1 : -1) * dt * 3,
      0,
      1
    );
    const k = Math.min(dt * REACTIVENESS, 0.5);
    basePos.x =
      ((1 - k) * basePos.x + k * mouse.x * MOUSE_FORCE_X) * mouseEffect;
    basePos.y =
      ((1 - k) * basePos.y + k * mouse.y * MOUSE_FORCE_Y) * mouseEffect;
    basePos.z = z;
    lookAt.set(0, 0, z + LOOKAT_AHEAD);

    if (zoom > 0.001) {
      zoomedPos.copy(basePos).lerp(ZOOM_POS, zoom);
      zoomedLook.copy(lookAt).lerp(ZOOM_LOOKAT, zoom);
      camera.position.copy(zoomedPos);
      camera.lookAt(zoomedLook);
    } else {
      camera.position.copy(basePos);
      camera.lookAt(lookAt);
    }

    if (spriteMat) spriteMat.uniforms.uCamZ.value = camera.position.z;
    if (flare && flareLight) {
      // flare chỉ hiện khi gần tới city (gốc: alpha lerp theo scrollProgress)
      flare.visible = scroll > 0.82;
    }
    renderer.render(scene, camera);
  };

  return {
    setScroll(p) {
      scroll = THREE.MathUtils.clamp(p, 0, 1);
    },
    setPointer(x, y) {
      mouse.x = x;
      mouse.y = y;
    },
    setZoom(t) {
      zoom = THREE.MathUtils.clamp(t, 0, 1);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    start() {
      if (running) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
      });
      for (const d of disposables) d.dispose();
    },
  };
}
