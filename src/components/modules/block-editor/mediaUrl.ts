/**
 * Nhận diện field / URL media dùng chung giữa editor chrome (ImagePicker,
 * inspector, canvas chip) và các block render.
 *
 * Tách riêng khỏi `ImagePicker.tsx` để block component (chạy cả trên `/p/[id]`)
 * không phải kéo theo picker + `rexerApi` + `sonner` vào chunk công khai.
 *
 * ĐÂY LÀ NGUỒN SỰ THẬT DUY NHẤT ở FE cho câu hỏi "URL này là ảnh hay video".
 * Block mới đừng tự viết lại — dùng `<BlockMedia>` (BlockMedia.tsx) là xong.
 *
 * BE có một bản mirror ở `internal/usecase/insight_block_schema.go`
 * (`isVideoRef`) để không xếp ảnh vào ô video khi AI sinh nội dung. Hai bên
 * PHẢI cùng luật: 05/08/2026 chúng đã lệch — BE dùng `Contains(".mp4")` nên coi
 * `clip.mp4.m3u8` là video, FE neo cuối chuỗi nên coi là ảnh, kết quả là
 * `<img src="...m3u8">` không hiện gì trên trang thật.
 */

/** Bỏ query/hash: CDN hay dán `….mp4?token=…`, `….m3u8#t=2`. */
function pathOf(url: string): string {
  const s = url.trim();
  return s.split(/[?#]/)[0] ?? s;
}

/** File video tải thẳng. */
const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

/**
 * Playlist streaming. KHÔNG phải file video — `<video src>` chỉ chạy được trên
 * Safari; nơi khác phải gắn hls.js. `<BlockMedia>` lo việc đó.
 */
const STREAM_EXT = /\.(m3u8|mpd)$/i;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)$/i;

/** URL trỏ tới video → phải render `<video>`, `<img>` sẽ vỡ. */
export function isVideoUrl(url: string): boolean {
  const p = pathOf(url);
  if (!p) return false;
  return VIDEO_EXT.test(p) || STREAM_EXT.test(p);
}

/** URL trỏ tới ảnh tĩnh. Dùng để loại trừ dứt khoát trước các heuristic đoán. */
export function isImageUrl(url: string): boolean {
  const p = pathOf(url);
  return !!p && IMAGE_EXT.test(p);
}

/**
 * Nguồn HLS/DASH — cần thư viện để phát ở Chrome/Firefox/Edge.
 * Safari và iOS phát thẳng qua thuộc tính `src`.
 */
export function isHlsUrl(url: string): boolean {
  const p = pathOf(url);
  return !!p && STREAM_EXT.test(p);
}

/**
 * Field nào được phép chọn video khi upload. Nhận diện theo tên key vì
 * `LayerElement.fieldType` mới có text | textarea | image | link — chưa có
 * 'video', và một field media như `videoUrl` vẫn phải đi đường 'image' để có
 * chip "Đổi ảnh" + inspector media (không phải inline edit chữ).
 */
export function mediaAcceptFor(fieldKey: string): string {
  return /video/i.test(fieldKey)
    ? 'image/*,video/mp4,video/webm,video/quicktime'
    : 'image/*';
}
