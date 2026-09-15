import { MainShell } from '@/components/shared/main-shell';
import { HeroSection } from '@/components/sections/hero';
import { HeritageSection } from '@/components/sections/heritage';
import { JourneyChapter } from '@/components/journey/journey-chapter';
import { ApertureGate } from '@/components/journey/aperture-gate';
import { ClosingAperture } from '@/components/journey/closing-aperture';
import { AmenitiesGrid } from '@/components/sections/amenities-grid';
import { TourFrame } from '@/components/sections/tour-frame';
import { ResidencesGrid } from '@/components/sections/residences-grid';
import { GalleryIntro } from '@/components/sections/gallery';
import { GraceSection } from '@/components/sections/grace';
import { ConsultationSection } from '@/components/sections/consultation';
import { BlockInspector } from '@/components/dev/block-inspector';
import {
  ARRIVAL_CHAPTER,
  ARRIVAL_GROUPS,
  DAY_CHAPTER,
  DAY_GROUPS,
} from '@/lib/journey/chapters';

/**
 * Trang là một hành trình liên tục, không phải một chuỗi ảnh xếp cạnh nhau.
 *
 * Giữ nguyên: preloader, phim mở màn 286 frame, header (mark + wordmark, mode
 * tabs, đổi ngôn ngữ, âm thanh), toàn bộ nội dung VI/EN trong `lib/i18n.ts`,
 * phim `grace-scroll.mp4`, tour 360°, và mọi section nội dung sẵn có.
 *
 * Đổi hai nhịp vốn là "chuỗi ảnh" thành chương lướt ngang nhiều lớp:
 *   - 5 panel tiện ích (pinned horizontal track) → chương SẢNH ĐÓN, rồi nội
 *     dung 5 tiện ích trồi lên đè lên cảnh dưới dạng lưới card;
 *   - stack cross-fade hành trình một ngày → chương MỘT NGÀY, nơi thời gian
 *     nằm trên trục ngang: cuộn sang phải là mặt trời đi từ sáng tới tối,
 *     thay vì bốn lần chớp mắt.
 *
 * Mỗi chương ghim một khung màn và trôi 4 lớp ở 4 tốc độ; khối nội dung ngay
 * sau nó mang `-mt-100svh` nên TRỒI LÊN ĐÈ lên cảnh còn đang ghim, và cảnh tự
 * mờ đi theo. Đó là thứ làm cả trang đọc ra một mạch thay vì từng section.
 *
 * `horizontal-slide.tsx`, `units.tsx`, `interactive-tour.tsx` và
 * `GallerySection` không còn được dùng
 * nhưng vẫn nằm trong repo để còn đối chiếu được với bản trước.
 */
export default function Page() {
  return (
    <MainShell>
      <HeroSection />

      {/* Khung cửa: camera phóng xuyên lòng vòm vào cảnh phía sau, rồi tấm
          vòm tan. Thay cho outro thu-vào-card của phim. */}
      <ApertureGate
        behindSrc='/journey/gate/behind-interior.jpg'
        behindAlt='The Magnolia'
      />

      {/* z-10 trên mọi khối nội dung đứng TRƯỚC một chương.
          Chương mang `-mt-100svh` nên nó lấn lên một màn cuối của khối trước;
          khung sticky của nó có nền than đặc, nên nếu khối trước không có
          z-index thì nó bị phủ đen đúng một màn. Trang mẫu đặt z-10 cho mọi
          section nội dung vì lý do này. */}
      <div className='relative z-10'>
        <HeritageSection />
      </div>

      <JourneyChapter
        panel={ARRIVAL_CHAPTER}
        groups={ARRIVAL_GROUPS}
        prevSelector='#heritage'
        nextSelector='#amenities'
      />
      <AmenitiesGrid />

      <TourFrame />
      <div className='relative z-10'>
        <ResidencesGrid />
      </div>

      <JourneyChapter
        panel={DAY_CHAPTER}
        groups={DAY_GROUPS}
        prevSelector='#units'
        nextSelector='#gallery-intro'
      />
      {/* Statement trên phim scrub — khối nội dung đầu tiên sau chương Một
          ngày, nên nó là thứ trồi lên đè lên cảnh. */}
      <div id='gallery-intro' className='relative z-10 -mt-[100svh]'>
        <GalleryIntro />
      </div>

      <GraceSection />

      {/* Cảnh kết: bậc thang vừa rời lùi ra sau, tấm vòm tới từ gần và đóng
          hành trình lại đúng cái ngưỡng nó đã mở ra. */}
      <ClosingAperture />

      <ConsultationSection />
      <BlockInspector />
    </MainShell>
  );
}
