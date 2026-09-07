'use client';

/**
 * Le Cool Move Crown Traveler — port từ apps/ecommerce-landing CrownTraveler.tsx.
 *
 * Chrome TOÀN TRANG, không phải section: block này gần như không chiếm chỗ
 * (`h-0`), chỉ portal ra một vương miện `position: fixed` rồi cho nó bay lần
 * lượt qua mọi `[data-crown-slot]` có trên trang. Trong lúc bay, các vương miện
 * tĩnh của những block kia bị ẩn.
 *
 * Thứ tự điểm dừng = thứ tự slot trong DOM, không khai bằng content: block nào
 * có slot (`lecool_hero`, `lecool_story`, `lecool_showcase`, `lecool_collection`,
 * `lecool_inspiration`, `lecool_footer`) mà nằm trên trang là tự vào tuyến bay.
 *
 * ── Khác apps (đọc kỹ trước khi so sánh với prototype) ──
 * apps định nghĩa CỨNG từng chặng theo selector `#story` / `#showcase` /
 * `footer`, kèm một chặng tính riêng theo chiều cao pin của Showcase. Host thì
 * author xếp block tuỳ ý nên không thể chốt selector; ở đây mỗi chặng suy ra
 * theo quy tắc chung:
 *
 * - Bình thường: chặng i chạy từ lúc section chứa slot i+1 chạm mép dưới khung
 *   nhìn tới khi nó lên tới vạch header (`top top+=72`) — đúng như 4/5 chặng
 *   của apps.
 * - Ngoại lệ: slot nào tự khai `data-crown-exit="early"` VÀ nằm trong track dài
 *   hơn 1.5 màn (pin/scrub) thì chặng rời nó bắt đầu sớm, ở 30%→46% quãng cuộn
 *   của track, ease `power2.in`. Đây chính là lý do apps phải viết tay chặng
 *   `collection` — vương miện phải rời cột giữa Showcase TRƯỚC khi logo card 2
 *   fade vào, nếu không sẽ đè lên nhau. Chỉ `lecool_showcase` khai cờ này.
 *
 * Ngoài ra: `window` scroll → `scroller` của LandingMotion; class ẩn vương miện
 * tĩnh đặt trên `scroller ?? documentElement` chứ không phải `<html>` (editor có
 * nhiều khung preview, đặt lên html sẽ rò sang khung khác).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type { LecoolCrownTravelerContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { LECOOL_BODY_FONT, LECOOL_HEADER_H, LECOOL_PAPER } from './lecoolTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

/** `@4xl` — dưới mốc này giữ vương miện tĩnh, không bay (như `lg:` của apps). */
const DESKTOP_BREAKPOINT = 896;

const DEFAULT_CROWN_URL = '/lecool/hero-emblem.png';
const DEFAULT_CROWN_W = 159;
/** Tỷ lệ gốc 159×118 — dùng để suy chiều cao từ bề rộng author đặt. */
const CROWN_RATIO = 118 / 159;

const DEFAULT_EASE = 'power2.inOut';
/** Chặng rời khỏi track dài: tăng tốc dần vì điểm đến còn dưới khung nhìn. */
const LONG_TRACK_EASE = 'power2.in';
const LONG_TRACK_FROM = 0.3;
const LONG_TRACK_TO = 0.46;
/** Cao hơn 1.5 màn thì coi là track pin/scrub. */
const LONG_TRACK_FACTOR = 1.5;

/** Chiều cao trang lệch vài px sau khi ảnh/font load — chừa biên cho mốc cuối. */
const MAX_SCROLL_MARGIN = 8;

const TRAVELING_CLASS = 'lecool-crown-traveling';

/**
 * `.crown-traveling [data-crown-slot]` của apps. `!important` là bắt buộc:
 * timeline của Showcase set inline `opacity`/`visibility` (autoAlpha) lên đúng
 * mấy ảnh này khi cross-fade card.
 */
const TRAVELING_CSS = `
.${TRAVELING_CLASS} [data-crown-slot] { opacity: 0 !important; }
`;

function isVisible(el: HTMLElement) {
  if (getComputedStyle(el).visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Section (block root) gần nhất chứa slot — mốc để tính chặng. */
function sectionOf(el: HTMLElement, scope: HTMLElement): HTMLElement {
  let node: HTMLElement | null = el;
  while (node && node !== scope) {
    const tag = node.tagName;
    if (tag === 'SECTION' || tag === 'HEADER' || tag === 'FOOTER') return node;
    node = node.parentElement;
  }
  return el;
}

export function LecoolCrownTraveler({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolCrownTravelerContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const { scroller, hasRoot } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isNarrow = useContainerMobile(rootRef, DESKTOP_BREAKPOINT);

  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  /** Bump khi số slot trên trang đổi → dựng lại tuyến bay. */
  const [slotVersion, setSlotVersion] = React.useState(0);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const crownUrl = content.crownUrl?.trim() || DEFAULT_CROWN_URL;
  const crownW = content.crownWidth ?? DEFAULT_CROWN_W;
  const crownH = Math.round(crownW * CROWN_RATIO);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const active = mounted && hasRoot && !isCanvas && !isNarrow;
  const inFrame = isDeviceFrameHost(portalHost);

  // Block khác nạp bằng next/dynamic nên slot có thể chưa có lúc mount.
  React.useEffect(() => {
    if (!active) return;
    const scope = scroller ?? document.body;
    let last = scope.querySelectorAll('[data-crown-slot]').length;
    let timer: number | undefined;

    const check = () => {
      const now = scope.querySelectorAll('[data-crown-slot]').length;
      if (now === last) return;
      last = now;
      setSlotVersion(v => v + 1);
    };
    const onMutate = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(check, 150);
    };

    const observer = new MutationObserver(onMutate);
    observer.observe(scope, { childList: true, subtree: true });
    const boot = [250, 800].map(d => window.setTimeout(check, d));

    return () => {
      observer.disconnect();
      boot.forEach(id => window.clearTimeout(id));
      if (timer) window.clearTimeout(timer);
    };
  }, [active, scroller]);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img || !active || !portalHost) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scope = scroller ?? document.body;
    const slots = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-crown-slot]')
    ).filter(isVisible);
    if (slots.length < 2) return;

    const viewportH = scroller?.clientHeight ?? window.innerHeight;
    const maxScroll = ScrollTrigger.maxScroll(scroller ?? window);

    /**
     * Toạ độ đỉnh của một section theo QUÃNG CUỘN, không dùng `offsetTop`:
     * `offsetTop` đo theo offsetParent, mà trang `/p` lẫn khung canvas đều có
     * ancestor `position: relative` nên số đó lệch hẳn so với scroll thật.
     * (apps né bằng `docTop()` — cùng một lý do.)
     */
    const scrollTopOf = (el: HTMLElement) => {
      const top = el.getBoundingClientRect().top;
      if (scroller) {
        return top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      }
      return top + window.scrollY;
    };

    const progress = new Array<number>(slots.length - 1).fill(0);
    const eases: Array<(p: number) => number> = [];
    const triggers: ScrollTrigger[] = [];

    for (let i = 0; i < slots.length - 1; i += 1) {
      const fromSection = sectionOf(slots[i], scope);
      const toSection = sectionOf(slots[i + 1], scope);
      const fromRange = fromSection.offsetHeight - viewportH;
      /**
       * Rời sớm là NGOẠI LỆ, phải do chính slot khai báo — không suy từ chiều
       * cao section. Story cũng cao hơn 1.5 màn nhưng slot của nó là rail điều
       * hướng, phải đứng yên suốt section; suy theo chiều cao thì vương miện
       * nhảy khỏi rail ngay giữa panel Design.
       */
      const earlyExit =
        slots[i].dataset.crownExit === 'early' &&
        fromSection !== toSection &&
        fromRange > 0 &&
        fromSection.offsetHeight > viewportH * LONG_TRACK_FACTOR;

      if (earlyExit) {
        // Rời track dài SỚM, trước khi nội dung chặng sau fade vào.
        eases.push(gsap.parseEase(LONG_TRACK_EASE));
        triggers.push(
          ScrollTrigger.create({
            trigger: fromSection,
            scroller,
            start: () =>
              `top+=${fromRange * LONG_TRACK_FROM} top+=${LECOOL_HEADER_H}`,
            end: () => `+=${fromRange * (LONG_TRACK_TO - LONG_TRACK_FROM)}`,
            invalidateOnRefresh: true,
            // Chạy sau trigger pin của track (mặc định 0) vì phải đọc chiều cao.
            refreshPriority: -10,
            onUpdate: st => {
              progress[i] = st.progress;
            },
          })
        );
        continue;
      }

      eases.push(gsap.parseEase(DEFAULT_EASE));
      const isLast = i === slots.length - 2;
      triggers.push(
        ScrollTrigger.create({
          trigger: toSection,
          scroller,
          start: 'top bottom',
          // Chặng cuối (thường là footer) có thể ngắn hơn một màn → mốc `top
          // top+=72` nằm ngoài vùng cuộn; kẹp vào scroll tối đa để vương miện
          // luôn đáp xong khi chạm đáy trang.
          end: isLast
            ? () =>
                Math.min(
                  scrollTopOf(toSection) - viewportH * 0.5,
                  maxScroll - MAX_SCROLL_MARGIN
                )
            : `top top+=${LECOOL_HEADER_H}`,
          invalidateOnRefresh: true,
          refreshPriority: -10,
          onUpdate: st => {
            progress[i] = st.progress;
          },
        })
      );
    }

    const setter = gsap.quickSetter(img, 'css') as (
      vars: gsap.TweenVars
    ) => void;
    let last = '';

    /**
     * Đo rect slot MỖI frame: slot nằm trong khối sticky/pin nên toạ độ đổi
     * liên tục dù DOM không đổi — không cache được.
     */
    const render = () => {
      let i = 0;
      while (i < progress.length && progress[i] >= 1) i += 1;
      const p = i < progress.length ? progress[i] : 0;

      const a = slots[i].getBoundingClientRect();
      const b = slots[i + 1]?.getBoundingClientRect() ?? a;
      const e = i < eases.length ? eases[i](p) : 0;

      const cx = gsap.utils.interpolate(
        a.left + a.width / 2,
        b.left + b.width / 2,
        e
      );
      const cy = gsap.utils.interpolate(
        a.top + a.height / 2,
        b.top + b.height / 2,
        e
      );
      const w = gsap.utils.interpolate(a.width, b.width, e);

      // Trong khung device, vương miện `absolute` theo khung → trừ gốc khung.
      const host = inFrame ? portalHost.getBoundingClientRect() : null;
      const vars = {
        x: cx - (host?.left ?? 0) - crownW / 2,
        y: cy - (host?.top ?? 0) - crownH / 2,
        scale: w / crownW,
      };

      const key = `${vars.x.toFixed(2)}|${vars.y.toFixed(2)}|${vars.scale.toFixed(4)}`;
      if (key === last) return;
      last = key;
      setter(vars);
    };

    const hideHost = scroller ?? document.documentElement;
    gsap.set(img, { transformOrigin: '50% 50%' });
    hideHost.classList.add(TRAVELING_CLASS);

    ScrollTrigger.refresh();
    render();
    gsap.set(img, { autoAlpha: 1 });

    gsap.ticker.add(render);
    ScrollTrigger.addEventListener('refresh', render);

    return () => {
      gsap.ticker.remove(render);
      ScrollTrigger.removeEventListener('refresh', render);
      triggers.forEach(trigger => trigger.kill());
      hideHost.classList.remove(TRAVELING_CLASS);
      gsap.set(img, { clearProps: 'transform', autoAlpha: 0 });
    };
  }, [active, portalHost, inFrame, scroller, slotVersion, crownW, crownH]);

  // ── Canvas: chỉ mình block này render nên không có slot nào để bay ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: LECOOL_PAPER, padding: 24 },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex items-center gap-4'>
          <img
            src={crownUrl}
            alt=''
            aria-hidden
            data-element-key='crownUrl'
            className={selectableClass(activeKey === 'crownUrl', 'h-auto')}
            style={composeStyle({ width: crownW }, styleOf('crownUrl'))}
          />
          <p
            style={{
              margin: 0,
              fontFamily: LECOOL_BODY_FONT,
              fontSize: 12,
              lineHeight: '18px',
              color: 'rgba(0,0,0,0.6)',
            }}
          >
            Vương miện này bay qua các block Le Cool Move khác theo scroll và ẩn
            các vương miện tĩnh của chúng đi. Chỉ chạy ở Preview và trang thật,
            trên desktop.
          </p>
        </div>
      </section>
    );
  }

  const crown = (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none top-0 left-0 z-40',
        inFrame ? 'absolute' : 'fixed'
      )}
    >
      <img
        ref={imgRef}
        src={crownUrl}
        alt=''
        aria-hidden
        width={crownW}
        height={crownH}
        className='h-auto will-change-transform'
        style={{ width: crownW, opacity: 0, visibility: 'hidden' }}
      />
    </div>
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        '@container relative w-full',
        active && 'h-0 overflow-visible'
      )}
      style={blockBackgroundStyle(background)}
    >
      <style>{TRAVELING_CSS}</style>
      {active && portalHost ? createPortal(crown, portalHost) : null}
    </section>
  );
}
