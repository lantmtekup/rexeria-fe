'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '@/components/ScrollReveal';

const TITLE = 'Citizen L Arcly Nữ';

const PARA_1 =
  'Đồng Hồ Citizen L Arcly Nữ Dây Kim Loại là sự kết hợp hoàn hảo giữa thiết kế thanh lịch, hiện đại và công nghệ tiên tiến, mang đến một lựa chọn tuyệt vời cho phái đẹp yêu thích sự sang trọng và tinh tế. Các chi tiết trên mặt đồng hồ, từ vạch chỉ giờ đến kim đồng hồ, đều được chế tác tỉ mỉ, mang đến sự rõ ràng và dễ dàng quan sát thời gian.';

const PARA_2 =
  'Với thiết kế thanh lịch và thời thượng, chiếc đồng hồ này không chỉ là sự lựa chọn lý tưởng cho phái đẹp yêu thích sự sang trọng mà còn là món phụ kiện lý tưởng cho những người phụ nữ hiện đại, yêu thích sự thanh lịch và đẳng cấp.';

// Pin while text reveals — scroll only advances the timeline until every
// block finishes; then pin releases and the next section can enter.
export default function DetailsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>('.scroll-reveal', root);
      if (!blocks.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          // ~2 viewports of scrub room so title → para1 → para2 finish
          // before the pin releases into ProductVariantSection.
          end: () => `+=${Math.round(window.innerHeight * 2)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      });

      blocks.forEach((block, index) => {
        const words = block.querySelectorAll('.word');
        // Block N starts only after block N-1 fully finishes.
        const at = index === 0 ? 0 : '>';

        // Soft settle — tilt eases upright while words scrub in
        tl.to(block, { rotate: 0, duration: 1.15, ease: 'power1.out' }, at);

        if (words.length) {
          tl.to(
            words,
            {
              opacity: 1,
              filter: 'blur(0px)',
              stagger: 0.04,
              duration: 1,
              ease: 'none',
            },
            '<' // same window as this block's rotate
          );
          // Hold so the finished line reads before the next begins
          tl.to({}, { duration: 0.35 });
        }
      });
    }, root);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      id='description'
      ref={sectionRef}
      className='details relative flex min-h-svh items-center bg-white px-6 py-20 md:py-28'
    >
      <div className='mx-auto w-full max-w-5xl text-center'>
        <ScrollReveal
          animate={false}
          as='h1'
          containerClassName='mb-8 md:mb-14'
          textClassName='text-4xl font-light leading-[1.3] tracking-tight text-balance break-keep text-[#003468] sm:text-5xl sm:leading-[1.28] md:text-7xl md:leading-[1.25] lg:text-8xl lg:leading-[1.22]'
          baseOpacity={0}
          baseRotation={2.5}
          blurStrength={8}
        >
          {TITLE}
        </ScrollReveal>

        <ScrollReveal
          animate={false}
          as='p'
          containerClassName='mb-8 md:mb-12'
          textClassName='text-lg font-light leading-[1.7] tracking-tight text-neutral-800 sm:text-xl sm:leading-[1.7] md:text-3xl md:leading-[1.65]'
          baseOpacity={0}
          baseRotation={2}
          blurStrength={6}
        >
          {PARA_1}
        </ScrollReveal>

        <ScrollReveal
          animate={false}
          as='p'
          textClassName='text-lg font-light leading-[1.7] tracking-tight text-neutral-700 sm:text-xl sm:leading-[1.7] md:text-3xl md:leading-[1.65]'
          baseOpacity={0}
          baseRotation={2}
          blurStrength={6}
        >
          {PARA_2}
        </ScrollReveal>
      </div>
    </section>
  );
}
