import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Lenis from 'lenis';
import Experience from './Experience.jsx';
import LoadingScreen from './LoadingScreen.jsx';
import GuideOverlay from './GuideOverlay.jsx';
import Model3DModal, { preloadPopupModels } from './Model3DModal.jsx';
import MagnoliaLogo from './MagnoliaLogo.jsx';
import AuthorPanel from './AuthorPanel.jsx';
import { ZoneOverlay } from './Zones.jsx';
import { usePathDraft, PathEditorPanel } from './path-editor.jsx';
import { useLightSettings, LightEditorPanel } from './light-editor.jsx';
import { FLOORS, FLOOR_KEYS, floorFromPath } from './floors.js';

const IS_AUTHOR =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('author');
const IS_PATH_EDITOR =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('patheditor');
const IS_LIGHT_EDITOR =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('light');
// ?shot — chế độ chụp tự động (Playwright): auto-enter, camera snap không lerp,
// canvas giữ buffer để toDataURL, window.__setProgress(t) set scroll trực tiếp.
const IS_SHOT =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('shot');

export default function App() {
  const progressRef = useRef(0);
  const enteredRef = useRef(false); // camera frozen at path start until "Step Inside"
  const [floor, setFloor] = useState(() =>
    floorFromPath(window.location.pathname)
  );
  const [entered, setEntered] = useState(false);
  const [hotspot, setHotspot] = useState(null);
  const [model3d, setModel3d] = useState(null); // zone clicked → 3D viewer
  // Lựa chọn đã "Áp dụng" vào phòng: { [variantKey]: { model?, fabric } }. Key =
  // variants.id (nhiều zone dùng chung, vd. cặp ghế bành) hoặc id của zone.
  const [applied, setApplied] = useState({});
  const variantKey = z => z.variants?.id ?? z.id;
  const [guide, setGuide] = useState(false);
  const [switching, setSwitching] = useState(false);
  const cfg = FLOORS[floor];

  // Clickable zones (polygons). In Author Mode you draw new ones; otherwise they
  // come from the floor config. Projection runs in-canvas → zonesOutRef.
  const [zones, setZones] = useState(cfg.zones ?? []);
  const [draft, setDraft] = useState([]); // world points of polygon being drawn
  const [form, setForm] = useState({
    title: '',
    eyebrow: '',
    type: 'model',
    src: '',
  });
  const [authoring, setAuthoring] = useState(IS_AUTHOR); // draw mode (double-click toggles)
  // image-inline zones render in the 3D scene (real textured quads); the rest
  // use the SVG overlay (hover + click → popup).
  const [activeInline, setActiveInline] = useState({}); // model-inline zones toggled on
  const [focus, setFocus] = useState(null); // zone the camera flies to
  const [dollhouse, setDollhouse] = useState(false); // POV ↔ isometric overview
  const [pathDraft, setPathDraft] = usePathDraft(floor, IS_PATH_EDITOR);
  // Lighting always applies (baked defaults + any saved designer draft); the
  // editor panel (?light) lets the designer tune it live.
  const [light, setLight] = useLightSettings(floor, cfg.lighting);
  const isInline = z => z.type === 'image-inline' || z.type === 'video-inline';
  const inlineZones = useMemo(() => zones.filter(isInline), [zones]);
  const hotspotZones = useMemo(
    () => zones.filter(z => z.type === 'hotspot'),
    [zones]
  );
  // Zone khai báo `mesh` → hover/click + viền bám đúng hình trong 3D
  // (MeshZone.jsx), không qua polygon SVG.
  const overlayZones = useMemo(
    () => zones.filter(z => !isInline(z) && z.type !== 'hotspot' && !z.mesh),
    [zones]
  );
  const meshZones = useMemo(() => zones.filter(z => z.mesh), [zones]);
  const inlineModelZones = useMemo(
    () => zones.filter(z => z.type === 'model-inline' && activeInline[z.id]),
    [zones, activeInline]
  );
  // Zone có variants.scene → mesh tương ứng trong phòng đổi theo lựa chọn đã
  // áp dụng. Có `models` (đổi mẫu ghế): mẫu gốc (có `fabric`) → đổi vải tại
  // chỗ; mẫu khác → giấu đồ gốc (hide) + đặt model vào scene.place.
  const [fabricOverrides, placedModels] = useMemo(() => {
    const overrides = new Map();
    const placed = new Map();
    zones.forEach(z => {
      const key = variantKey(z);
      const v = z.variants;
      const pick = applied[key];
      if (!v?.scene || !pick) return;
      const fabricSrc = v.options.find(o => o.id === pick.fabric)?.src;
      const model = v.models?.find(m => m.id === pick.model);
      if (!model) {
        if (fabricSrc) overrides.set(key, { ...v.scene, src: fabricSrc });
      } else if (model.fabric) {
        overrides.set(key, {
          ...model.fabric,
          nodes: [v.scene.node],
          src: fabricSrc,
        });
      } else {
        overrides.set(key, { nodes: [v.scene.node], hide: v.scene.hide });
        placed.set(key, {
          key,
          src: model.src,
          material: model.material,
          fabricSrc,
          ...v.scene.place,
        });
      }
    });
    return [[...overrides.values()], [...placed.values()]];
  }, [zones, applied]);
  const zonesRef = useRef(overlayZones);
  const draftRef = useRef(draft);
  const zonesOutRef = useRef(null);
  useEffect(() => {
    zonesRef.current = overlayZones;
  }, [overlayZones]);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  useEffect(() => {
    setZones(FLOORS[floor].zones ?? []);
    setDraft([]);
    preloadPopupModels(FLOORS[floor].zones);
  }, [floor]);

  const addPoint = p => setDraft(d => [...d, p]);
  const finishZone = () => {
    if (draft.length < 3) return;
    const id = 'zone-' + (zones.length + 1);
    setZones(z => [
      ...z,
      {
        id,
        title: form.title || 'Item',
        eyebrow: form.eyebrow,
        type: form.type,
        src: form.src,
        points: draft,
      },
    ]);
    setDraft([]);
  };
  const openZone = z => {
    setFocus(z); // fly camera to frame it
    if (z.type === 'model-inline') {
      setActiveInline(a => {
        const on = !a[z.id];
        if (!on) setFocus(null); // toggled off → release camera
        return { ...a, [z.id]: on };
      });
    } else if (z.type === 'hotspot') {
      setHotspot({
        title: z.title,
        eyebrow: z.eyebrow,
        body: z.body,
        image: z.image,
      });
    } else if (z.type === 'image') {
      setHotspot({ title: z.title, eyebrow: z.eyebrow, image: z.src });
    } else {
      // Popup viewer 3D (xoay/zoom); có variants → đổi chất liệu + Áp dụng.
      setModel3d({
        key: variantKey(z),
        title: z.title,
        eyebrow: z.eyebrow,
        model3d: z.src,
        variants: z.variants,
      });
    }
  };

  // Double-click → enter draw mode; ESC → exit (ESC closes any open popup first).
  // Chỉ bật khi mở với ?author (người xem không vô tình vào draw mode); tắt khi
  // đang ở path editor — chỉnh camera không dính draw mode.
  useEffect(() => {
    if (!entered || IS_PATH_EDITOR) return;
    const onDbl = () => IS_AUTHOR && setAuthoring(true);
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if (model3d || hotspot || guide) return; // let the popup handle ESC
      setAuthoring(a => {
        if (a) setDraft([]);
        return false;
      });
    };
    window.addEventListener('dblclick', onDbl);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('dblclick', onDbl);
      window.removeEventListener('keydown', onKey);
    };
  }, [entered, model3d, hotspot, guide]);

  // Shot mode: vào thẳng POV + expose setter cho Playwright.
  useEffect(() => {
    if (!IS_SHOT) return;
    enteredRef.current = true;
    setEntered(true);
    window.__setProgress = t => {
      progressRef.current = t;
    };
    return () => {
      delete window.__setProgress;
    };
  }, []);

  // Smooth scroll → normalized progress (0..1) shared with the camera rig.
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    const onScroll = () => {
      if (!enteredRef.current) {
        progressRef.current = 0;
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? window.scrollY / max : 0;
    };
    lenis.on('scroll', onScroll);
    const raf = t => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  const changeFloor = key => {
    if (key === floor) return;
    setSwitching(true);
    window.scrollTo(0, 0);
    progressRef.current = 0;
    window.history.replaceState(null, '', `/en/floors/${key}`);
    setFloor(key);
    // brief mask while the new model streams in
    setTimeout(() => setSwitching(false), 1500);
  };

  return (
    <>
      {!entered && (
        <LoadingScreen
          floor={floor}
          onChangeFloor={changeFloor}
          onEnter={() => {
            enteredRef.current = true;
            setEntered(true);
            setTimeout(() => setGuide(true), 900);
          }}
        />
      )}

      {/* Fixed full-screen 3D stage */}
      <div className='fixed inset-0'>
        <Canvas
          shadows
          camera={{ fov: 30, near: 0.1, far: 200, position: [9, 8, 9] }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.95,
            preserveDrawingBuffer: IS_SHOT,
          }}
          dpr={[1, 2]}
        >
          <color attach='background' args={['#f1ece2']} />
          <Suspense fallback={null}>
            <Experience
              key={floor}
              floor={floor}
              progressRef={progressRef}
              entered={entered}
              author={authoring}
              onAddPoint={addPoint}
              zonesRef={zonesRef}
              draftRef={draftRef}
              zonesOutRef={zonesOutRef}
              inlineZones={inlineZones}
              inlineModelZones={inlineModelZones}
              focus={focus}
              hotspotZones={hotspotZones}
              onHotspot={openZone}
              dollhouse={dollhouse}
              pathDraft={pathDraft}
              light={light}
              fabricOverrides={fabricOverrides}
              placedModels={placedModels}
              meshZones={meshZones}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll spacer drives the camera path — longer = slower travel */}
      <div style={{ height: '2000vh' }} />

      {/* POV overlay UI — only after stepping inside */}
      {entered && (
        <>
          <header className='pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 text-white'>
            <MagnoliaLogo className='drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]' />
            <span className='text-[11px] tracking-[0.2em] uppercase opacity-70'>
              {cfg.label}
            </span>
          </header>

          {FLOOR_KEYS.length > 1 && (
            <nav className='fixed inset-x-0 bottom-16 z-20 flex justify-center gap-2'>
              {FLOOR_KEYS.map(key => (
                <button
                  key={key}
                  type='button'
                  onClick={() => changeFloor(key)}
                  className={`rounded-full px-5 py-2 text-[11px] tracking-[0.18em] uppercase backdrop-blur transition-colors duration-300 ${
                    key === floor
                      ? 'bg-white text-neutral-900'
                      : 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25'
                  }`}
                >
                  {FLOORS[key].label}
                </button>
              ))}
            </nav>
          )}
        </>
      )}

      {/* Floor-switch mask (cream) */}
      <div
        className='pointer-events-none fixed inset-0 z-40 bg-[#f1ece2] transition-opacity duration-500'
        style={{ opacity: switching ? 1 : 0 }}
      />

      {/* Clickable-zone outlines (hover highlight + click → popup) */}
      {entered && !dollhouse && (
        <ZoneOverlay
          zones={overlayZones}
          author={authoring}
          outRef={zonesOutRef}
          onOpen={openZone}
        />
      )}

      {entered && pathDraft && (
        <PathEditorPanel
          floor={floor}
          draft={pathDraft}
          setDraft={setPathDraft}
          progressRef={progressRef}
        />
      )}

      {entered && IS_LIGHT_EDITOR && (
        <LightEditorPanel
          floor={floor}
          light={light}
          setLight={setLight}
          floorLighting={cfg.lighting}
        />
      )}

      {entered && authoring && (
        <AuthorPanel
          floorKey={floor}
          draft={draft}
          zones={zones}
          form={form}
          setForm={setForm}
          onFinish={finishZone}
          onUndo={() => setDraft(d => d.slice(0, -1))}
          onClear={() => setDraft([])}
          onRemove={id => setZones(z => z.filter(x => x.id !== id))}
        />
      )}

      {guide && <GuideOverlay zones={zones} onClose={() => setGuide(false)} />}
      {hotspot && (
        <InfoModal
          data={hotspot}
          onClose={() => {
            setHotspot(null);
            setFocus(null);
          }}
        />
      )}
      {model3d && (
        <Model3DModal
          data={model3d}
          applied={applied[model3d.key]}
          onApply={
            model3d.variants?.scene
              ? pick => {
                  setApplied(a => ({ ...a, [model3d.key]: pick }));
                  setModel3d(null);
                  setFocus(null);
                }
              : undefined
          }
          onClose={() => {
            setModel3d(null);
            setFocus(null);
          }}
        />
      )}
    </>
  );
}

function InfoModal({ data, onClose }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const paragraphs = Array.isArray(data.body)
    ? data.body
    : data.body
      ? [data.body]
      : [];

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='pointer-events-none fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-8'
    >
      <div className='popup-card pointer-events-auto relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white text-neutral-900 shadow-2xl ring-1 ring-black/5'>
        <div className='p-7 sm:p-8'>
          {/* Eyebrow + close */}
          <div className='flex items-start justify-between gap-4'>
            {data.eyebrow && (
              <span className='text-[10px] font-medium tracking-[0.24em] text-neutral-400 uppercase'>
                {data.eyebrow}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label='Đóng'
              className='-mt-1 -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-black/5 hover:text-neutral-900'
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <h2
            className='mt-5 font-serif leading-tight font-light'
            style={{ fontSize: 'clamp(22px,3vw,28px)' }}
          >
            {data.title}
          </h2>

          {/* Body */}
          <div className='mt-4 space-y-3 text-[13px] leading-relaxed text-neutral-600'>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Image */}
          {data.image && (
            <img
              src={data.image}
              alt={data.title}
              className='mt-6 aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-black/5'
            />
          )}

          {/* Footer captions */}
          {Array.isArray(data.captions) && data.captions.length > 0 && (
            <div className='mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-[11px] leading-snug text-neutral-400'>
              {data.captions.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          )}
        </div>

        {/* Corner accent */}
        <span className='pointer-events-none absolute right-2.5 bottom-2.5 h-3 w-3 border-r border-b border-neutral-300' />
      </div>
    </div>
  );
}
