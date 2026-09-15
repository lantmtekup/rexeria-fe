import fs from 'node:fs';
import path from 'node:path';
import { readImageSize } from './layers';
import EPS from './eps.json';

/**
 * Artwork EpicPaper (trang mẫu: card `ep`) — bấm vào mở tranh tương tác
 * `art.solomei.ai/?id=<id>` toàn màn. Chương lấy từ API trang mẫu
 * (`ep[].chapters`): `id` = tên bookmark trong tranh, `title` = nhãn hiển thị.
 */
export type EpArtwork = {
  id: string;
  title: string;
  chapters: Array<{ id: string; title: string }>;
};

export type Highlight = {
  src: string;
  title: string;
  w: number;
  h: number;
  ep?: EpArtwork;
};

const epById = (id: keyof typeof EPS): EpArtwork => EPS[id];

const DIR = 'hl-1';

/**
 * Tiêu đề theo số thứ tự đầu tên file trong public/hl-1 (01-…, 02-…).
 * File đầu tiên là card nổi bật; phần còn lại vào grid theo thứ tự số.
 */
const TITLES: Record<string, string> = {
  '01': '2026 - O stars, show us the order of the universe and…',
  '02': '2026 - Saint Francis and Sister Artificial Intelligence',
  '03': '2026 - Letter to Peace',
  '04': '2026 - Letter to Brother Saint Francis',
  '05': 'The Documentary Film',
  '06': '“Outstanding Achievement Award” 2025',
  '07': 'Himalayan Regenerative Fashion Living Lab',
  // TODO: chưa có tiêu đề thật cho ảnh này.
  '08': 'Solomeo, May 2025',
};

export function readHighlights(): Highlight[] {
  return (
    fs
      .readdirSync(path.join(process.cwd(), 'public', DIR))
      // Chỉ file đánh số (01-…); preview.png là artwork, đi hàng riêng.
      .filter(f => /^\d{2}-.*\.(jpe?g|png)$/i.test(f))
      .sort()
      .map(f => {
        const src = `/${DIR}/${f}`;
        return {
          src,
          title: TITLES[f.slice(0, 2)] ?? '',
          ...readImageSize(src),
        };
      })
  );
}

/** Artwork dưới grid (trang mẫu: ep-highlights-container) — hàng riêng. */
export function readArtwork(): Highlight | null {
  const src = `/${DIR}/preview.png`;
  if (!fs.existsSync(path.join(process.cwd(), 'public', src))) return null;
  return {
    src,
    title: 'A Story of Dreams and Cashmere',
    ...readImageSize(src),
    ep: epById('j2PPw53'),
  };
}

export type Topic = {
  title: string;
  artwork: Highlight | null;
  cards: Highlight[];
};

/**
 * Chủ đề "Life and family" (public/hl-2). Thứ tự và tiêu đề theo trang mẫu;
 * trang mẫu bỏ card trùng với Highlights (07-the-documentary-film) nên ở đây
 * cũng bỏ; lấy 9 card (bỏ 09-a-universal-letter-to-women). Ảnh artwork là 00-cover-the-tale-of-a-life-preview.
 */
const LIFE_FAMILY: Array<[file: string, title: string]> = [
  ['10-my-life.jpg', 'My Life'],
  ['03-2022-a-queen-and-a-king.jpg', '2022 - A Queen and a King'],
  [
    '01-2020-letter-from-a-grandfather-on-the-first-day-of-the-new-l.jpg',
    '2020 - Letter from a grandfather on the first day of the new life',
  ],
  [
    '02-2024-letter-of-praise-to-elderliness.jpg',
    '2024 - Letter of praise to Elderliness',
  ],
  ['04-2022-letter-to-my-soul.jpg', '2022 - Letter to my soul'],
  ['11-2022-letter-to-my-father.jpg', '2022 - Letter to my father'],
  [
    '05-2025-honorary-doctorate-in-architecture.jpg',
    '2025 - Honorary Doctorate in Architecture',
  ],
  ['06-the-family.jpg', 'The Family'],
  ['08-2021-letter-of-praise-to-italy.jpg', '2021 - Letter of praise to Italy'],
];

const toHighlight = (dir: string, file: string, title: string) => {
  const src = `/${dir}/${file}`;
  return fs.existsSync(path.join(process.cwd(), 'public', src))
    ? { src, title, ...readImageSize(src) }
    : null;
};

export function readLifeFamily(): Topic {
  const artwork = toHighlight(
    'hl-2',
    '00-cover-the-tale-of-a-life-preview.jpg',
    'The Tale of a Life'
  );
  return {
    title: 'Life and family',
    artwork: artwork && { ...artwork, ep: epById('jbrrG4j') },
    cards: LIFE_FAMILY.map(([f, t]) => toHighlight('hl-2', f, t)).filter(
      (c): c is Highlight => c !== null
    ),
  };
}

/**
 * Chủ đề đọc từ `public/<dir>/cards.json` (`[{ file, title }]`, đúng thứ tự
 * hiển thị) — ảnh card tải từ trang mẫu. File thiếu → ảnh placeholder.
 */
export function readTopic(dir: string, title: string): Topic {
  const manifest = path.join(process.cwd(), 'public', dir, 'cards.json');
  const list: Array<{ file: string; title: string }> = fs.existsSync(manifest)
    ? JSON.parse(fs.readFileSync(manifest, 'utf8'))
    : [];
  return {
    title,
    artwork: null,
    cards: list.map(
      c =>
        toHighlight(dir, c.file, c.title) ?? {
          src: PLACEHOLDER,
          title: c.title,
          ...readImageSize(PLACEHOLDER),
        }
    ),
  };
}

const PLACEHOLDER = '/00-ui/card_placeholder.png';
