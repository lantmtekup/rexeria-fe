'use client';

import * as React from 'react';

import { isHlsUrl, isVideoUrl } from './mediaUrl';

/**
 * Một ô media của block: tự quyết `<img>` hay `<video>` từ URL, và tự lo phát
 * HLS. Mọi block có ô ảnh/video nên dùng cái này thay vì tự phân nhánh.
 *
 * Vì sao gom về một chỗ: 226 block component, 15 cái dựng `<video>`, mỗi cái
 * một kiểu — 5 cái gọi `isVideoUrl`, 1 cái chép lại luật, 9 cái dựng `<video>`
 * cứng không phân nhánh. Nội dung thì do AI điền, nên ô nào cũng có thể nhận
 * phải URL khác loại với thứ tác giả block hình dung. Một chỗ quyết định thì
 * sửa một lần là cả 226 block được hưởng.
 *
 * HLS: `<video src="….m3u8">` chỉ chạy trên Safari/iOS. Nơi khác cần hls.js —
 * nạp bằng `import()` động nên trang không có video sẽ không tải thư viện.
 */

type BlockMediaProps = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  /** Chỉ dùng cho `<img>`; `<video>` trang trí nên để rỗng + aria-hidden. */
  alt?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
  preload?: 'none' | 'metadata' | 'auto';
  'aria-hidden'?: boolean | 'true' | 'false';
};

export const BlockMedia = React.forwardRef<HTMLVideoElement, BlockMediaProps>(
  function BlockMedia({ src, className, style, alt = '', ...rest }, ref) {
    const innerRef = React.useRef<HTMLVideoElement | null>(null);
    const streaming = isHlsUrl(src);

    /**
     * File tải thẳng nằm cạnh playlist, nếu có: `clip.mp4.m3u8` → `clip.mp4`.
     * Nhiều CDN đóng gói HLS ngay bên cạnh bản gốc theo đúng quy ước này, và
     * bản gốc phát được bằng `<video src>` mà KHÔNG cần CORS. Chỉ nhận khi phần
     * còn lại tự nó đã là URL video — `playlist.m3u8` trơ trọi thì bỏ qua.
     */
    const progressiveSrc = React.useMemo(() => {
      const stripped = src.trim().replace(/\.(m3u8|mpd)$/i, '');
      return stripped !== src.trim() && isVideoUrl(stripped) ? stripped : null;
    }, [src]);

    // Gộp ref ngoài (block dùng để play/pause theo scroll) với ref trong.
    const setRef = React.useCallback(
      (el: HTMLVideoElement | null) => {
        innerRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );

    React.useEffect(() => {
      const el = innerRef.current;
      if (!el || !streaming) return;

      let destroyed = false;
      let hls: { destroy: () => void } | null = null;

      // Thử hls.js TRƯỚC, native chỉ là đường lui.
      //
      // Đừng đảo thứ tự bằng cách hỏi `canPlayType('application/vnd.apple.
      // mpegurl')`: Chrome trả "maybe" nhưng KHÔNG phát được HLS. Đo thật trên
      // Chrome 150 ngày 05/08/2026 — tin nó thì `src` được gán, hls.js bị bỏ
      // qua, và thẻ video đứng im ở readyState=0 videoWidth=0, không ném lỗi.
      const nativeFallback = () => {
        if (!destroyed && innerRef.current) innerRef.current.src = src;
      };

      void import('hls.js')
        .then(({ default: Hls }) => {
          if (destroyed || !innerRef.current) return;
          if (!Hls.isSupported()) {
            // Không có MSE (Safari/iOS cũ) — nhưng những nơi đó phát HLS native.
            nativeFallback();
            return;
          }
          const instance = new Hls({ enableWorker: false });
          instance.on(Hls.Events.ERROR, (_evt, data) => {
            if (!data.fatal || destroyed) return;
            // Hỏng không cứu được — hầu hết là CDN không gửi CORS. hls.js lấy
            // manifest bằng XHR nên bắt buộc phải có `Access-Control-Allow-
            // Origin`, trong khi `<video src>` native thì không cần. Đo thật
            // 05/08/2026: cdn.huythanhjewelry.vn không gửi header nào.
            instance.destroy();
            hls = null;
            if (progressiveSrc && innerRef.current) {
              innerRef.current.src = progressiveSrc;
            }
          });
          instance.loadSource(src);
          instance.attachMedia(innerRef.current);
          hls = instance;
        })
        .catch(nativeFallback);

      return () => {
        destroyed = true;
        hls?.destroy();
      };
    }, [src, streaming, progressiveSrc]);

    if (!isVideoUrl(src)) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} className={className} style={style} />;
    }

    return (
      <video
        ref={setRef}
        // Nguồn streaming KHÔNG gán qua `src`: hls.js gắn media qua MSE, còn
        // Safari được gán trong effect. Gán sẵn ở đây thì Chrome báo lỗi
        // "no supported source" trước khi effect kịp chạy.
        src={streaming ? undefined : src}
        className={className}
        style={style}
        {...rest}
      />
    );
  }
);
