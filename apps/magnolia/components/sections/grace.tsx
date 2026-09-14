'use client';
import { useRef } from 'react';
import Image from 'next/image';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useSmoothProgress } from '@/components/shared/use-smooth-progress';

/** Spec §7 — local data; the i18n `grace.subtitle` is intentionally not used. */
const frames: { image: string; title?: string; subtitle: string }[] = [
  {
    image: '/images/assets/grace/stair-01.webp',
    title: 'Effortless Grace',
    subtitle: 'Phong vị sống thương gia',
  },
  {
    image: '/images/assets/grace/stair-02.webp',
    title: undefined,
    subtitle: 'Khi chuẩn xác trở thành thước đo của cảm giác',
  },
  {
    image: '/images/assets/grace/stair-04.webp',
    title: undefined,
    subtitle: 'Phong cách sống cũng cần một "hạng" tương xứng',
  },
];

const N = frames.length;

/** Image opacity keyframes: first `[0, u−0.09, min(1,u+0.09)]`, last `[max(0,m−0.09), m+0.09, 1]`, middle `[max(0,m−0.09), m+0.09, 0.6, 0.64]`. */
function imageOpacityRange(i: number): { input: number[]; output: number[] } {
  const m = i / N;
  const u = (i + 1) / N;
  if (i === 0)
    return { input: [0, u - 0.09, Math.min(1, u + 0.09)], output: [1, 1, 0] };
  if (i === N - 1)
    return { input: [Math.max(0, m - 0.09), m + 0.09, 1], output: [0, 1, 1] };
  return {
    input: [Math.max(0, m - 0.09), m + 0.09, 0.6, 0.64],
    output: [0, 1, 1, 0],
  };
}

/**
 * Nhịp chữ: mỗi câu VÀO TỪ DƯỚI, trôi lên trong lúc hiện, rồi đi tiếp lên và
 * tan — một luật duy nhất cho cả ba câu.
 *
 * Bản trước mỗi câu một luật khác nhau, và câu cuối là `[36, 21, 21, 36]`:
 * nó đi xuống 36 rồi lên 21 rồi quay về 36, tức về đúng chỗ cũ. Kết quả là
 * câu quan trọng nhất của đoạn trông như đứng yên. `yOut` giờ đơn điệu giảm
 * nên chữ không bao giờ lùi lại.
 */
function captionRanges(i: number): {
  opacityIn: number[];
  yIn: number[];
  yOut: number[];
} {
  const l = i / N;
  const m = (i + 1) / N;
  const span = m - l;
  // Câu đầu vào ngay từ đầu đoạn; câu cuối giữ lâu hơn rồi mới tan.
  const start = i === 0 ? 0 : l;
  const end = i === N - 1 ? 1 : m;
  const inAt = l + span * 0.26;
  const outAt = m - span * (i === N - 1 ? 0.1 : 0.26);
  return { opacityIn: [start, inAt, outAt, end], yIn: [start, inAt, outAt, end], yOut: [38, 0, -16, -52] };
}

type FrameProps = {
  frame: (typeof frames)[number];
  index: number;
  p: MotionValue<number>;
  e: MotionValue<number>;
  reduced: boolean;
};

function GraceImage({ frame, index, p, e, reduced }: FrameProps) {
  const isFirst = index === 0;
  const isLast = index === N - 1;
  const { input, output } = imageOpacityRange(index);
  const opacityP = useTransform(p, input, output);
  const scaleE = useTransform(e, [0, 1], [0.7, 1]);
  const scaleP = useTransform(p, [0.9, 1], [1, 0.7]);
  const radiusP = useTransform(p, [0.9, 1], ['0px', '18px']);

  const opacity = reduced ? (isFirst ? 1 : 0) : opacityP;
  const scale = reduced ? 1 : isFirst ? scaleE : isLast ? scaleP : 1;
  const borderRadius = isFirst
    ? '18px'
    : isLast
      ? reduced
        ? '0px'
        : radiusP
      : 0;

  return (
    <motion.div
      key={frame.image}
      aria-hidden
      style={{ opacity, scale, borderRadius }}
      className={`absolute inset-0 origin-center overflow-hidden ${isLast ? 'z-20' : 'z-0'}`}
    >
      <Image
        src={frame.image}
        alt=''
        fill
        sizes='100vw'
        quality={92}
        className='object-cover'
      />
    </motion.div>
  );
}

function GraceCaption({ frame, index, p, reduced }: Omit<FrameProps, 'e'>) {
  const { opacityIn, yIn, yOut } = captionRanges(index);
  const capOpacity = useTransform(p, opacityIn, [0, 1, 1, 0]);
  const capY = useTransform(p, yIn, yOut);
  const { title, subtitle } = frame;

  return (
    <motion.div
      key={frame.image}
      style={{
        opacity: reduced ? (index === 0 ? 1 : 0) : capOpacity,
        y: reduced ? 0 : capY,
      }}
      className='absolute flex max-w-[90vw] flex-col items-center'
    >
      {title && (
        <h2 className='font-display text-ivory text-[clamp(2.6rem,9.4vw,10rem)] leading-[0.86] tracking-[-0.055em]'>
          {title}
        </h2>
      )}
      {/*
       * The standalone lines used to be `text-5xl whitespace-nowrap` — a fixed 48 px on one
       * unbreakable line. On a 390 px phone that measured 1023 px and 1082 px wide, two and
       * three quarters of the screen, so both ended up sliced at either edge with the middle
       * of a Vietnamese sentence showing. They are now allowed to wrap, and the size is a
       * clamp that reaches the original 48 px from about 1140 px up.
       */}
      <p className={title ? 'mt-10' : undefined}>
        <span
          className={
            title
              ? 'font-display text-champagne-200 text-[clamp(1.1rem,1.8vw,2rem)] leading-none tracking-[0.01em]'
              : 'font-display text-champagne-200 text-[clamp(1.5rem,4.2vw,3rem)] leading-[1.15] tracking-[0.01em]'
          }
        >
          {subtitle}
        </span>
      </p>
    </motion.div>
  );
}

export function GraceSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Pinned range (300vh track).
  const { scrollYProgress: rawP } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const p = useSmoothProgress(rawP);
  // Entrance: 0 when section top hits viewport bottom, 1 when it reaches top.
  const { scrollYProgress: rawE } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });
  const e = useSmoothProgress(rawE);

  const entranceVeil = useTransform(e, [0, 1], [0, 0.5]);
  const endFade = useTransform(p, [0.86, 0.9, 1], [0, 1, 1]);

  return (
    <section
      id='grace'
      ref={ref}
      className='text-ivory bg-charcoal-950 relative h-[300vh] snap-start'
    >
      <div className='bg-charcoal-950 sticky top-0 h-[100svh] overflow-hidden'>
        {frames.map((frame, i) => (
          <GraceImage
            key={frame.image}
            frame={frame}
            index={i}
            p={p}
            e={e}
            reduced={reduced}
          />
        ))}
        <motion.div
          aria-hidden
          style={{ opacity: reduced ? 0 : endFade }}
          className='bg-charcoal-950 pointer-events-none absolute inset-0 z-10'
        />
        <motion.div
          aria-hidden
          style={{ opacity: reduced ? 0.5 : entranceVeil }}
          className='bg-charcoal-950 pointer-events-none absolute inset-0 z-30'
        />
        <div className='relative z-40 flex h-full items-center justify-center px-6 text-center'>
          {frames.map((frame, i) => (
            <GraceCaption
              key={frame.image}
              frame={frame}
              index={i}
              p={p}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
