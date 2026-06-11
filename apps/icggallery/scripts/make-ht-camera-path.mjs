// Generate the Home Theatre camera path and merge it into camera_paths.glb.
// Path follows the author's sketch: enter at the door (+Z wall) → pass the bar
// (right corner) → down the right-hand aisle → front-right corner → sweep to
// front-centre looking back at the seating rows.
//
// Usage: node scripts/make-ht-camera-path.mjs <in camera_paths.glb> <out.glb>
import fs from 'node:fs';
import * as THREE from 'three';

const [, , IN = '/tmp/ht-floor/camera_paths.glb', OUT = '/tmp/ht-floor/camera_paths_new.glb'] = process.argv;

// ---- Room facts (world units, from ht_pov.glb bbox) ----------------------
// x 54.94..62.99 | floor y 5.50 | z -59.68 (screen) .. -51.01 (door)
const EYE = 7.2; // 1.7 m above the floor (y 5.5) — khop convention gf/ff (y co dinh)

// Waypoints theo video render "Timeline 1.mp4" của designer:
// cuối phòng (sau lan can) nhìn màn chiếu → đẩy tới, trượt dần sang phải →
// giữa phòng xoay ngược → kết thúc giữa hàng ghế trái nhìn về quầy bar.
// Anchor đo từ hình học ht_pov.glb (decode draco):
// lan can z=-53.25 đỉnh y=7.00 | 2 cột ghế x=58.0 & x=60.9 (lối giữa x=59.45)
// hàng ghế z≈-55.0 & -57.6 | bar TƯỜNG PHẢI x=62.5, z=-51.5..-52.9 (ly y 7.7-8.2)
// màn chiếu z=-59.68 | tường trái x≈55.5
const POS = [
  [59.45, EYE, -52.7],  // sau lan can 0.55m → rail ló mép dưới khung hình như video
  [59.45, EYE, -54.3],  // đẩy thẳng theo lối giữa
  [59.45, EYE, -55.2],  // qua hàng ghế đầu (dừng sớm, sát quá tường nuốt khung hình)
  [60.2, EYE, -55.9],   // lệch phải giữa 2 hàng ghế
  [60.5, EYE, -56.4],   // né chao đèn thả (x60.9 z-57.6) — đi giữa 2 hàng đèn
  [60.4, EYE, -56.6],   // vòng ngược lại
  [58.6, EYE, -55.6],   // sang cột ghế trái
  [57.4, EYE, -55.0],   // dừng ở lối trái, giữa 2 hàng
];
const TGT = [
  [59.45, 7.0, -59.5],  // màn chiếu chính giữa
  [59.45, 7.0, -59.5],  // giữ màn trong lúc đẩy tới
  [59.0, 6.95, -59.5],  // màn, hơi chếch trái
  [58.0, 6.9, -59.3],   // mép trái màn (tường phải bắt đầu vào khung)
  [62.3, 7.0, -56.5],   // quét sang tường phải
  [62.5, 7.4, -53.5],   // dọc tường phải về phía bar
  [62.5, 7.6, -52.5],   // quầy bar (kệ ly 7.7-8.2)
  [62.4, 7.6, -52.2],   // kết thúc giữ bar
];

const DURATION = 4; // seconds — same as the other floors (scroll-scrubbed)
const SAMPLES = 120;
const FOV_RAD = 0.96; // ~55° vertical — video render goc rong, 45 bi hep

// ---- Sample curves --------------------------------------------------------
const v3 = (a) => new THREE.Vector3(...a);
const posCurve = new THREE.CatmullRomCurve3(POS.map(v3), false, 'centripetal');
const tgtCurve = new THREE.CatmullRomCurve3(TGT.map(v3), false, 'centripetal');

const times = new Float32Array(SAMPLES);
const positions = new Float32Array(SAMPLES * 3);
const quats = new Float32Array(SAMPLES * 4);
const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const prev = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

for (let i = 0; i < SAMPLES; i++) {
  const t = i / (SAMPLES - 1);
  const p = posCurve.getPoint(t);
  const g = tgtCurve.getPoint(t);
  m.lookAt(p, g, UP); // camera convention: -Z toward the target
  q.setFromRotationMatrix(m);
  if (i > 0 && q.dot(prev) < 0) { q.x *= -1; q.y *= -1; q.z *= -1; q.w *= -1; }
  prev.copy(q);
  times[i] = t * DURATION;
  positions.set([p.x, p.y, p.z], i * 3);
  quats.set([q.x, q.y, q.z, q.w], i * 4);
}

// ---- Merge into camera_paths.glb ------------------------------------------
const buf = fs.readFileSync(IN);
const jsonLen = buf.readUInt32LE(12);
const g = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const binStart = 20 + jsonLen + 8;
let bin = buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLen));

if (g.nodes.some((n) => n.name === 'ht_empty')) {
  console.error('ht_empty already present — remove it first or regenerate from a clean file.');
  process.exit(1);
}

const pad4 = (b) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b);
const addBV = (data) => {
  bin = pad4(Buffer.from(bin));
  const byteOffset = bin.length;
  const chunk = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  bin = Buffer.concat([bin, chunk]);
  g.bufferViews.push({ buffer: 0, byteOffset, byteLength: chunk.length });
  return g.bufferViews.length - 1;
};
const addAcc = (bv, type, count, compType = 5126, minMax) => {
  g.accessors.push({ bufferView: bv, componentType: compType, count, type, ...(minMax || {}) });
  return g.accessors.length - 1;
};

const accTime = addAcc(addBV(times), 'SCALAR', SAMPLES, 5126, { min: [0], max: [DURATION] });
const accPos = addAcc(addBV(positions), 'VEC3', SAMPLES);
const accRot = addAcc(addBV(quats), 'VEC4', SAMPLES);

g.cameras.push({
  name: 'ht_camera',
  type: 'perspective',
  perspective: { aspectRatio: 1.7777777777777777, yfov: FOV_RAD, zfar: 1000, znear: 0.1 },
});
g.nodes.push({ name: 'ht_camera', camera: g.cameras.length - 1 });
const camNode = g.nodes.length - 1;
g.nodes.push({ name: 'ht_empty', children: [camNode], translation: [...POS[0]] });
const emptyNode = g.nodes.length - 1;
g.scenes[0].nodes.push(emptyNode);

g.animations.push({
  name: 'ht_empty_action',
  samplers: [
    { input: accTime, output: accPos, interpolation: 'LINEAR' },
    { input: accTime, output: accRot, interpolation: 'LINEAR' },
  ],
  channels: [
    { sampler: 0, target: { node: emptyNode, path: 'translation' } },
    { sampler: 1, target: { node: emptyNode, path: 'rotation' } },
  ],
});

bin = pad4(Buffer.from(bin));
g.buffers[0].byteLength = bin.length;

let js = Buffer.from(JSON.stringify(g));
js = js.length % 4 ? Buffer.concat([js, Buffer.alloc(4 - (js.length % 4), 0x20)]) : js;
const header = Buffer.alloc(12 + 8);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
header.writeUInt32LE(js.length, 12);
header.write('JSON', 16, 'ascii');
const binHead = Buffer.alloc(8);
binHead.writeUInt32LE(bin.length, 0);
binHead.write('BIN\0', 4, 'ascii');
fs.writeFileSync(OUT, Buffer.concat([header, js, binHead, bin]));
console.log('wrote', OUT, fs.statSync(OUT).size, 'bytes —', SAMPLES, 'keys,', DURATION + 's clip');
