'use client';

import { useTranslations } from 'next-intl';

import { ROLE_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceLayer } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type LayerStackProps = {
  layers: ExperienceLayer[];
  className?: string;
};

/**
 * Chồng block người mua đi xuống — prototype `.stack` / `.slay` (~L4382).
 *
 * Mỗi block một thẻ trắng, so le trái–phải để đọc ra chiều đi xuống, in VAI
 * (khi có) và TÊN block. Bản trước là 5 thanh bo tròn `aria-hidden` không chữ:
 * đúng cho ảnh bìa thẻ, nhưng ở màn chi tiết nó chiếm một phần ba khung mà
 * không nói gì.
 *
 * `role` null là chuyện thường — canvas soạn ở trình dựng trang không gán vai
 * phễu, và 99/100 bản ghi rơi vào diện đó. Khi ấy thẻ vẫn vẽ, chỉ không có
 * dòng vai; đừng gán bừa một vai để lấp chỗ trống.
 */
export const LayerStack = ({ layers, className }: LayerStackProps) => {
  const t = useTranslations('portalV2.experiences');

  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-2 overflow-hidden rounded-[18px] px-4 py-[18px]',
        'bg-[linear-gradient(135deg,var(--pv2-electric),var(--pv2-violet))]',
        'shadow-[0_18px_40px_rgba(26,23,37,0.16)]',
        className
      )}
    >
      {layers.map((layer, i) => {
        const role = layer.role ? ROLE_STYLE[layer.role] : null;
        return (
          <div
            key={`${layer.blockType ?? layer.name}-${i}`}
            className={cn(
              'rounded-[11px] bg-white/95 px-3 py-2.5 shadow-[0_6px_18px_rgba(26,23,37,0.16)]',
              // So le: lẻ thụt phải, chẵn thụt trái — prototype `.slay:
              // nth-child(odd|even)`.
              i % 2 === 0 ? 'mr-5' : 'ml-5',
              // Block bị ẩn thì trang thật không hiện nó; đừng vẽ như block
              // đang chạy.
              !layer.visible && 'opacity-55'
            )}
          >
            {role ? (
              <p
                className='text-[8.5px] font-bold tracking-[0.07em] uppercase'
                style={{ color: role.fg }}
              >
                {t(role.labelKey)}
              </p>
            ) : null}
            <p className='truncate font-[family-name:var(--pv2-disp)] text-[13px] font-bold text-[var(--pv2-ink)]'>
              {layer.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};
