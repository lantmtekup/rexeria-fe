// Strip the existing ht_camera/ht_empty/ht_empty_action out of camera_paths_v10.glb,
// leaving gf/ff/uf/pu paths untouched. ht items happen to be the LAST entries in
// their respective arrays (nodes, cameras, animations), so popping them off does
// not shift indices referenced elsewhere. Orphaned accessors/bufferViews (ht's
// time/pos/rot data) are left in place — harmless, just a few unused KB.
import fs from 'node:fs';

const [, , IN, OUT] = process.argv;
const buf = fs.readFileSync(IN);
const jsonLen = buf.readUInt32LE(12);
const g = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
const binStart = 20 + jsonLen + 8;
const bin = buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLen));

const htCameraIdx = g.nodes.findIndex(n => n.name === 'ht_camera');
const htEmptyIdx = g.nodes.findIndex(n => n.name === 'ht_empty');
if (htEmptyIdx !== g.nodes.length - 1 || htCameraIdx !== g.nodes.length - 2) {
  throw new Error(
    'ht_camera/ht_empty không nằm ở cuối mảng nodes — cần xử lý thủ công thay vì pop.'
  );
}
g.nodes.pop(); // ht_empty
g.nodes.pop(); // ht_camera
g.cameras.pop(); // ht_camera perspective
g.animations = g.animations.filter(a => a.name !== 'ht_empty_action');
g.scenes[0].nodes = g.scenes[0].nodes.filter(idx => idx !== htEmptyIdx);

let js = Buffer.from(JSON.stringify(g));
js =
  js.length % 4
    ? Buffer.concat([js, Buffer.alloc(4 - (js.length % 4), 0x20)])
    : js;
const header = Buffer.alloc(20);
header.write('glTF', 0, 'ascii');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + js.length + 8 + bin.length, 8);
header.writeUInt32LE(js.length, 12);
header.write('JSON', 16, 'ascii');
const binHead = Buffer.alloc(8);
binHead.writeUInt32LE(bin.length, 0);
binHead.write('BIN\0', 4, 'ascii');
fs.writeFileSync(OUT, Buffer.concat([header, js, binHead, Buffer.from(bin)]));
console.log(
  'wrote',
  OUT,
  '- remaining nodes:',
  g.nodes.map(n => n.name).join(', ')
);
