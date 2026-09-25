import { useEffect, useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useProgress, OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { DRACO } from './floors.js';
import { applyFabricOverrides } from './fabricOverride.js';

const DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');

// Standalone furniture model (Draco glTF). Optionally maps a video/image onto
// named meshes (`surfaces`) — e.g. a screen mesh that plays a video, or a frame
// mesh that shows an image. Find mesh names by opening the popup with `?debug`.
const texCache = new Map();
const loadTexture = src => {
  if (!texCache.has(src)) {
    const tex = new THREE.TextureLoader().load(src);
    tex.flipY = false; // glTF UV convention
    tex.colorSpace = THREE.SRGBColorSpace;
    texCache.set(src, tex);
  }
  return texCache.get(src);
};

// Đổi vải: `material` → thay map của material tên đó (model có UV vải thật);
// `fabric` → model tách từ scene bake, nhân vải lên map bake (fabricOverride).
function Model({ url, surfaces, material, fabric, variant }) {
  const { scene } = useGLTF(url, DRACO);
  // Clone so applied textures don't mutate the shared cached glTF.
  const root = useMemo(() => scene.clone(true), [scene]);

  // Materials whose map is swapped by the variant picker — cloned per popup so
  // the cached glTF keeps its original texture. `base` remembers that original
  // map so wrap/repeat/UV channel carry over to the swapped texture.
  const swappable = useMemo(() => {
    if (!material) return [];
    const out = [];
    root.traverse(o => {
      if (!o.isMesh || o.material?.name !== material) return;
      o.material = o.material.clone();
      out.push({ mat: o.material, base: o.material.map });
    });
    if (!out.length)
      console.warn('[Model3DModal] variant material not found:', material);
    return out;
  }, [root, material]);

  useEffect(() => {
    if (fabric && variant)
      applyFabricOverrides(root, [{ ...fabric, src: variant.src }]);
  }, [root, fabric, variant]);

  useEffect(() => {
    if (!variant) return;
    swappable.forEach(({ mat, base }) => {
      const tex = loadTexture(variant.src);
      if (base) {
        tex.wrapS = base.wrapS;
        tex.wrapT = base.wrapT;
        tex.repeat.copy(base.repeat);
        tex.offset.copy(base.offset);
        tex.channel = base.channel;
      }
      tex.needsUpdate = true;
      mat.map = tex;
      mat.needsUpdate = true;
    });
  }, [swappable, variant]);

  useEffect(() => {
    if (DEBUG) {
      const names = [];
      root.traverse(o => o.isMesh && names.push(o.name));
      console.log('[Model3DModal] meshes:', names);
    }
    const videos = [];
    (surfaces ?? []).forEach(s => {
      const mesh = root.getObjectByName(s.mesh);
      if (!mesh || !mesh.isMesh) {
        console.warn('[Model3DModal] surface mesh not found:', s.mesh);
        return;
      }
      let tex;
      if (s.video) {
        const vid = Object.assign(document.createElement('video'), {
          src: s.video,
          crossOrigin: 'anonymous',
          loop: true,
          muted: true,
          playsInline: true,
        });
        vid.play().catch(() => {});
        videos.push(vid);
        tex = new THREE.VideoTexture(vid);
      } else if (s.image) {
        tex = new THREE.TextureLoader().load(s.image);
      }
      if (!tex) return;
      tex.flipY = false; // glTF UV convention
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = mesh.material.clone();
      mat.map = tex;
      mat.emissiveMap = tex; // self-lit so it reads like a screen
      mat.emissive = new THREE.Color(0xffffff);
      mat.emissiveIntensity = s.video ? 1 : 0.5;
      mat.needsUpdate = true;
      mesh.material = mat;
    });
    return () =>
      videos.forEach(v => {
        v.pause();
        v.src = '';
      });
  }, [root, surfaces]);

  return <primitive object={root} />;
}

// Popup that loads a 3D model of a clicked furniture item — drag to orbit,
// scroll to zoom. Opened from Experience when a `clickables` mesh is clicked.
// Tải trước model popup của một tầng (gọi khi vào tầng) → mở popup là có ngay.
export function preloadPopupModels(zones) {
  (zones ?? []).forEach(z => {
    if (z.type !== 'model') return;
    const srcs = [z.src, ...(z.variants?.models ?? []).map(m => m.src)];
    new Set(srcs.filter(Boolean)).forEach(src => useGLTF.preload(src, DRACO));
  });
}

export default function Model3DModal({ data, applied, onApply, onClose }) {
  const { active, progress } = useProgress();
  const options = data.variants?.options ?? [];
  // Mẫu có thể chọn; không khai báo `models` → một mẫu duy nhất = model3d.
  const models = data.variants?.models ?? [
    { id: 'default', src: data.model3d, material: data.variants?.material },
  ];
  // Mở lại popup → chọn sẵn mẫu + chất liệu đang áp dụng trong phòng (nếu có).
  const [modelId, setModelId] = useState(applied?.model ?? models[0].id);
  const [variantId, setVariantId] = useState(applied?.fabric ?? options[0]?.id);
  const model = models.find(m => m.id === modelId) ?? models[0];
  const variant = options.find(o => o.id === variantId);
  const hasModels = !!data.variants?.models;
  const pick = { ...(hasModels && { model: modelId }), fabric: variantId };
  const isApplied =
    !!applied &&
    applied.fabric === pick.fabric &&
    (applied.model ?? null) === (pick.model ?? null);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role='dialog'
      aria-modal='true'
      onClick={onClose}
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-8'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='popup-card relative flex h-[min(88vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#f1ece2] shadow-2xl ring-1 ring-black/5'
      >
        {/* Header */}
        <div className='pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-5'>
          <div>
            {data.eyebrow && (
              <span className='block text-[10px] font-medium tracking-[0.24em] text-neutral-400 uppercase'>
                {data.eyebrow}
              </span>
            )}
            <h2
              className='mt-1 font-serif leading-tight font-light'
              style={{ fontSize: 'clamp(20px,3vw,26px)' }}
            >
              {data.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label='Đóng'
            className='pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-900'
          >
            ✕
          </button>
        </div>

        {/* 3D viewer */}
        <div className='relative min-h-0 flex-1 pt-20'>
          {data.model3d ? (
            <Canvas
              camera={{ fov: 40, position: [2.2, 1.6, 2.8] }}
              dpr={[1, 2]}
              gl={{ antialias: true }}
            >
              <Suspense fallback={null}>
                {/* key: Stage căn giữa + fit camera một lần theo model đầu —
                    đổi mẫu (gốc toạ độ khác nhau) phải dựng lại Stage. */}
                <Stage
                  key={model.src}
                  environment='apartment'
                  intensity={0.45}
                  adjustCamera={1.7}
                  shadows='contact'
                >
                  <Model
                    key={model.src}
                    url={model.src}
                    surfaces={data.surfaces}
                    material={model.material}
                    fabric={model.fabric}
                    variant={variant}
                  />
                </Stage>
              </Suspense>
              <OrbitControls
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.7}
                minDistance={1.2}
                maxDistance={9}
              />
            </Canvas>
          ) : (
            <div className='grid h-full place-items-center px-8 text-center text-sm text-neutral-400'>
              Chưa cấu hình model 3D cho vật này — thêm URL GLB vào{' '}
              <code className='mx-1 rounded bg-black/5 px-1'>
                FURNITURE_MODELS
              </code>{' '}
              trong floors.js.
            </div>
          )}

          {data.model3d && active && (
            <div className='pointer-events-none absolute inset-0 grid place-items-center text-[11px] tracking-[0.24em] text-neutral-400 uppercase'>
              Đang tải model… {Math.round(progress)}%
            </div>
          )}
          {data.model3d && (
            <span className='pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] tracking-wide text-neutral-400'>
              Kéo để xoay · cuộn để zoom
            </span>
          )}
        </div>

        {/* Texture picker — swatch per fabric option, + apply vào phòng */}
        {data.model3d && options.length > 1 && (
          <div className='flex flex-wrap items-center justify-between gap-4 border-t border-black/5 px-5 py-4'>
            <div className='flex flex-col gap-3'>
              {hasModels && (
                <div className='flex flex-col gap-2'>
                  <span className='text-[10px] font-medium tracking-[0.24em] text-neutral-500 uppercase'>
                    {data.variants.modelLabel ?? 'Mẫu'} · {model.label}
                  </span>
                  <div className='flex gap-2'>
                    {models.map(m => (
                      <button
                        key={m.id}
                        type='button'
                        onClick={() => setModelId(m.id)}
                        aria-pressed={m.id === modelId}
                        className={`rounded-full px-3.5 py-1.5 text-[11px] transition-colors duration-200 ${
                          m.id === modelId
                            ? 'bg-neutral-900 text-white'
                            : 'bg-black/5 text-neutral-600 hover:bg-black/10'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className='flex flex-col gap-2'>
                <span className='text-[10px] font-medium tracking-[0.24em] text-neutral-500 uppercase'>
                  {data.variants.label ?? 'Chất liệu'} · {variant?.label}
                </span>
                <div className='flex gap-2.5'>
                  {options.map(o => (
                    <button
                      key={o.id}
                      type='button'
                      onClick={() => setVariantId(o.id)}
                      aria-label={o.label}
                      aria-pressed={o.id === variantId}
                      title={o.label}
                      className={`h-9 w-9 rounded-full bg-cover bg-center shadow-sm transition-all duration-200 hover:scale-110 ${
                        o.id === variantId
                          ? 'ring-2 ring-neutral-900 ring-offset-2 ring-offset-[#f1ece2]'
                          : 'ring-1 ring-black/10'
                      }`}
                      style={{ backgroundImage: `url("${o.src}")` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {onApply && (
              <button
                type='button'
                onClick={() => onApply(pick)}
                disabled={isApplied}
                className='rounded-full bg-neutral-900 px-6 py-2.5 text-[11px] tracking-[0.18em] text-white uppercase transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:bg-neutral-900/30'
              >
                {isApplied ? 'Đang áp dụng' : 'Áp dụng'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
