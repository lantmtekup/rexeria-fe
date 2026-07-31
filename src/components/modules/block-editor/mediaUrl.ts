/**
 * Nhận diện field / URL media dùng chung giữa editor chrome (ImagePicker,
 * inspector, canvas chip) và các block render.
 *
 * Tách riêng khỏi `ImagePicker.tsx` để block component (chạy cả trên `/p/[id]`)
 * không phải kéo theo picker + `rexerApi` + `sonner` vào chunk công khai.
 */

/** URL trỏ tới video → phải render `<video>`, `<img>` sẽ vỡ. */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
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
