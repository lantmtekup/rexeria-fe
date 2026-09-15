import fs from 'node:fs';
import path from 'node:path';

export type Layer = {
  src: string;
  /** Sub-folder name (clouds, farm, …) — '' when the file sits at the root. */
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Tolerates the `-x6194-x40` typo in life-clouds-04.
const XY = /-x(\d+)-[xy](\d+)\.png$/;

/** PNG stores width/height big-endian at bytes 16–23 of the IHDR chunk. */
const pngSize = (file: string) => {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

/** JPEG: walk the markers until a start-of-frame (SOFn) segment. */
const jpegSize = (file: string) => {
  const buf = fs.readFileSync(file);
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isSOF)
      return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error(`No JPEG frame header in ${file}`);
};

/** Width/height from the file header — `path` is relative to `public/`. */
export const readImageSize = (publicPath: string) => {
  const file = path.join(PUBLIC_DIR, publicPath);
  return /\.png$/i.test(file) ? pngSize(file) : jpegSize(file);
};

/**
 * Reads every `*-xNNN-yNNN.png` under `public/<dir>`: position comes from the
 * filename, size from the PNG header — so nothing is hand-copied into code.
 * Runs on the server (page is a Server Component) and ships plain data.
 */
export function readLayers(dir: string, groups?: string[]): Layer[] {
  const root = path.join(PUBLIC_DIR, dir);
  const layers: Layer[] = [];

  const walk = (abs: string) => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const full = path.join(abs, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const m = entry.name.match(XY);
      if (!m) continue;
      const rel = path.relative(root, full).split(path.sep);
      layers.push({
        src: '/' + path.relative(PUBLIC_DIR, full).split(path.sep).join('/'),
        group: rel.length > 1 ? rel[0] : '',
        x: Number(m[1]),
        y: Number(m[2]),
        ...pngSize(full),
      });
    }
  };
  walk(root);

  const order = (l: Layer) => (groups ? groups.indexOf(l.group) : 0);
  return layers
    .filter(l => !groups || groups.includes(l.group))
    .sort((a, b) => order(a) - order(b) || a.src.localeCompare(b.src));
}
