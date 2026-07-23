import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

// Thanh địa chỉ mobile ẩn/hiện làm đổi viewport height → ScrollTrigger refresh
// và pin bị nhảy. Bỏ qua resize do browser chrome gây ra.
ScrollTrigger.config({ ignoreMobileResize: true });

export const MQ = {
  mobile: '(max-width: 767px)',
  desktop: '(min-width: 768px)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

/** Conditions dùng chung cho gsap.matchMedia của mọi section. */
export const MOTION_CONDITIONS = {
  isMobile: MQ.mobile,
  isDesktop: MQ.desktop,
  reduce: MQ.reduce,
};

export type MotionConditions = {
  isMobile: boolean;
  isDesktop: boolean;
  reduce: boolean;
};

const preventScrollInput = (event: Event) => {
  event.preventDefault();
};

/** Khi true, entry-snap không nhảy — để scroll programmatic (vd: Back to Buy) đi xuyên. */
let programmaticScrollLock = false;

type ScrollToSectionOptions = {
  duration?: number;
  ease?: string;
};

/**
 * Scroll programmatic tới section; tạm tắt entry-snap để không bị overwrite giữa đường.
 */
export const scrollToSection = (
  target: string | Element,
  options: ScrollToSectionOptions = {}
) => {
  const { duration = 0.8, ease = 'power2.out' } = options;

  programmaticScrollLock = true;

  const releaseLock = () => {
    programmaticScrollLock = false;
  };

  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration,
    ease,
    overwrite: true,
    onComplete: releaseLock,
    onInterrupt: releaseLock,
  });
};

/**
 * Không cho người dùng scroll tự do qua vùng chuyển tiếp trước block:
 * vừa chạm vào vùng (block ló vào viewport) là tween scroll thẳng tới điểm pin
 * (fullpage-style jump); scroll ngược từ block ra là nhảy trả về block trước.
 * Trong lúc tween, wheel/touch bị chặn nên không thể dừng giữa vùng hở.
 * Tự chứa trong block nên vẫn hoạt động khi block được dùng độc lập.
 */
export const createBlockEntrySnap = (trigger: HTMLElement) => {
  let isJumping = false;

  const releaseScrollInput = () => {
    window.removeEventListener('wheel', preventScrollInput);
    window.removeEventListener('touchmove', preventScrollInput);
    isJumping = false;
  };

  const jumpTo = (y: number) => {
    if (programmaticScrollLock || isJumping) return;
    isJumping = true;
    window.addEventListener('wheel', preventScrollInput, { passive: false });
    window.addEventListener('touchmove', preventScrollInput, {
      passive: false,
    });

    // Duration theo quãng đường còn lại; ease `out` để tiếp nối đà scroll của
    // người dùng (không khựng lúc bắt đầu) và giảm tốc dần khi đáp.
    const distance = Math.abs(y - window.scrollY);
    const duration = gsap.utils.clamp(
      0.45,
      0.85,
      (distance / window.innerHeight) * 0.85
    );

    gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration,
      ease: 'power2.out',
      overwrite: true,
      onComplete: releaseScrollInput,
      onInterrupt: releaseScrollInput,
    });
  };

  // start lệch 1px để block trước có thể dừng đúng biên (vd: snap label cuối)
  // mà không kích hoạt jump; landing của jump ngược cũng nằm ngoài vùng để
  // onEnter có thể bắn lại ở lần scroll xuống kế tiếp.
  // Jump xuống đáp +1px qua `top top` để pin/entrance ST chắc chắn cross threshold
  // (subpixel/scrollY làm đáp đúng biên thường để content đứng blank).
  return ScrollTrigger.create({
    trigger,
    start: 'top bottom-=1',
    end: 'top top',
    onEnter: self => {
      if (programmaticScrollLock) return;
      jumpTo(self.end + 1);
    },
    onEnterBack: self => {
      if (programmaticScrollLock) return;
      jumpTo(self.start - 1);
    },
    onKill: releaseScrollInput,
  });
};

export { gsap, ScrollTrigger, SplitText };
