/**
 * Kiểm hợp đồng "URL này là ảnh hay video" giữa FE và BE.
 *
 * FE: src/components/modules/block-editor/mediaUrl.ts        → isVideoUrl
 * BE: internal/usecase/insight_block_schema.go               → isVideoRef
 *     (test đối ứng: TestIsVideoRef_MirrorsFrontendRule)
 *
 * Hai bên là hai bản chép tay, buộc phải cùng luật: BE quyết URL nào được xếp
 * vào ô video khi AI sinh nội dung, FE quyết dựng <img> hay <video>. Lệch nhau
 * thì trang ra khoảng trống mà không báo lỗi — đã xảy ra 05/08/2026 với
 * `clip.mp4.m3u8`.
 *
 * Chạy: pnpm check:media   (hoặc npx tsx scripts/check-media-rule.ts)
 */
import {
  isHlsUrl,
  isImageUrl,
  isVideoUrl,
} from '../src/components/modules/block-editor/mediaUrl';

type Case = { url: string; video: boolean; why: string };

// GIỮ ĐỒNG BỘ với bảng trong TestIsVideoRef_MirrorsFrontendRule bên BE.
const CASES: Case[] = [
  { url: '/gambit/video-history.mp4', video: true, why: 'file mp4 thường' },
  { url: 'https://cdn/x.webm', video: true, why: 'webm' },
  { url: 'https://cdn/x.MOV', video: true, why: 'hoa thường không phân biệt' },
  {
    url: 'https://cdn/clip.mp4?token=abc',
    video: true,
    why: 'query bị bỏ trước khi khớp',
  },
  {
    url: 'https://cdn/clip.mp4#t=2',
    video: true,
    why: 'hash bị bỏ trước khi khớp',
  },
  {
    url: 'https://cdn/clip.mp4.m3u8',
    video: true,
    why: 'playlist HLS — vẫn là ô video',
  },
  { url: 'https://cdn/stream.mpd', video: true, why: 'DASH' },
  {
    url: 'https://cdn/poster-mp4-thumb.jpg',
    video: false,
    why: 'ảnh có chữ mp4 trong tên',
  },
  { url: 'https://cdn/ring.jpg', video: false, why: 'ảnh' },
  { url: '/gambit/icon-text.svg', video: false, why: 'svg' },
  { url: '', video: false, why: 'rỗng' },
];

const failures: string[] = [];

for (const c of CASES) {
  const got = isVideoUrl(c.url);
  if (got !== c.video) {
    failures.push(
      `isVideoUrl(${JSON.stringify(c.url)}) = ${got}, cần ${c.video} — ${c.why}`
    );
  }
}

// Một URL không thể vừa là ảnh vừa là video: chồng lấn nghĩa là luật thủng.
for (const c of CASES) {
  if (c.url && isVideoUrl(c.url) && isImageUrl(c.url)) {
    failures.push(`${c.url} khớp CẢ isVideoUrl lẫn isImageUrl`);
  }
}

// HLS phải là tập con của video, nếu không BlockMedia sẽ dựng <img> rồi mới
// cố gắn hls.js vào một thẻ không tồn tại.
for (const c of CASES) {
  if (isHlsUrl(c.url) && !isVideoUrl(c.url)) {
    failures.push(`${c.url} là HLS nhưng isVideoUrl() = false`);
  }
}

if (failures.length > 0) {
  console.error('✗ Luật media FE lệch khỏi hợp đồng:\n');
  for (const f of failures) console.error(`  ${f}`);
  console.error('\nSửa mediaUrl.ts, và sửa cả isVideoRef bên BE cho khớp.');
  process.exit(1);
}

console.log(`✓ Luật media khớp hợp đồng (${CASES.length} ca)`);
