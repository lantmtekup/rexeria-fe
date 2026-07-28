import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { DRACO, CAMERA_PATHS, SLIDER, FLOORS } from './floors.js';
import { projectZones, InlineImages, InlineModels } from './Zones.jsx';
import Hotspot from './Hotspot.jsx';
import { buildDraftRig, PathMarkers } from './path-editor.jsx';

// POV scene mesh for the active floor (Draco-compressed glTF from the CDN).
// In Author Mode, clicking the model captures the hit world point (e.point) so
// the user can draw clickable-zone polygons. Clicks on existing zones are handled
// by the SVG overlay, not here.
function Floor({ model, clay, author, onAddPoint }) {
  const { scene } = useGLTF(model, DRACO);
  // clay: tạm cho ht_pov.glb — file export từ Corona material chỉ còn palette
  // màu phẳng (phòng map vào ô đen) nên phủ clay để duyệt camera path trong
  // lúc chờ export lại có texture bake. Các tầng khác: chỉ clamp metalness
  // (export thiếu metallicFactor → glTF mặc định metallic=1 → render đen).
  useMemo(() => {
    const clayMat =
      clay &&
      new THREE.MeshStandardMaterial({
        color: '#d9cfbe',
        roughness: 0.95,
        metalness: 0,
      });
    scene.traverse(o => {
      const m = o.material;
      if (!m) return;
      if (clay) o.material = clayMat;
      else if (m.isMeshStandardMaterial && m.metalness > 0.9) {
        m.metalness = 0;
        m.roughness = Math.min(m.roughness, 0.95);
      }
    });
  }, [scene, clay]);
  return (
    <primitive
      object={scene}
      onPointerDown={
        author
          ? e => {
              e.stopPropagation();
              const p = e.point;
              onAddPoint([+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)]);
            }
          : undefined
      }
    />
  );
}

// ?shot — camera snap thẳng vào pose (không lerp) để chụp ảnh tự động.
const SNAP =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('shot');

const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _target = new THREE.Vector3();
const _m4 = new THREE.Matrix4();
const _qt = new THREE.Quaternion();
const _UP = new THREE.Vector3(0, 1, 0);

export default function Experience({
  floor,
  progressRef,
  entered,
  author,
  onAddPoint,
  zonesRef,
  draftRef,
  zonesOutRef,
  inlineZones,
  inlineModelZones,
  focus,
  hotspotZones,
  onHotspot,
  dollhouse,
  pathDraft,
  light,
}) {
  const cfg = FLOORS[floor];
  const camera = useThree(s => s.camera);
  const size = useThree(s => s.size);
  const pathGltf = useGLTF(CAMERA_PATHS, DRACO);
  const sliderGltf = useGLTF(SLIDER, DRACO);
  const povGltf = useGLTF(cfg.model, DRACO); // cached — Floor renders the same asset

  // Clay material for the dollhouse — slider.glb ships flat-white unlit
  // placeholders, so we re-skin them with a soft matte clay (depth comes from
  // lighting), matching icggallery's runtime clay look.
  const clay = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d9cfbe',
        roughness: 0.95,
        metalness: 0,
      }),
    []
  );

  // The landing dollhouse: slider.glb holds one iso room group per floor
  // (gf_iso / ff_iso / uf_iso). Show only the active floor, re-skin to clay,
  // hide the unused baked-AO plane, and frame the camera to the room.
  // Floors without a slider group (cfg.iso == null, e.g. home-theatre) fall
  // back to a clay clone of their own POV model, recentred to the origin so
  // the hover parallax pivots around the room instead of the world origin.
  const iso = useMemo(() => {
    let scene, group;
    if (cfg.iso) {
      scene = sliderGltf.scene;
      scene.children.forEach(g => {
        g.visible = g.name === cfg.iso;
      });
      scene.updateMatrixWorld(true);
      group = scene.getObjectByName(cfg.iso) ?? scene;
    } else {
      const clone = povGltf.scene.clone(true);
      const pre = new THREE.Box3().setFromObject(clone);
      clone.position.sub(pre.getCenter(new THREE.Vector3()));
      scene = new THREE.Group();
      scene.add(clone);
      scene.updateMatrixWorld(true);
      group = scene;
    }
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    group.traverse(o => {
      if (!o.isMesh || !o.geometry) return;
      if (o.name.includes('plane_shadow_ao')) {
        o.visible = false;
        return;
      }
      o.material = clay;
      o.castShadow = true;
      o.receiveShadow = true;
      o.geometry.computeBoundingBox();
      tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      box.union(tmp);
    });
    if (box.isEmpty()) box.setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxd = Math.max(size.x, size.z) || 6;
    const up = new THREE.Vector3(0, 1, 0);
    const look = center.clone();
    const dir = new THREE.Vector3(-1, 0.6, 1.15).normalize();
    const position = center.clone().addScaledVector(dir, maxd * 2.6);
    // Pan eye + target down together (angle preserved) so the model sits high on
    // screen and the title/CTA below land on clean cream, not over the model.
    const vShift = size.y * 0.7;
    look.y -= vShift;
    position.y -= vShift;
    const m = new THREE.Matrix4().lookAt(position, look, up);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(m);
    return {
      scene,
      position,
      quaternion,
      fov: 32,
      center,
      groundY: box.min.y,
      radius: maxd,
    };
  }, [sliderGltf, povGltf, cfg, clay]);

  // Exposure: POV uses the designer-tunable value; landing stays light & airy.
  const gl = useThree(s => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = entered ? (light?.exposure ?? 0.95) : 1.05;
  }, [gl, entered, light?.exposure]);

  // POV key light position from azimuth/elevation around the room centre.
  const keyPos = useMemo(() => {
    const az = THREE.MathUtils.degToRad(light?.keyAzimuth ?? 45);
    const el = THREE.MathUtils.degToRad(light?.keyElevation ?? 50);
    const r = (iso.radius || 6) * 2.2;
    return [
      iso.center.x + r * Math.cos(el) * Math.cos(az),
      iso.center.y + r * Math.sin(el),
      iso.center.z + r * Math.cos(el) * Math.sin(az),
    ];
  }, [light?.keyAzimuth, light?.keyElevation, iso]);

  // Each floor's camera path is an AnimationClip that moves an empty
  // (position + quaternion). We scrub it by scroll and copy the empty's
  // world transform onto the render camera.
  const rig = useMemo(() => {
    const { scene, animations } = pathGltf;
    const empty = scene.getObjectByName(cfg.empty);
    const cam = scene.getObjectByName(cfg.empty.replace('_empty', '_camera'));
    const clip = animations.find(a => a.name === cfg.clip) ?? animations[0];
    const mixer = new THREE.AnimationMixer(scene);
    let action = null;
    if (clip) {
      action = mixer.clipAction(clip);
      action.play();
      action.paused = true; // scrub manually via action.time
    }
    return {
      scene,
      empty,
      action,
      mixer,
      duration: clip?.duration ?? 1,
      fov: cam?.fov ?? 45,
    };
  }, [pathGltf, cfg]);

  useEffect(() => {
    camera.fov = rig.fov;
    camera.updateProjectionMatrix();
  }, [camera, rig.fov]);

  // Path editor (?patheditor): scrub theo draft waypoint thay vì clip trong glb
  // → chỉnh số trên panel thấy camera đổi tức thì, không cần re-export file.
  const draftRig = useMemo(
    () => (pathDraft ? buildDraftRig(pathDraft) : null),
    [pathDraft]
  );

  const pos = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());

  // Fly-to: when a zone is focused, the camera glides to frame it (overriding the
  // scroll path) until focus clears. Precompute the focus point + radius.
  const focusRef = useRef(null);
  const focusData = useMemo(() => {
    if (!focus?.points?.length) return null;
    const pts = focus.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const c = new THREE.Vector3();
    pts.forEach(p => c.add(p));
    c.divideScalar(pts.length);
    let r = 0;
    for (const p of pts) r = Math.max(r, p.distanceTo(c));
    return { c, r };
  }, [focus]);
  useEffect(() => {
    focusRef.current = focusData;
  }, [focusData]);

  // Eye-style hotspot markers (drei Html) anchored at each hotspot zone's centroid.
  const eyeHotspots = useMemo(
    () =>
      (hotspotZones || []).map(z => {
        const c = new THREE.Vector3();
        z.points.forEach(p => c.add(new THREE.Vector3(p[0], p[1], p[2])));
        c.divideScalar(z.points.length || 1);
        return { ...z, position: c };
      }),
    [hotspotZones]
  );

  // Intro reveal progress (0..1). Replays whenever the floor changes.
  const intro = useRef(0);
  useEffect(() => {
    intro.current = 0;
  }, [cfg]);

  // Cursor (−1..1), tracked on window so hover parallax works regardless of the
  // overlay catching events.
  const ptr = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = e => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    // Landing: camera holds the final iso framing; the model slides in from the
    // top-right corner to centre, then gently parallaxes 10° toward the cursor.
    if (!entered) {
      intro.current = Math.min(1, intro.current + delta / 1.4); // ~1.4s reveal
      const e = 1 - Math.pow(1 - intro.current, 3); // easeOutCubic
      camera.position.lerp(iso.position, 0.12);
      camera.quaternion.slerp(iso.quaternion, 0.12);
      if (Math.abs(camera.fov - iso.fov) > 0.02) {
        camera.fov += (iso.fov - camera.fov) * 0.12;
        camera.updateProjectionMatrix();
      }
      const s = iso.scene;
      // Screen-space top-right offset → 0 (settles at centre).
      _right.set(1, 0, 0).applyQuaternion(iso.quaternion);
      _up.set(0, 1, 0).applyQuaternion(iso.quaternion);
      const k = 1 - e;
      s.position
        .set(0, 0, 0)
        .addScaledVector(_right, iso.radius * 1.4 * k)
        .addScaledVector(_up, iso.radius * 1.0 * k);
      // Hover parallax (max ~10°) once the reveal has settled.
      const maxR = 0.1745;
      const tx = intro.current >= 1 ? ptr.current.x * maxR : 0;
      const ty = intro.current >= 1 ? ptr.current.y * maxR * 0.4 : 0;
      s.rotation.y += (tx - s.rotation.y) * 0.07;
      s.rotation.x += (ty - s.rotation.x) * 0.07;
      return;
    }
    // Dollhouse overview: fly up to the isometric framing of the whole floor,
    // gentle cursor parallax. POV walkthrough paused.
    if (dollhouse) {
      camera.position.lerp(iso.position, 0.027);
      camera.quaternion.slerp(iso.quaternion, 0.027);
      if (Math.abs(camera.fov - iso.fov) > 0.02) {
        camera.fov += (iso.fov - camera.fov) * 0.027;
        camera.updateProjectionMatrix();
      }
      const s = iso.scene;
      s.position.set(0, 0, 0);
      const tx = ptr.current.x * 0.12,
        ty = ptr.current.y * 0.05;
      s.rotation.y += (tx - s.rotation.y) * 0.06;
      s.rotation.x += (ty - s.rotation.x) * 0.06;
      return;
    }
    const t = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);
    if (draftRig) {
      draftRig.getPose(t, pos.current, quat.current);
    } else if (rig.empty) {
      if (rig.action) {
        rig.action.time = t * rig.duration;
        rig.mixer.update(0);
      }
      rig.scene.updateMatrixWorld(true);
      rig.empty.getWorldPosition(pos.current);
      rig.empty.getWorldQuaternion(quat.current);
    } else return;
    if (focusRef.current) {
      // Fly-to: keep the current viewing angle but dolly in + lookAt the target.
      const { c, r } = focusRef.current;
      _dir.copy(camera.position).sub(c);
      if (_dir.lengthSq() < 1e-4) _dir.set(0, 0, 1);
      _target.copy(c).addScaledVector(_dir.normalize(), Math.max(r * 3.2, 2.2));
      camera.position.lerp(_target, 0.08);
      _m4.lookAt(camera.position, c, _UP);
      _qt.setFromRotationMatrix(_m4);
      camera.quaternion.slerp(_qt, 0.08);
    } else if (SNAP) {
      camera.position.copy(pos.current);
      camera.quaternion.copy(quat.current);
    } else {
      camera.position.lerp(pos.current, 0.12);
      camera.quaternion.slerp(quat.current, 0.15);
    }
    if (Math.abs(camera.fov - rig.fov) > 0.02) {
      camera.fov += SNAP ? rig.fov - camera.fov : (rig.fov - camera.fov) * 0.08;
      camera.updateProjectionMatrix();
    }

    // Project zones AFTER the camera pose is final this frame (refresh matrices),
    // so the SVG overlay polygons stay glued to objects — no scroll lag.
    if (zonesOutRef) {
      camera.updateMatrixWorld();
      zonesOutRef.current = projectZones(
        camera,
        size.width,
        size.height,
        zonesRef?.current || [],
        draftRef?.current || []
      );
    }
  });

  return (
    <>
      {/* Baked color maps carry lighting → minimal direct light + indoor IBL
          for soft fill + reflections. Designer-tunable via ?light editor. */}
      <ambientLight
        intensity={entered ? (light?.ambient ?? 0.25) : 0.2}
        color={light?.ambientColor ?? '#ffffff'}
      />
      <Environment
        preset={light?.envPreset ?? 'apartment'}
        environmentIntensity={light?.envIntensity ?? 0.55}
      />
      {/* Optional POV key light (off by default) — shaping + soft direction. */}
      {entered && !dollhouse && light?.keyOn && (
        <directionalLight
          position={keyPos}
          intensity={light.keyIntensity ?? 1.2}
          color={light.keyColor ?? '#fff5e6'}
        />
      )}
      {(!entered || dollhouse) && (
        <>
          <hemisphereLight
            intensity={0.22}
            color='#fffaf0'
            groundColor='#c7b89f'
          />
          <directionalLight
            position={[
              iso.center.x + iso.radius * 0.8,
              iso.center.y + iso.radius * 1.8,
              iso.center.z + iso.radius,
            ]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            shadow-radius={4}
          >
            <orthographicCamera
              attach='shadow-camera'
              args={[
                -iso.radius,
                iso.radius,
                iso.radius,
                -iso.radius,
                0.1,
                iso.radius * 4.5,
              ]}
            />
          </directionalLight>
          <ContactShadows
            position={[iso.center.x, iso.groundY + 0.02, iso.center.z]}
            scale={iso.radius * 2.2}
            resolution={1024}
            blur={2.8}
            far={iso.radius}
            opacity={0.5}
            color='#4a4233'
          />
        </>
      )}

      {/* Landing / Dollhouse (slider.glb or clay POV fallback) vs POV walkthrough */}
      {(!entered || dollhouse) && <primitive object={iso.scene} />}
      {entered && !dollhouse && (
        <Floor
          model={cfg.model}
          clay={cfg.clayPov}
          author={author}
          onAddPoint={onAddPoint}
        />
      )}
      {entered && !dollhouse && pathDraft && <PathMarkers draft={pathDraft} />}
      {entered && !dollhouse && <InlineImages zones={inlineZones} />}
      {entered && !dollhouse && <InlineModels zones={inlineModelZones} />}
      {entered &&
        !dollhouse &&
        eyeHotspots.map(h => (
          <Hotspot key={h.id} data={h} onOpen={() => onHotspot?.(h)} />
        ))}
    </>
  );
}

useGLTF.preload(CAMERA_PATHS, DRACO);
useGLTF.preload(SLIDER, DRACO);
Object.values(FLOORS).forEach(f => useGLTF.preload(f.model, DRACO));
