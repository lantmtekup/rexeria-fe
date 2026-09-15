import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Layer } from '../lib/layers';
import type { LifeGroup } from '../lib/lifeScene';

type LifeLayersProps = {
  groups: LifeGroup[];
  /** Vị trí mỗi ảnh — Hero đặt theo % stage intro, Journey theo % panel. */
  place: (layer: Layer) => CSSProperties;
  /** Hero: ảnh trên màn đầu → priority. Journey: ngoài màn nhưng phải có
      sẵn trước khi lướt tới (lazy sẽ bật ảnh giữa lúc trượt) → eager. */
  priority?: boolean;
};

// Cùng một `sizes` ở mọi nơi dùng → cùng URL /_next/image → ảnh đã tải ở
// Hero được dùng lại ngay ở Journey, không nháy.
const SIZES = '(max-width: 767px) 220vw, 110vw';

/**
 * Các nhóm lớp Life, mỗi nhóm ba lớp bọc — mỗi lớp giữ một thuộc tính để
 * các animation không giành transform của nhau:
 *   data-pan   — x khi lướt ngang (Journey)
 *   data-depth — x/y mouse parallax (pointer.ts)
 *   data-drift — trôi nhẹ của mây (Journey)
 */
export default function LifeLayers({
  groups,
  place,
  priority,
}: LifeLayersProps) {
  return groups.map(g => (
    <div key={g.key} data-pan={g.key} className='absolute inset-0'>
      <div data-depth={g.depth} className='absolute inset-0'>
        <div data-drift={g.key} className='absolute inset-0'>
          {g.layers.map(l => (
            <Image
              key={l.src}
              src={l.src}
              alt=''
              width={l.w}
              height={l.h}
              priority={priority}
              loading={priority ? undefined : 'eager'}
              sizes={SIZES}
              data-layer-x={l.x}
              className='absolute block h-auto max-w-none select-none'
              style={place(l)}
            />
          ))}
        </div>
      </div>
    </div>
  ));
}
