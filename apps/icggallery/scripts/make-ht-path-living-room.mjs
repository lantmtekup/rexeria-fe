// Bake camera animation từ Living Room_Bake.fbx (3ds Max/Corona export) vào
// camera_paths.glb — adapted từ make-ht-camera-path-from-fbx.mjs (360-admin-cms
// icggallery-site). Khác biệt so với bản gốc (Home_Theatre_Anim, mm/÷1000):
//   - Camera thật là node "Corona_Camera001" (con của "Dummy001", offset local
//     = 0 nên sample world transform trực tiếp trên chính nó là đủ).
//   - Đơn vị: bbox FBX (mesh) = đúng 100× bbox của Lingving Room.glb (đã verify
//     bằng THREE.Box3) → UNIT = 0.01 (cm→m), KHÔNG phải 0.001 như bản gốc.
//   - Cộng thêm OFFSET sau khi scale, để khớp với offset đã áp cho model tĩnh
//     (xem translate-model.mjs) — camera phải nằm cùng không gian world với
//     model đã dịch chuyển.
//
// Usage: node make-ht-path-living-room.mjs <in.fbx> <base camera_paths.glb> <out.glb>
import fs from 'node:fs';

globalThis.URL.createObjectURL ??= () => 'blob:stub';
globalThis.URL.revokeObjectURL ??= () => {};
globalThis.document ??= {
  createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, style: {}, src: '' }),
  createElement: () => ({ getContext: () => null, addEventListener() {}, removeEventListener() {}, style: {} }),
};
globalThis.self ??= globalThis;
const THREE = await import('three');
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');

const [, , FBX, IN, OUT] = process.argv;
const CAM_NODE = 'Corona_Camera001';
const UNIT = 0.01; // cm → m (verified: FBX mesh bbox == 100 × Lingving Room.glb bbox)
const OFFSET = [58.936, 5.65, -51.868]; // cùng offset đã dùng cho ht_living_room.glb
const FOV_RAD = 0.96; // ~55° — Corona camera FOV không đọc được qua FBXLoader, giữ fallback như bản gốc
const SAMPLES = 150;

const fbuf = fs.readFileSync(FBX);
const group = new FBXLoader().parse(fbuf.buffer.slice(fbuf.byteOffset, fbuf.byteOffset + fbuf.byteLength), '');
const clip0 = group.animations[0];
const mixer = new THREE.AnimationMixer(group);
mixer.clipAction(clip0).play();
const cam = group.getObjectByName(CAM_NODE);
if (!cam) throw new Error(`Không thấy node ${CAM_NODE} trong FBX`);

// Khác với Home_Theatre_Anim gốc (path đi ra rồi dừng giữa chừng, cắt đoạn
// loop-về ở CUỐI clip): path này snap gần như tức thời ngay ĐẦU clip (t=0 →
// t≈0.035s đã đi hết ~730 đơn vị chỉ trong 1 keyframe — rõ ràng là điểm nối
// loop authoring trong Max, không phải chuyển động thật), rồi trôi êm/đơn điệu
// suốt phần còn lại về gần đúng điểm xuất phát tại t=duration (đóng loop).
// → tour thật nằm trong [tPeak, duration]: bắt đầu ở điểm xa nhất (peak),
// trôi dần về điểm gần start lúc kết thúc clip.
const probe = new THREE.Vector3();
const start = new THREE.Vector3();
let tPeak = 0, maxDist = -1;
mixer.setTime(0); group.updateMatrixWorld(true); cam.getWorldPosition(start);
for (let t = 0; t <= clip0.duration + 1e-6; t += 0.005) {
  mixer.setTime(t); group.updateMatrixWorld(true); cam.getWorldPosition(probe);
  const d = probe.distanceTo(start);
  if (d > maxDist) { maxDist = d; tPeak = t; }
}
const tStart = tPeak;
const tEnd = clip0.duration;
console.log(`clip "${clip0.name}" ${clip0.duration.toFixed(2)}s — peak dist ${maxDist.toFixed(1)} @ t=${tPeak.toFixed(3)}s → dùng tour ${tStart.toFixed(2)}..${tEnd.toFixed(2)}s`);

const DURATION = 4; // giây trong glb (scroll scrub — chỉ cần tỷ lệ)
const times = new Float32Array(SAMPLES);
const positions = new Float32Array(SAMPLES * 3);
const quats = new Float32Array(SAMPLES * 4);
const p = new THREE.Vector3();
const q = new THREE.Quaternion();
const prevQ = new THREE.Quaternion();
for (let i = 0; i < SAMPLES; i++) {
  mixer.setTime(tStart + (i / (SAMPLES - 1)) * (tEnd - tStart));
  group.updateMatrixWorld(true);
  cam.getWorldPosition(p);
  cam.getWorldQuaternion(q);
  if (i > 0 && q.dot(prevQ) < 0) { q.x *= -1; q.y *= -1; q.z *= -1; q.w *= -1; }
  prevQ.copy(q);
  times[i] = (i / (SAMPLES - 1)) * DURATION;
  positions.set([p.x * UNIT + OFFSET[0], p.y * UNIT + OFFSET[1], p.z * UNIT + OFFSET[2]], i * 3);
  quats.set([q.x, q.y, q.z, q.w], i * 4);
}
console.log(`start [${positions.slice(0,3).map((v)=>v.toFixed(2))}] end [${[...positions.slice(-3)].map((v)=>v.toFixed(2))}]`);

// ---- Merge vào camera_paths.glb (giống make-ht-camera-path.mjs) -----------
const buf = fs.readFileSync(IN);
const jsonLen = buf.readUInt32LE(12);
const g = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const binStart = 20 + jsonLen + 8;
let bin = buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLen));
if (g.nodes.some((n) => n.name === 'ht_empty')) throw new Error('ht_empty đã tồn tại — dùng file base sạch');

const pad4 = (b) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b);
const addBV = (data) => {
  bin = pad4(Buffer.from(bin));
  const byteOffset = bin.length;
  const chunk = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  bin = Buffer.concat([bin, chunk]);
  g.bufferViews.push({ buffer: 0, byteOffset, byteLength: chunk.length });
  return g.bufferViews.length - 1;
};
const addAcc = (bv, type, count, minMax) => {
  g.accessors.push({ bufferView: bv, componentType: 5126, count, type, ...(minMax || {}) });
  return g.accessors.length - 1;
};
const accTime = addAcc(addBV(times), 'SCALAR', SAMPLES, { min: [0], max: [DURATION] });
const accPos = addAcc(addBV(positions), 'VEC3', SAMPLES);
const accRot = addAcc(addBV(quats), 'VEC4', SAMPLES);
g.cameras ??= [];
g.cameras.push({ name: 'ht_camera', type: 'perspective', perspective: { aspectRatio: 16 / 9, yfov: FOV_RAD, zfar: 1000, znear: 0.1 } });
g.nodes.push({ name: 'ht_camera', camera: g.cameras.length - 1 });
const camNode = g.nodes.length - 1;
g.nodes.push({ name: 'ht_empty', children: [camNode], translation: [positions[0], positions[1], positions[2]] });
g.scenes[0].nodes.push(g.nodes.length - 1);
g.animations.push({
  name: 'ht_empty_action',
  samplers: [
    { input: accTime, output: accPos, interpolation: 'LINEAR' },
    { input: accTime, output: accRot, interpolation: 'LINEAR' },
  ],
  channels: [
    { sampler: 0, target: { node: g.nodes.length - 1, path: 'translation' } },
    { sampler: 1, target: { node: g.nodes.length - 1, path: 'rotation' } },
  ],
});
bin = pad4(Buffer.from(bin));
g.buffers[0].byteLength = bin.length;
let js = Buffer.from(JSON.stringify(g));
js = js.length % 4 ? Buffer.concat([js, Buffer.alloc(4 - (js.length % 4), 0x20)]) : js;
const header = Buffer.alloc(20);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + js.length + 8 + bin.length, 8);
header.writeUInt32LE(js.length, 12);
header.write('JSON', 16, 'ascii');
const binHead = Buffer.alloc(8);
binHead.writeUInt32LE(bin.length, 0);
binHead.write('BIN\0', 4, 'ascii');
fs.writeFileSync(OUT, Buffer.concat([header, js, binHead, bin]));
console.log('wrote', OUT, fs.statSync(OUT).size, 'bytes —', SAMPLES, 'keys');
