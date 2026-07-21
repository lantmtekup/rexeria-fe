/**
 * Motion Attribute System — thư viện hiệu ứng dùng chung (T1/T2).
 *
 * Registry thuần data: mỗi effect khai báo trạng thái from/to + defaults
 * (duration/ease/trigger). Block KHÔNG import file này trực tiếp — dev gắn
 * `data-motion="<effect-id>"` (+ `data-motion-*` tuning) trong JSX và gọi
 * `useMotionAttributes(rootRef)`; hook đọc registry này để build GSAP.
 *
 * Không đụng System B (motion/presets.ts — preset track-based lưu CMS). Hai
 * bộ có thể hội tụ sau; đợt này giữ tách để attribute runtime không phụ
 * thuộc model track.
 */

export type MotionTriggerKind = 'in-view' | 'scrub' | 'load';

export interface MotionEffectDefaults {
  /** Giây. Với trigger 'scrub' chỉ là độ dài tương đối trong timeline scrub. */
  duration: number;
  /** GSAP ease string — chuỗi parameterized ('back.out(2)') hợp lệ. */
  ease: string;
  trigger: MotionTriggerKind;
  /** ScrollTrigger start mặc định (in-view: 'top 85%'). */
  start?: string;
  /** Stagger giây/piece — chỉ effect split. */
  stagger?: number;
}

export interface MotionEffect {
  id: string;
  label: string;
  /** Phân loại đối tượng phù hợp (chữ / ảnh / khung-shape) — cho docs & editor sau này. */
  appliesTo: Array<'text' | 'image' | 'shape' | 'any'>;
  /** Trạng thái đầu (gsap vars). Effect split: áp lên từng piece. */
  from: Record<string, unknown>;
  /** Trạng thái cuối. */
  to: Record<string, unknown>;
  defaults: MotionEffectDefaults;
  /** Effect chữ: tách bằng SplitText (mask cùng loại) rồi stagger. */
  split?: 'chars' | 'words' | 'lines';
  /**
   * Trục cho `data-motion-distance` (px) override biên độ from. Dấu lấy theo
   * giá trị mặc định (fade-down giữ chiều âm).
   */
  distanceVar?: 'x' | 'y';
}

const IN_VIEW_START = 'top 85%';

export const MOTION_EFFECTS: Record<string, MotionEffect> = {
  'fade-in': {
    id: 'fade-in',
    label: 'Fade In',
    appliesTo: ['any'],
    from: { opacity: 0 },
    to: { opacity: 1 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
  },
  'fade-up': {
    id: 'fade-up',
    label: 'Fade Up',
    appliesTo: ['any'],
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    distanceVar: 'y',
  },
  'fade-down': {
    id: 'fade-down',
    label: 'Fade Down',
    appliesTo: ['any'],
    from: { opacity: 0, y: -24 },
    to: { opacity: 1, y: 0 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    distanceVar: 'y',
  },
  'slide-left': {
    id: 'slide-left',
    label: 'Slide Left',
    appliesTo: ['any'],
    from: { opacity: 0, x: 32 },
    to: { opacity: 1, x: 0 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    distanceVar: 'x',
  },
  'slide-right': {
    id: 'slide-right',
    label: 'Slide Right',
    appliesTo: ['any'],
    from: { opacity: 0, x: -32 },
    to: { opacity: 1, x: 0 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    distanceVar: 'x',
  },
  'scale-in': {
    id: 'scale-in',
    label: 'Scale In',
    appliesTo: ['any'],
    from: { opacity: 0, scale: 0.92 },
    to: { opacity: 1, scale: 1 },
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
  },
  'zoom-in': {
    id: 'zoom-in',
    label: 'Zoom In',
    appliesTo: ['image', 'any'],
    from: { opacity: 0, scale: 0.6 },
    to: { opacity: 1, scale: 1 },
    defaults: {
      duration: 0.8,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
  },
  'blur-in': {
    id: 'blur-in',
    label: 'Blur In',
    appliesTo: ['image', 'text'],
    from: { opacity: 0, filter: 'blur(12px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
    defaults: {
      duration: 0.8,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
  },
  'char-reveal': {
    id: 'char-reveal',
    label: 'Char Reveal',
    appliesTo: ['text'],
    from: { yPercent: 110, opacity: 0 },
    to: { yPercent: 0, opacity: 1 },
    defaults: {
      duration: 1.6,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.06,
    },
    split: 'chars',
  },
  'word-reveal': {
    id: 'word-reveal',
    label: 'Word Reveal',
    appliesTo: ['text'],
    from: { yPercent: 110, opacity: 0 },
    to: { yPercent: 0, opacity: 1 },
    defaults: {
      duration: 1.0,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.05,
    },
    split: 'words',
  },
  'line-reveal': {
    id: 'line-reveal',
    label: 'Line Reveal',
    appliesTo: ['text'],
    from: { yPercent: 110, opacity: 0 },
    to: { yPercent: 0, opacity: 1 },
    defaults: {
      duration: 0.9,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.1,
    },
    split: 'lines',
  },
  'line-draw': {
    id: 'line-draw',
    label: 'Line Draw',
    appliesTo: ['shape'],
    from: { scaleY: 0, transformOrigin: 'top center' },
    to: { scaleY: 1 },
    defaults: { duration: 1, ease: 'none', trigger: 'scrub' },
  },
  'scale-pop': {
    id: 'scale-pop',
    label: 'Scale Pop',
    appliesTo: ['shape', 'any'],
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    defaults: {
      duration: 0.4,
      ease: 'back.out(2)',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
  },
};

export function getMotionEffect(id: string): MotionEffect | undefined {
  return MOTION_EFFECTS[id];
}
