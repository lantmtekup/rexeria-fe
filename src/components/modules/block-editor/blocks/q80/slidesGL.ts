/**
 * Engine gl-slides cho `q80_experience` — canvas WebGL thứ 2 hiển thị ảnh
 * suite fullscreen và chuyển slide bằng shader wipe dọc.
 *
 * Fragment shader TRÍCH NGUYÊN LOGIC bản gốc (vendor 2_41x0yF.js ~36280):
 * fullscreen triangle, uvCover, directedProgress, offset parallax dọc −0.5,
 * mask = step(directedProgress, vUv.y), mix(texture2, texture1, mask).
 * (Bỏ nhánh distort theo depth-map u_map — bản mirror không có depth map,
 * strength gốc rất nhỏ.)
 */
import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_Position = vec4(position, 1.0);
    vUv = uv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D u_texture1;
  uniform sampler2D u_texture2;
  uniform float u_progress;
  uniform vec2 u_size;
  uniform vec2 u_res;
  uniform int u_direction;
  varying vec2 vUv;

  vec2 uvCover(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    vec2 newSize = screenRatio < imageRatio
      ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
      : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
    vec2 newOffset = (screenRatio < imageRatio
      ? vec2((newSize.x - screenSize.x) / 2.0, 0.0)
      : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
  }

  void main() {
    float parallax = -0.5;
    float directedProgress = u_direction == 1 ? u_progress : 1.0 - u_progress;
    vec2 offset1 = vec2(0.0, directedProgress * parallax);
    vec2 offset2 = vec2(0.0, (directedProgress - 1.0) * parallax);
    vec2 cUv = uvCover(u_res, u_size, vUv);
    vec4 texture1 = texture2D(u_texture1, cUv + offset1);
    vec4 texture2 = texture2D(u_texture2, cUv + offset2);
    float mask = step(directedProgress, vUv.y);
    gl_FragColor = mix(texture2, texture1, mask);
  }
`;

export interface Q80Slides {
  /**
   * Đặt cặp slide + tiến trình wipe. `from`/`to` là index trong mảng ảnh
   * (−1 = trong suốt / không có gì). progress 0 = thấy `from`, 1 = thấy `to`.
   */
  setTransition(from: number, to: number, progress: number): void;
  /** Alpha toàn canvas (fade slide đi khi qua contact). */
  setAlpha(a: number): void;
  resize(w: number, h: number): void;
  render(): void;
  dispose(): void;
}

export async function createQ80Slides(
  canvas: HTMLCanvasElement,
  imageUrls: string[]
): Promise<Q80Slides> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();

  // Texture trống cho index −1
  const blank = new THREE.Texture();
  const loader = new THREE.TextureLoader();
  const textures = await Promise.all(
    imageUrls.map(
      u =>
        new Promise<THREE.Texture>(resolve => {
          loader.load(
            u,
            t => {
              t.colorSpace = THREE.SRGBColorSpace;
              resolve(t);
            },
            undefined,
            () => resolve(blank)
          );
        })
    )
  );

  const size = (() => {
    const img = textures[0]?.image as
      | {
          naturalWidth?: number;
          width?: number;
          naturalHeight?: number;
          height?: number;
        }
      | undefined;
    return new THREE.Vector2(
      img?.naturalWidth || img?.width || 3000,
      img?.naturalHeight || img?.height || 1900
    );
  })();

  // Fullscreen triangle như gốc
  const geom = new THREE.BufferGeometry();
  geom.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
      3
    )
  );
  geom.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2)
  );

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    uniforms: {
      u_texture1: { value: blank },
      u_texture2: { value: blank },
      u_progress: { value: 0 },
      u_size: { value: size },
      u_res: { value: new THREE.Vector2(canvas.width, canvas.height) },
      u_direction: { value: 1 },
    },
  });
  scene.add(new THREE.Mesh(geom, mat));

  let alpha = 1;

  const texOf = (i: number) => (i >= 0 && textures[i] ? textures[i] : blank);

  return {
    setTransition(from, to, progress) {
      mat.uniforms.u_texture1.value = texOf(from);
      mat.uniforms.u_texture2.value = texOf(to);
      // gốc: direction 1 = cuộn xuống (slide mới trượt từ dưới lên)
      mat.uniforms.u_direction.value = 1;
      mat.uniforms.u_progress.value = THREE.MathUtils.clamp(progress, 0, 1);
    },
    setAlpha(a) {
      alpha = THREE.MathUtils.clamp(a, 0, 1);
      canvas.style.opacity = String(alpha);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      (mat.uniforms.u_res.value as THREE.Vector2).set(w, h);
    },
    render() {
      if (alpha <= 0.001) return;
      renderer.render(scene, camera);
    },
    dispose() {
      geom.dispose();
      mat.dispose();
      for (const t of textures) t.dispose();
      renderer.dispose();
    },
  };
}
