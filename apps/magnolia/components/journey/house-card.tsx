'use client';
import Image from 'next/image';

/**
 * Thẻ theo đúng hệ của trang — lấy từ `media-panel-track.tsx` (MediaPanelCard),
 * vốn port từ block `west72_showcase` của rexerai.
 *
 * Hệ thẻ của Magnolia là: ẢNH FULL-BLEED + một tấm IVORY neo vào góc dưới
 * phải, chip trên nền `clay-600`, tiêu đề `clay-600` chữ hoa, thân chữ
 * `charcoal-950`, CTA gạch chân chữ hoa. Không phải hộp tối viền xám.
 *
 * Tôi đã từng làm ngược: hộp `bg-charcoal-900` viền `charcoal-700` với chữ
 * champagne. Nó lệch tông cả trang vì đó là hệ đảo của hệ nhà — và đúng một
 * hệ nhà đó là thứ khiến mọi panel ảnh trên trang đọc như cùng một chất liệu.
 *
 * Khác bản gốc một điểm bắt buộc: bản gốc là panel 100vw nên mọi cỡ chữ đặt
 * theo `vw`. Trong một ô lưới rộng ~392 px thì `vw` sai hoàn toàn, nên ở đây
 * cỡ chữ là px cố định — giữ nguyên MÀU, HÌNH và CHỮ HOA, chỉ đổi thang.
 */
export function HouseCard({
  src,
  title,
  body,
  chip,
  cta,
  onOpen,
  aspect = '1176 / 936',
  eager = false,
}: {
  src: string;
  title: string;
  body?: string;
  chip?: string;
  cta?: string;
  onOpen: () => void;
  aspect?: string;
  eager?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={cta ? `${cta}: ${title}` : title}
      className='group relative block w-full overflow-hidden text-left'
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={src}
        alt={title}
        fill
        priority={eager}
        sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 460px'
        className='ease-luxe object-cover transition-transform duration-700 group-hover:scale-[1.04]'
      />
      {/* Cùng scrim với mọi panel ảnh khác của trang. */}
      <span aria-hidden className='bg-panel-scrim absolute inset-0' />

      <span className='bg-ivory absolute right-0 bottom-0 z-10 flex w-[86%] flex-col p-5 sm:p-6'>
        {chip && (
          <span className='font-display text-ivory bg-clay-600 w-fit px-2.5 py-1.5 text-[11px] leading-none font-medium uppercase'>
            {chip}
          </span>
        )}
        <span
          className='font-display text-clay-600 mt-3 block w-fit font-medium uppercase'
          style={{ fontSize: 'clamp(19px, 1.6vw, 26px)', lineHeight: 0.92 }}
        >
          {title}
        </span>
        {body && (
          <span className='text-charcoal-950 mt-3 block text-[12.5px] leading-[1.56]'>
            {body}
          </span>
        )}
        {cta && (
          <span className='border-charcoal-950/30 tracking-luxe text-charcoal-950 group-hover:border-charcoal-950 mt-4 inline-flex w-fit items-center gap-2 border-b pb-1 text-[10px] uppercase transition-colors'>
            {cta}
            <span aria-hidden>→</span>
          </span>
        )}
      </span>
    </button>
  );
}
