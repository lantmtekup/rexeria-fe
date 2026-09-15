'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { gsap, MQ } from '../lib/motion';
import type { Layer } from '../lib/layers';
import {
  LIFE,
  LIFE_TOP_FADE,
  PANEL,
  SCENE_DROP,
  computeLifeFrame,
  groupLife,
  introFrameOf,
  lifeBoundsOf,
  lifeTopMask,
} from '../lib/lifeScene';
import { registerDepthLayers } from '../lib/pointer';
import { FEATURED_RISE } from './Highlights';
import LifeLayers from './LifeLayers';

// Chỉ render tile Life giao với vùng nhìn thấy được (có chừa biên chuột).
const LIFE_VISIBLE = {
  from: -LIFE.start.x / LIFE.start.scale - 200,
  to: (PANEL.w - LIFE.start.x) / LIFE.start.scale + 200,
};

/**
 * Camera intro kiểu EpicPaper (z 0 → -3 ≈ zoom 1 → 3×), ease expoScale để tốc
 * độ zoom cảm nhận đều suốt đoạn (D/(D+z) dồn độ phóng vào cuối → giật).
 */
// scale 1.93 ≈ 3^0.6: cổng giữ đúng tốc độ zoom cũ, chỉ cắt phần sau lúc
// tấm đã mờ hẳn (không ai thấy).
const CAMERA = { scale: 1.93, y: -0.036 } as const;

/**
 * Nhịp scroll của hero (đơn vị: chiều cao màn):
 *   0 → GATE_ZOOM  — zoom qua cổng, cổng mờ hẳn;
 *   → 2.3          — mép trên Highlights (margin-top -100svh) chạm đáy màn;
 *   → card ló CARD_PEEK màn — nhà dừng zoom.
 * Nhà zoom liền một mạch từ 0 tới lúc card ló, nên sau khi cổng biến mất nhà
 * vẫn phóng tiếp một đoạn rồi card mới lên.
 * Chiều cao section h-[430svh] = 230 + 100 khung sticky + 100 bàn giao.
 */
const GATE_ZOOM = 1.8;
const CARD_PEEK = 0.08;
const CRAFT_COPY = 'Craft your experience';

// Tấm Dioscuri mờ đi trong đoạn [start, start + duration] của timeline cổng.
const INTRO_FADE = { start: 0.67, duration: 0.33 } as const;

// Mouse parallax (pointer.ts): mỗi tile intro một depth — mây trên < cổng <
// đất dưới (~48px ở mép màn).
const INTRO_DEPTH = (l: Layer) =>
  l.y < PANEL.offsetY ? 0.45 : l.y === PANEL.offsetY ? 0.8 : 1.2;

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

type HeroProps = { intro: Layer[]; life: Layer[] };

export default function Hero({ intro, life }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Khung stage = bao của các tile intro; panel là tâm màn và tâm zoom.
  const frame = introFrameOf(intro);
  const { w: frameW, h: frameH, focusY } = frame;

  // Stage: bề ngang = bề ngang màn (không scale); màn dọc nới tới 80cqh để
  // khung vẫn cao hơn viewport. Tâm panel đặt đúng giữa màn.
  const stageClass = 'absolute top-1/2 left-1/2 w-[max(100cqw,80cqh)]';
  const stageStyle: CSSProperties = {
    aspectRatio: `${frameW} / ${frameH}`,
    transform: `translate(-50%, calc(-${focusY * 100}% + ${SCENE_DROP * 100}cqh))`,
  };

  const lifeBounds = lifeBoundsOf(life);

  // Mép trên tile mây Life có nét vẽ bị cắt ngang; nhìn xuyên phần trời
  // trong suốt của tấm Dioscuri là thấy một đường kẻ → mask tan dần mép trên.
  // Tính theo % stage nên mask đi cùng camera Life.
  const lifeMask = lifeTopMask(
    PANEL.offsetY + LIFE.start.y + lifeBounds.contentTop * LIFE.start.scale,
    LIFE_TOP_FADE * LIFE.start.scale,
    frameH
  );

  const lifeGroups = groupLife(
    life,
    l => l.x < LIFE_VISIBLE.to && l.x + l.w > LIFE_VISIBLE.from
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const q = <T extends Element>(sel: string) => section.querySelector<T>(sel);
    const reveal = q<HTMLElement>('[data-reveal]');
    const camera = q<HTMLElement>('[data-camera]');
    const introEl = q<HTMLElement>('[data-intro]');
    const sticky = q<HTMLElement>('[data-hero-sticky]');
    const lifeCam = q<HTMLElement>('[data-life-cam]');
    const lifeStage = q<HTMLElement>('[data-life-stage]');
    const lifeEl = q<HTMLElement>('[data-life]');
    const craft = q<HTMLElement>('[data-line="craft"]');
    const explore = q<HTMLElement>('[data-line="explore"]');
    const exploreWrap = q<HTMLElement>('[data-explore-wrap]');
    const craftChars = gsap.utils.toArray<HTMLElement>(
      '[data-craft-char]',
      section
    );
    const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', section);
    if (
      !reveal ||
      !camera ||
      !introEl ||
      !sticky ||
      !lifeCam ||
      !lifeStage ||
      !lifeEl ||
      !craft ||
      !explore ||
      !exploreWrap ||
      craftChars.length === 0
    )
      return;

    const reduce = window.matchMedia(MQ.reduce).matches;

    const ctx = gsap.context(() => {
      gsap.set(craft, { autoAlpha: 1 });
      gsap.set(craftChars, { autoAlpha: 0 });
      gsap.set(explore, { yPercent: 60, autoAlpha: 0 });
      // Artwork chỉ fade + thu nhẹ. Chuyển động chủ đạo dành cho typography.
      gsap.set(reveal, { autoAlpha: 0, scale: 1.06 });

      // ── 1–2. Chữ → artwork → "Scroll to explore" ─────────────────────
      // Khoá scroll bằng chặn input, KHÔNG dùng overflow:hidden — bật/tắt
      // overflow làm scrollbar ẩn/hiện (đổi bề ngang → ScrollTrigger refresh)
      // và dồn momentum trackpad bắn ra ngay lúc mở khoá → trang giật.
      // Capture trên window + stopImmediatePropagation: chạy trước listener
      // wheel của Lenis (Lenis tạo sau, trong effect của provider).
      const SCROLL_KEYS = new Set([
        'ArrowDown',
        'ArrowUp',
        'PageDown',
        'PageUp',
        'Home',
        'End',
        ' ',
      ]);
      const skip = () => {
        if (introTl.progress() < 1) introTl.timeScale(4);
      };
      const block = (e: Event) => {
        if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        skip();
      };
      const lockOpts = { capture: true, passive: false } as const;
      let locked = false;
      const unlock = () => {
        if (!locked) return;
        locked = false;
        window.removeEventListener('wheel', block, lockOpts);
        window.removeEventListener('touchmove', block, lockOpts);
        window.removeEventListener('keydown', block, lockOpts);
      };

      // Ký tự hiện tuần tự bằng opacity, không trượt. Artwork giữ chuyển động
      // nền tối thiểu để bàn giao sang cảnh scroll mà không bị bật hình.
      const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      introTl
        .addLabel('craftIn', 0.15)
        .to(
          craftChars,
          {
            autoAlpha: 1,
            duration: 0.5,
            stagger: { each: 0.03, from: 'start' },
          },
          'craftIn'
        )
        .addLabel('reveal', 1.35)
        .to(
          craft,
          {
            autoAlpha: 0,
            duration: 0.45,
            ease: 'sine.inOut',
          },
          'reveal'
        )
        .to(
          reveal,
          {
            autoAlpha: 1,
            duration: 1.3,
            ease: 'sine.out',
          },
          'reveal-=0.2'
        )
        .to(
          reveal,
          { scale: 1, duration: 1.8, ease: 'expo.out' },
          'reveal-=0.2'
        )
        .addLabel('cueIn', 2.35)
        .to(explore, { yPercent: 0, autoAlpha: 1, duration: 0.8 }, 'cueIn')
        // Mở scroll cùng lúc "Scroll to explore" xuất hiện.
        .call(unlock, undefined, 'cueIn');

      if (reduce || window.scrollY > 0) {
        // Reload giữa trang / reduced motion: vào thẳng trạng thái cuối.
        introTl.progress(1);
      } else {
        locked = true;
        window.addEventListener('wheel', block, lockOpts);
        window.addEventListener('touchmove', block, lockOpts);
        window.addEventListener('keydown', block, lockOpts);
      }

      // ── 3. Scroll → zoom qua cổng → fade intro ──────────────────────
      // Hai camera độc lập: intro zoom 3×, Life zoom tới khung cuối và trượt
      // tâm theo. scrub: true — Lenis đã làm mượt wheel.

      // Khung cuối Life tính theo kích thước màn thật (đo lại mỗi refresh) —
      // công thức dùng chung với LifeJourney để khung dừng trùng khít.
      const lifeView = { S1: 1, x1: 0, y1: 0 };
      const measureLife = () => {
        const f = computeLifeFrame({
          W: window.innerWidth,
          H: window.innerHeight,
          stageW: lifeStage.offsetWidth,
          stickyW: sticky.offsetWidth,
          stickyH: sticky.offsetHeight,
          bounds: lifeBounds,
          frame,
        });
        lifeView.S1 = f.S1;
        lifeView.x1 = f.x1;
        lifeView.y1 = f.y1;
      };
      measureLife();

      // Tiến trình tuyến tính → scale mũ (tốc độ zoom cảm nhận đều, như
      // expoScale); dịch tỉ lệ theo phần zoom đã đi nên tâm trượt cùng nhịp.
      const lifeProgress = { t: 0 };
      const setLifeCam = gsap.quickSetter(lifeCam, 'css');
      const renderLife = () => {
        const { S1, x1, y1 } = lifeView;
        const t = lifeProgress.t;
        const scale = Math.pow(S1, t);
        const g = Math.abs(S1 - 1) < 1e-4 ? t : (scale - 1) / (S1 - 1);
        setLifeCam({ scale, x: x1 * g, y: y1 * g });
      };
      renderLife();

      // Quãng cuộn tới lúc card nổi bật ló CARD_PEEK màn. Tính bằng layout
      // (offsetTop không dính transform). Sau mốc bàn giao thêm d px cuộn:
      //   đỉnh card trên màn = H − d + pad + RISE·H·(1 − d/H)
      // (card đang trồi, xem Highlights) → đặt = (1 − PEEK)·H rồi giải d.
      const featured = document.querySelector<HTMLElement>(
        '#highlights [data-featured]'
      );
      const zoomEnd = () => {
        const handoff = section.offsetHeight - 2 * sticky.offsetHeight;
        if (!featured) return handoff;
        const H = window.innerHeight;
        const d =
          (featured.offsetTop + (FEATURED_RISE + CARD_PEEK) * H) /
          (1 + FEATURED_RISE);
        return handoff + d;
      };

      // Nhà: zoom suốt từ đầu tới lúc card ló — cổng mờ hẳn ở GATE_ZOOM thì
      // nhà vẫn còn phóng tiếp một đoạn trước khi card xuất hiện.
      gsap.to(lifeProgress, {
        t: 1,
        ease: 'none',
        onUpdate: renderLife,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${zoomEnd()}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measureLife();
            renderLife();
          },
        },
      });

      // Cổng: zoom + mờ trong GATE_ZOOM × chiều cao khung sticky (h-svh,
      // khớp svh trên mobile khi thanh địa chỉ co giãn).
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${GATE_ZOOM * sticky.offsetHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          camera,
          { scale: 1, y: 0 },
          {
            scale: CAMERA.scale,
            y: () => CAMERA.y * window.innerHeight,
            duration: 1,
            ease: `expoScale(1, ${CAMERA.scale})`,
          },
          0
        )
        // Cuối đoạn: tấm Dioscuri alpha → 0, cảnh sau lỗ rõ hẳn.
        .fromTo(
          introEl,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            duration: INTRO_FADE.duration,
            immediateRender: false,
          },
          INTRO_FADE.start
        )
        .fromTo(
          lifeEl,
          { opacity: LIFE.alpha },
          { opacity: 1, duration: INTRO_FADE.duration, immediateRender: false },
          INTRO_FADE.start
        );

      // "Scroll to explore" tan đi ngay trong ~15% màn cuộn đầu tiên. Ghi lên
      // wrapper — chữ bên trong đang do intro timeline giữ yPercent.
      gsap.fromTo(
        exploreWrap,
        { autoAlpha: 1, y: 0 },
        {
          autoAlpha: 0,
          y: -16,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${sticky.offsetHeight * 0.15}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // ── 4. Bàn giao: Highlights trồi lên, hero mờ về màu nền ─────────
      const next = document.querySelector<HTMLElement>('#highlights');
      if (next) {
        gsap.fromTo(
          sticky,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 35%',
              scrub: true,
            },
          }
        );
      }

      return unlock;
    }, section);

    // ── Mouse parallax (con trỏ dùng chung, xem pointer.ts) ───────────
    const unregister = registerDepthLayers(layers);

    return () => {
      unregister();
      ctx.revert();
    };
  }, [frameW]);

  return (
    <section ref={sectionRef} className='relative h-[430svh] bg-[#F8F8F6]'>
      <div
        data-hero-sticky
        className='[container-type:size] sticky top-0 h-svh w-full overflow-hidden bg-[#F8F8F6]'
      >
        {/* Reveal — chỉ intro timeline đụng vào (opacity cả cảnh).
            mix-blend-multiply: nền PNG trắng tuyền → nhân với nền #F8F8F6
            thành đúng màu nền, nên không lộ mảng trắng quanh lỗ cổng hay ở
            mép khi parallax đẩy tile ra khỏi khung. Đặt trên cả nhóm (không
            đặt từng ảnh — wrapper transform/opacity bên trong cô lập blend).
            Nền phải nằm trên chính sticky: container-type tạo stacking
            context riêng, blend không nhìn thấy nền của section. */}
        <div
          data-reveal
          className='pointer-events-none invisible absolute inset-0 opacity-0 mix-blend-multiply'
        >
          {/* Life — phía sau. Camera riêng (scroll) → stage → opacity →
              nhóm (mouse depth). Mỗi lớp giữ một thuộc tính, không giành. */}
          <div data-life-cam className='absolute inset-0 will-change-transform'>
            <div data-life-stage className={stageClass} style={stageStyle}>
              <div
                data-life
                className='absolute inset-0'
                style={{
                  opacity: LIFE.alpha,
                  maskImage: lifeMask,
                  WebkitMaskImage: lifeMask,
                }}
              >
                <LifeLayers
                  groups={lifeGroups}
                  priority
                  place={l => ({
                    left: pct(LIFE.start.x + l.x * LIFE.start.scale, frameW),
                    top: pct(
                      PANEL.offsetY + LIFE.start.y + l.y * LIFE.start.scale,
                      frameH
                    ),
                    width: pct(l.w * LIFE.start.scale, frameW),
                  })}
                />
              </div>
            </div>
          </div>

          {/* Intro — phía trước, camera kiểu EpicPaper. */}
          <div data-camera className='absolute inset-0 will-change-transform'>
            <div className={stageClass} style={stageStyle}>
              <div data-intro className='absolute inset-0'>
                {intro.map(l => (
                  <div
                    key={l.src}
                    data-depth={INTRO_DEPTH(l)}
                    className='absolute inset-0'
                  >
                    {/* Dải mây trên trong suốt gần hết → Life (scale 1, cao
                        hơn) lộ tán cây qua trời rồi bị tile cổng cắt ngang.
                        Lót nền đặc sau dải này; nằm trong data-intro nên mờ
                        cùng cổng. Lấn xuống 8 đơn vị để lệch parallax giữa
                        hai tile không hở khe. */}
                    {l.y < PANEL.offsetY && (
                      <div
                        aria-hidden
                        className='absolute bg-white'
                        style={{
                          left: pct(l.x, frameW),
                          top: pct(l.y, frameH),
                          width: pct(l.w, frameW),
                          height: pct(l.h + 8, frameH),
                        }}
                      />
                    )}
                    <Image
                      key={l.src}
                      src={l.src}
                      alt={l.y === PANEL.offsetY ? 'Dioscuri — Protect' : ''}
                      width={l.w}
                      height={l.h}
                      priority
                      sizes='(max-width: 767px) 220vw, 100vw'
                      className='absolute block h-auto max-w-none select-none'
                      style={{
                        left: pct(l.x, frameW),
                        top: pct(l.y, frameH),
                        width: pct(l.w, frameW),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Craft hiện bằng opacity; Scroll giữ nhịp trượt lên như bản gốc. */}
        <div className='pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center'>
          <div className='overflow-hidden px-4 py-[0.45em] [grid-area:1/1]'>
            <p
              data-line='craft'
              className='font-ui invisible text-[13px] leading-none font-light tracking-[0.24em] text-neutral-800 uppercase md:text-[15px]'
            >
              <span className='sr-only'>{CRAFT_COPY}</span>
              <span aria-hidden className='inline-flex whitespace-nowrap'>
                {CRAFT_COPY.split('').map((character, index) => (
                  <span
                    key={`${character}-${index}`}
                    data-craft-char
                    className='inline-block'
                  >
                    {character === ' ' ? '\u00A0' : character}
                  </span>
                ))}
              </span>
            </p>
          </div>
          <div data-explore-wrap className='[grid-area:1/1]'>
            <p
              data-line='explore'
              className='font-ui invisible rounded-full bg-white px-3.5 py-1.5 text-[12px] leading-none font-light tracking-[0.22em] text-neutral-800 uppercase md:text-[14px]'
            >
              Scroll to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
