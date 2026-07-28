/**
 * Motion Attribute System — thư viện hiệu ứng dùng chung (T1/T2).
 *
 * Registry thuần data: mỗi effect khai báo trạng thái from/to + defaults
 * (duration/ease/trigger) + `meta` (agent memory: whenToUse / vs / example).
 * Block KHÔNG import file này trực tiếp — dev gắn `data-motion="<effect-id>"`
 * (+ `data-motion-*` tuning) trong JSX và gọi `useMotionAttributes(rootRef)`;
 * hook đọc registry này để build GSAP.
 *
 * Agent memory: `meta` là single source; sync ra
 * `.claude/skills/motion-pick/references/effects-catalog.md` bằng
 * `yarn motion:catalog`. Không đụng System B (motion/presets.ts).
 */

export type MotionTriggerKind =
  | 'in-view'
  | 'scrub'
  | 'load'
  | 'loop'
  | 'hover'
  | 'click';

export type MotionEffectCategory =
  | 'entrance'
  | 'text'
  | 'scroll'
  | 'image'
  | 'hover'
  | 'loop'
  | 'special';

export interface MotionEffectDefaults {
  /** Giây. Với trigger 'scrub' chỉ là độ dài tương đối trong timeline scrub. */
  duration: number;
  /** GSAP ease string — chuỗi parameterized ('back.out(2)') hợp lệ. */
  ease: string;
  trigger: MotionTriggerKind;
  /** ScrollTrigger start mặc định (in-view: 'top 85%'). */
  start?: string;
  /** ScrollTrigger end mặc định — effect scrub kiểu parallax cần range full. */
  end?: string;
  /** Stagger giây/piece — chỉ effect split. */
  stagger?: number;
  /** GSAP repeat mặc định (-1 = vô hạn) — effect loop. */
  repeat?: number;
}

/** Agent-facing memory — bắt buộc trên mọi effect (TypeScript bắt khi thêm mới). */
export interface MotionEffectMeta {
  /** 1 câu: nhìn thấy gì trên màn hình. */
  summary: string;
  /** Khi nào chọn effect này (intent / use-case). */
  whenToUse: string[];
  /** Khi nào KHÔNG dùng — tránh nhầm siblings. */
  whenNotToUse: string[];
  /** id effect gần nghĩa + khác biệt 1 dòng. */
  vs: Array<{ id: string; diff: string }>;
  /** Tag retrieve: entrance, split, scrub, ken-burns, ... */
  tags: string[];
  category: MotionEffectCategory;
  /** Điều kiện JSX/DOM trước khi gắn (rỗng = không cần). */
  prerequisites: string[];
  /** Attribute tuning hợp lệ (suffix sau data-motion-, vd distance). */
  relevantAttrs: string[];
  /** Snippet JSX tối thiểu — agent copy đúng pattern. */
  example: string;
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
  /** Agent memory — intent / disambiguation / example. */
  meta: MotionEffectMeta;
  /** Effect chữ: tách bằng SplitText (mask cùng loại) rồi stagger. */
  split?: 'chars' | 'words' | 'lines';
  /**
   * Trục cho `data-motion-distance` override biên độ from ('x'/'y' tính px,
   * 'scale' tính hệ số). Dấu lấy theo giá trị mặc định (fade-down giữ chiều âm).
   */
  distanceVar?: 'x' | 'y' | 'scale';
  /**
   * Cách áp distance: 'from' (default) chỉ đổi trạng thái đầu (fade-up…);
   * 'symmetric' đổi cả hai đầu ±d (parallax: from +d → to −d).
   */
  distanceMode?: 'from' | 'symmetric';
  /** Effect clip-reveal: nhận `data-motion-direction` (up/down/left/right). */
  directional?: boolean;
  /** Effect đặc biệt cần nhánh runtime riêng (không tween style thường). */
  special?: 'counter' | 'echo-reveal';
}

/** Bản nhẹ cho index / agent — không gồm from/to/defaults đầy đủ. */
export interface MotionEffectIndexEntry {
  id: string;
  label: string;
  category: MotionEffectCategory;
  tags: string[];
  summary: string;
  appliesTo: MotionEffect['appliesTo'];
}

/**
 * clip-reveal: map `data-motion-direction` → clipPath khởi đầu. Direction =
 * hướng mép reveal di chuyển ('down' = lộ từ trên xuống — default).
 */
export const CLIP_REVEAL_FROM: Record<
  'up' | 'down' | 'left' | 'right',
  string
> = {
  down: 'inset(0% 0% 100% 0%)',
  up: 'inset(100% 0% 0% 0%)',
  right: 'inset(0% 100% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
};

const IN_VIEW_START = 'top 85%';

const ENTRANCE_TIMING = ['duration', 'delay', 'ease', 'start', 'once'] as const;

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
    meta: {
      summary: 'Chỉ mờ dần hiện ra — không dịch chuyển.',
      whenToUse: [
        'Overlay / badge / icon nhỏ cần hiện nhẹ',
        'Khi không muốn cảm giác “trượt vào”',
      ],
      whenNotToUse: [
        'Body/card thường → ưu tiên fade-up',
        'Heading cần letter stagger → char-reveal',
      ],
      vs: [
        { id: 'fade-up', diff: 'có trượt lên + fade' },
        { id: 'blur-in', diff: 'thêm blur, nặng hơn' },
      ],
      tags: ['entrance', 'fade', 'opacity'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<span data-motion='fade-in'>Badge</span>`,
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
    meta: {
      summary: 'Mờ + trượt lên vào chỗ đứng khi vào viewport.',
      whenToUse: [
        'Body copy, paragraph, CTA phụ',
        'Card / item trong list hoặc data-motion-group',
        'Entrance mặc định cho hầu hết block tĩnh',
      ],
      whenNotToUse: [
        'Heading cần letter/word stagger → char-reveal / word-reveal',
        'Ảnh Ken Burns settle → media-zoom',
        'Cần trượt ngang → slide-left / slide-right',
      ],
      vs: [
        { id: 'fade-in', diff: 'không có dịch chuyển' },
        { id: 'fade-down', diff: 'trượt từ trên xuống' },
        { id: 'slide-left', diff: 'trượt ngang thay vì dọc' },
        { id: 'rotate-in', diff: 'thêm xoay nhẹ' },
      ],
      tags: ['entrance', 'fade', 'translate'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<p data-motion='fade-up' data-motion-distance='30'>Body</p>`,
    },
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
    meta: {
      summary: 'Mờ + trượt từ trên xuống chỗ đứng.',
      whenToUse: [
        'Nav / eyebrow rơi xuống nhẹ',
        'Khi hướng chuyển động từ trên hợp composition',
      ],
      whenNotToUse: [
        'Entrance mặc định body/card → fade-up',
        'Heading split → char/word/line-reveal',
      ],
      vs: [
        { id: 'fade-up', diff: 'hướng ngược (từ dưới lên)' },
        { id: 'fade-in', diff: 'không dịch chuyển' },
      ],
      tags: ['entrance', 'fade', 'translate'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<p data-motion='fade-down'>Eyebrow</p>`,
    },
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
    meta: {
      summary: 'Mờ + trượt từ phải sang trái vào chỗ đứng.',
      whenToUse: [
        'Cột phải trong split layout',
        'Khi muốn nhấn hướng ngang (không phải dọc)',
      ],
      whenNotToUse: [
        'Entrance dọc mặc định → fade-up',
        'Ảnh clip theo mép → clip-reveal',
      ],
      vs: [
        { id: 'slide-right', diff: 'hướng ngược (từ trái sang)' },
        { id: 'fade-up', diff: 'trượt dọc thay vì ngang' },
      ],
      tags: ['entrance', 'fade', 'translate', 'horizontal'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<div data-motion='slide-left' data-motion-distance='40'>Panel</div>`,
    },
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
    meta: {
      summary: 'Mờ + trượt từ trái sang phải vào chỗ đứng.',
      whenToUse: [
        'Cột trái trong split layout',
        'Đối xứng với slide-left ở cột kia',
      ],
      whenNotToUse: [
        'Entrance dọc mặc định → fade-up',
        'Ảnh clip theo mép → clip-reveal',
      ],
      vs: [
        { id: 'slide-left', diff: 'hướng ngược (từ phải sang)' },
        { id: 'fade-up', diff: 'trượt dọc thay vì ngang' },
      ],
      tags: ['entrance', 'fade', 'translate', 'horizontal'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<div data-motion='slide-right'>Panel</div>`,
    },
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
    meta: {
      summary: 'Mờ + phóng nhẹ từ ~92% → 100%.',
      whenToUse: [
        'Card / media block cần “nở” nhẹ',
        'Khi muốn soft scale, không dramatical',
      ],
      whenNotToUse: [
        'Scale mạnh từ nhỏ → zoom-in',
        'Dot/icon nảy back.out → scale-pop',
        'Ảnh đã hiện, chỉ settle Ken Burns → media-zoom',
      ],
      vs: [
        { id: 'zoom-in', diff: 'scale mạnh hơn (0.6→1)' },
        { id: 'scale-pop', diff: 'từ 0 + ease back.out(2)' },
        { id: 'media-zoom', diff: 'settle từ 1.18→1, không fade' },
      ],
      tags: ['entrance', 'scale', 'fade'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<div data-motion='scale-in'>Card</div>`,
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
    distanceVar: 'scale',
    meta: {
      summary: 'Mờ + zoom mạnh từ ~60% → 100% (entrance).',
      whenToUse: [
        'Hero image / featured media cần punch mạnh',
        'Khi scale-in quá nhẹ',
      ],
      whenNotToUse: [
        'Soft card entrance → scale-in',
        'Ảnh đã full-size, chỉ Ken Burns settle → media-zoom',
        'Hover phóng ảnh → hover-zoom',
      ],
      vs: [
        { id: 'scale-in', diff: 'scale nhẹ hơn (0.92)' },
        { id: 'media-zoom', diff: 'settle 1.18→1, không opacity' },
        { id: 'hover-zoom', diff: 'chỉ khi hover, không entrance' },
      ],
      tags: ['entrance', 'scale', 'fade', 'image'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<img data-motion='zoom-in' data-motion-distance='0.85' alt='' />`,
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
    meta: {
      summary: 'Mờ + blur 12px → nét (filter).',
      whenToUse: [
        'Ảnh/editorial text cần cảm giác “lấy nét”',
        'Khi fade thuần quá phẳng',
      ],
      whenNotToUse: [
        'Body copy thường (filter nặng) → fade-up',
        'Heading split → char/word-reveal',
      ],
      vs: [
        { id: 'fade-in', diff: 'chỉ opacity, không blur' },
        { id: 'fade-up', diff: 'dịch chuyển, không filter' },
      ],
      tags: ['entrance', 'fade', 'blur', 'filter'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<img data-motion='blur-in' alt='' />`,
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
    meta: {
      summary: 'Từng chữ cái trượt lên qua mask (SplitText chars + stagger).',
      whenToUse: [
        'Hero / section heading cần cinematic letter stagger',
        'Tiêu đề ngắn–trung bình',
      ],
      whenNotToUse: [
        'Đoạn dài / body → fade-up hoặc line-reveal',
        'Heading nhiều dòng muốn theo dòng → line-reveal',
        'Muốn nhanh hơn theo từ → word-reveal',
      ],
      vs: [
        { id: 'word-reveal', diff: 'stagger theo từ, nhanh hơn' },
        { id: 'line-reveal', diff: 'stagger theo dòng' },
        { id: 'fade-up', diff: 'cả khối, không split' },
        {
          id: 'char-blur-up-reveal',
          diff: 'char-blur-up-reveal dịch y nhỏ (px) + thêm blur, không phải slide lớn qua mask',
        },
      ],
      tags: ['text', 'split', 'chars', 'reveal', 'entrance'],
      category: 'text',
      prerequisites: ['Chỉ gắn lên text node (heading/span có chữ)'],
      relevantAttrs: [...ENTRANCE_TIMING, 'stagger'],
      example: `<h2 data-motion='char-reveal'>Heading</h2>`,
    },
  },
  'char-blur-up-reveal': {
    id: 'char-blur-up-reveal',
    label: 'Char Blur Up Reveal',
    appliesTo: ['text'],
    from: { y: 10, opacity: 0, filter: 'blur(10px)' },
    to: { y: 0, opacity: 1, filter: 'blur(0px)' },
    defaults: {
      duration: 1.2,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.05,
    },
    distanceVar: 'y',
    split: 'chars',
    meta: {
      summary:
        'Từng chữ cái dịch nhẹ theo trục y (px, không phải % qua mask) kèm mờ→nét cùng lúc, so le trái→phải.',
      whenToUse: [
        'Heading ngắn cần dịch chuyển NHẸ (khác char-reveal — đó là slide lớn qua mask) kết hợp blur trong 1 effect',
      ],
      whenNotToUse: [
        'Muốn slide lớn qua mask (yPercent) → char-reveal',
        'Theo từ thay vì từng chữ → word-blur-up-reveal',
      ],
      vs: [
        {
          id: 'char-reveal',
          diff: 'char-reveal trượt yPercent lớn qua mask, không blur; char-blur-up-reveal chỉ dịch y nhỏ (px)',
        },
        {
          id: 'word-blur-up-reveal',
          diff: 'cùng shape nhưng split theo từ',
        },
      ],
      tags: ['text', 'split', 'chars', 'blur', 'translate', 'entrance'],
      category: 'text',
      prerequisites: ['Chỉ gắn lên text node (heading/span có chữ)'],
      relevantAttrs: [...ENTRANCE_TIMING, 'stagger', 'distance'],
      example: `<h1 data-motion='char-blur-up-reveal'>SAY HELLO</h1>`,
    },
  },
  'word-blur-up-reveal': {
    id: 'word-blur-up-reveal',
    label: 'Word Blur Up Reveal',
    appliesTo: ['text'],
    from: { y: 10, opacity: 0, filter: 'blur(10px)' },
    to: { y: 0, opacity: 1, filter: 'blur(0px)' },
    defaults: {
      duration: 1.2,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.05,
    },
    distanceVar: 'y',
    split: 'words',
    meta: {
      summary:
        'Từng từ dịch nhẹ theo trục y (px, không phải % qua mask) kèm mờ→nét cùng lúc, so le theo thứ tự từ.',
      whenToUse: [
        'Đoạn mô tả/tiêu đề cần dịch chuyển NHẸ kết hợp blur trong 1 effect',
      ],
      whenNotToUse: ['Theo chữ thay vì theo từ → char-blur-up-reveal'],
      vs: [
        { id: 'char-blur-up-reveal', diff: 'cùng shape nhưng split theo chữ' },
      ],
      tags: ['text', 'split', 'words', 'blur', 'translate', 'entrance'],
      category: 'text',
      prerequisites: ['Chỉ gắn lên text node'],
      relevantAttrs: [...ENTRANCE_TIMING, 'stagger', 'distance'],
      example: `<p data-motion='word-blur-up-reveal'>COSMOGRAPH DAYTONA</p>`,
    },
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
    meta: {
      summary: 'Từng từ trượt lên qua mask (SplitText words + stagger).',
      whenToUse: [
        'Heading / subhead vừa phải — rõ ràng hơn char, nhanh hơn',
        'Statement / manifesto ngắn',
      ],
      whenNotToUse: [
        'Letter-by-letter cinematic → char-reveal',
        'Paragraph nhiều dòng → line-reveal hoặc fade-up',
      ],
      vs: [
        { id: 'char-reveal', diff: 'stagger theo chữ, chậm/cinematic hơn' },
        { id: 'line-reveal', diff: 'stagger theo dòng' },
        { id: 'fade-up', diff: 'cả khối, không split' },
      ],
      tags: ['text', 'split', 'words', 'reveal', 'entrance'],
      category: 'text',
      prerequisites: ['Chỉ gắn lên text node'],
      relevantAttrs: [...ENTRANCE_TIMING, 'stagger'],
      example: `<h2 data-motion='word-reveal'>Statement title</h2>`,
    },
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
    meta: {
      summary: 'Từng dòng trượt lên qua mask (SplitText lines + stagger).',
      whenToUse: [
        'Heading/body nhiều dòng muốn reveal theo dòng',
        'Editorial block — rõ nhịp từng line',
      ],
      whenNotToUse: [
        'Một dòng ngắn muốn letter stagger → char-reveal',
        'Body dài không cần split → fade-up',
      ],
      vs: [
        { id: 'char-reveal', diff: 'stagger theo chữ' },
        { id: 'word-reveal', diff: 'stagger theo từ' },
        { id: 'fade-up', diff: 'cả khối, không split' },
      ],
      tags: ['text', 'split', 'lines', 'reveal', 'entrance'],
      category: 'text',
      prerequisites: ['Chỉ gắn lên text node (có thể wrap nhiều dòng)'],
      relevantAttrs: [...ENTRANCE_TIMING, 'stagger'],
      example: `<p data-motion='line-reveal'>Line one.\\nLine two.</p>`,
    },
  },
  'line-draw': {
    id: 'line-draw',
    label: 'Line Draw',
    appliesTo: ['shape'],
    from: { scaleY: 0, transformOrigin: 'top center' },
    to: { scaleY: 1 },
    defaults: { duration: 1, ease: 'none', trigger: 'scrub' },
    meta: {
      summary: 'Vẽ thanh/khung theo scroll (scaleY 0→1, mặc định scrub).',
      whenToUse: [
        'Timeline / process vertical line',
        'Accent bar gắn scroll progress',
      ],
      whenNotToUse: [
        'Entrance one-shot không scrub → scale-pop hoặc fade-up',
        'Parallax ảnh → parallax',
      ],
      vs: [
        {
          id: 'parallax',
          diff: 'dịch y ảnh theo scrub, không scale đường',
        },
        { id: 'scale-pop', diff: 'pop in-view, không scrub' },
      ],
      tags: ['scroll', 'scrub', 'shape', 'draw'],
      category: 'scroll',
      prerequisites: [
        'Element là thanh/shape (div mỏng) — không dùng cho text/ảnh lớn',
      ],
      relevantAttrs: [
        'duration',
        'ease',
        'start',
        'end',
        'scrub',
        'trigger',
        'axis',
        'origin',
        'trigger-target',
        'end-target',
      ],
      example: `<div className='h-full w-px bg-black' data-motion='line-draw' />`,
    },
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
    meta: {
      summary: 'Pop từ scale 0 với ease back.out(2) — nảy ngắn.',
      whenToUse: [
        'Dot / bullet / icon nhỏ trong process step',
        'Accent shape cần “nảy” rõ',
      ],
      whenNotToUse: ['Card/ảnh soft → scale-in', 'Zoom mạnh media → zoom-in'],
      vs: [
        { id: 'scale-in', diff: 'soft từ 0.92, không back.out' },
        { id: 'zoom-in', diff: 'từ 0.6, không pop' },
      ],
      tags: ['entrance', 'scale', 'pop', 'shape'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<span data-motion='scale-pop' className='size-2 rounded-full' />`,
    },
  },
  parallax: {
    id: 'parallax',
    label: 'Parallax',
    appliesTo: ['image', 'any'],
    from: { y: 60 },
    to: { y: -60 },
    defaults: {
      duration: 1,
      ease: 'none',
      trigger: 'scrub',
      start: 'top bottom',
      end: 'bottom top',
    },
    distanceVar: 'y',
    distanceMode: 'symmetric',
    meta: {
      summary: 'Dịch y theo scroll (scrub full-range, ±distance đối xứng).',
      whenToUse: [
        'Ảnh nền / layer cần depth khi scroll',
        'Gallery / hero media parallax nhẹ',
      ],
      whenNotToUse: [
        'Entrance one-shot → fade-up / media-zoom',
        'Pin / frame-scrub phức tạp → T3 useBlockMotion',
      ],
      vs: [
        { id: 'media-zoom', diff: 'settle scale in-view, không scrub' },
        { id: 'line-draw', diff: 'scale shape scrub, không y ảnh' },
      ],
      tags: ['scroll', 'scrub', 'parallax', 'image'],
      category: 'scroll',
      prerequisites: [],
      relevantAttrs: [
        'distance',
        'start',
        'end',
        'scrub',
        'trigger',
        'trigger-target',
        'end-target',
      ],
      example: `<img data-motion='parallax' data-motion-distance='40' alt='' />`,
    },
  },
  'clip-reveal': {
    id: 'clip-reveal',
    label: 'Clip Reveal',
    appliesTo: ['image', 'shape'],
    from: { clipPath: CLIP_REVEAL_FROM.down },
    to: { clipPath: 'inset(0% 0% 0% 0%)' },
    defaults: {
      duration: 1,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    directional: true,
    meta: {
      summary: 'Lộ ảnh/khung bằng clipPath inset theo hướng.',
      whenToUse: [
        'Ảnh editorial reveal theo mép',
        'Khi muốn hướng rõ (down/up/left/right)',
      ],
      whenNotToUse: [
        'Fade/scale đơn giản → fade-up / scale-in',
        'Ken Burns settle → media-zoom',
      ],
      vs: [
        { id: 'media-zoom', diff: 'scale settle, không clip' },
        { id: 'fade-up', diff: 'transform+opacity, không clipPath' },
      ],
      tags: ['image', 'reveal', 'clip', 'entrance'],
      category: 'image',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'direction'],
      example: `<div data-motion='clip-reveal' data-motion-direction='left'><img alt='' /></div>`,
    },
  },
  'media-zoom': {
    id: 'media-zoom',
    label: 'Media Zoom',
    appliesTo: ['image'],
    // Ken Burns settle — đặt lên <img> bên trong wrapper overflow-hidden.
    from: { scale: 1.18 },
    to: { scale: 1 },
    defaults: {
      duration: 1.2,
      ease: 'power2.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    meta: {
      summary: 'Ken Burns settle: scale 1.18→1 trên ảnh (đã hiện đủ khung).',
      whenToUse: [
        'Ảnh trong khung overflow-hidden cần settle khi vào view',
        'Gallery / hero media cinematic nhẹ',
      ],
      whenNotToUse: [
        'Entrance từ nhỏ + fade → zoom-in / scale-in',
        'Hover phóng → hover-zoom',
      ],
      vs: [
        { id: 'zoom-in', diff: 'entrance từ 0.6 + opacity' },
        { id: 'hover-zoom', diff: 'chỉ khi hover' },
        { id: 'parallax', diff: 'scrub y, không scale settle' },
      ],
      tags: ['image', 'ken-burns', 'scale', 'entrance'],
      category: 'image',
      prerequisites: [
        'Đặt lên <img> (hoặc inner) bên trong wrapper overflow-hidden',
      ],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<div className='overflow-hidden'><img data-motion='media-zoom' alt='' /></div>`,
    },
  },
  'rotate-in': {
    id: 'rotate-in',
    label: 'Rotate In',
    appliesTo: ['any'],
    from: { opacity: 0, rotate: -8, y: 24 },
    to: { opacity: 1, rotate: 0, y: 0 },
    defaults: {
      duration: 0.7,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    distanceVar: 'y',
    meta: {
      summary: 'Mờ + xoay nhẹ (−8°) + trượt lên vào chỗ đứng.',
      whenToUse: [
        'Card / figure cần character hơn fade-up',
        'Accent block editorial',
      ],
      whenNotToUse: ['Entrance trung tính → fade-up', '3D flip mặt → flip-in'],
      vs: [
        { id: 'fade-up', diff: 'không xoay' },
        { id: 'flip-in', diff: 'rotateX 3D, không rotate 2D' },
      ],
      tags: ['entrance', 'fade', 'rotate', 'translate'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING, 'distance'],
      example: `<div data-motion='rotate-in'>Card</div>`,
    },
  },
  'flip-in': {
    id: 'flip-in',
    label: 'Flip In',
    appliesTo: ['any'],
    from: { opacity: 0, rotateX: -55, transformPerspective: 800 },
    to: { opacity: 1, rotateX: 0 },
    defaults: {
      duration: 0.8,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    meta: {
      summary: 'Lật mặt 3D (rotateX −55° → 0) với perspective.',
      whenToUse: [
        'Card / panel cần cảm giác flip vào',
        'Khi rotate-in 2D chưa đủ “khối”',
      ],
      whenNotToUse: [
        'Soft entrance → fade-up / scale-in',
        'Chỉ xoay nhẹ 2D → rotate-in',
      ],
      vs: [
        { id: 'rotate-in', diff: 'rotate 2D + y, không perspective' },
        { id: 'fade-up', diff: 'không xoay' },
      ],
      tags: ['entrance', 'fade', '3d', 'flip'],
      category: 'entrance',
      prerequisites: [],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<div data-motion='flip-in'>Panel</div>`,
    },
  },
  'echo-reveal': {
    id: 'echo-reveal',
    label: 'Echo Reveal',
    appliesTo: ['text'],
    from: { y: 32 },
    to: {},
    distanceVar: 'y',
    defaults: {
      duration: 0.9,
      ease: 'power3.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
      stagger: 0.07,
    },
    special: 'echo-reveal',
    meta: {
      summary:
        'Trail chữ echo: các layer con stagger trượt lên + fade theo opacity riêng.',
      whenToUse: [
        'Brutalist / editorial heading có ghost layers xếp chồng',
        'Typography statement với depth opacity trail',
      ],
      whenNotToUse: [
        'Heading đơn không có echo layers → char/word-reveal',
        'Body copy → fade-up',
      ],
      vs: [
        { id: 'char-reveal', diff: 'split chữ, không multi-layer echo' },
        { id: 'fade-up', diff: 'một layer, không trail opacity' },
      ],
      tags: ['text', 'echo', 'stack', 'brutalist', 'entrance'],
      category: 'text',
      prerequisites: [
        'Container có con `[data-echo-layer]` với `data-echo-offset` (em) và `data-echo-opacity`',
      ],
      relevantAttrs: [
        'duration',
        'delay',
        'ease',
        'start',
        'once',
        'stagger',
        'distance',
      ],
      example: `<div data-motion='echo-reveal'><span data-echo-layer data-echo-offset='0.18' data-echo-opacity='0.3'>ECHO</span><span data-echo-layer data-echo-offset='0' data-echo-opacity='1'>ECHO</span></div>`,
    },
  },
  counter: {
    id: 'counter',
    label: 'Counter',
    appliesTo: ['text'],
    // from/to không dùng — runtime tween textContent 0 → số parse từ text.
    from: {},
    to: {},
    defaults: {
      duration: 1.2,
      ease: 'power1.out',
      trigger: 'in-view',
      start: IN_VIEW_START,
    },
    special: 'counter',
    meta: {
      summary: 'Đếm số từ 0 → giá trị trong text (giữ prefix/suffix/phẩy).',
      whenToUse: [
        'Stats / KPI / số liệu section',
        'Text chứa một số cần animate',
      ],
      whenNotToUse: [
        'Heading không phải số → char/word-reveal',
        'Chỉ fade text thường → fade-up',
      ],
      vs: [
        { id: 'fade-up', diff: 'không tween số' },
        { id: 'char-reveal', diff: 'split chữ, không đếm' },
      ],
      tags: ['special', 'counter', 'text', 'stats'],
      category: 'special',
      prerequisites: [
        'textContent phải chứa số parse được (vd "1,250+" hoặc "98%")',
      ],
      relevantAttrs: [...ENTRANCE_TIMING],
      example: `<div data-motion='counter'>1,250+ khách</div>`,
    },
  },
  'marquee-loop': {
    id: 'marquee-loop',
    label: 'Marquee Loop',
    appliesTo: ['any'],
    // Nội dung phải NHÂN ĐÔI trong JSX (track 200% width) như MarqueeBand.
    from: { xPercent: 0 },
    to: { xPercent: -50 },
    defaults: {
      duration: 20,
      ease: 'none',
      trigger: 'loop',
      repeat: -1,
    },
    meta: {
      summary: 'Marquee ngang lặp vô hạn (xPercent 0→−50, trigger loop).',
      whenToUse: [
        'Logo strip / ticker / band chạy liên tục',
        'Khi cần seamless loop ngang',
      ],
      whenNotToUse: [
        'Entrance one-shot → fade-up',
        'Carousel có control → T3 / component logic',
      ],
      vs: [
        {
          id: 'parallax',
          diff: 'scrub theo scroll, không loop vô hạn',
        },
      ],
      tags: ['loop', 'marquee', 'infinite'],
      category: 'loop',
      prerequisites: [
        'Nội dung track phải nhân đôi trong JSX (width ~200%) để loop liền mạch',
      ],
      relevantAttrs: ['duration', 'ease', 'repeat', 'yoyo'],
      example: `<div className='flex w-max' data-motion='marquee-loop'>{items}{items}</div>`,
    },
  },
  // ── Hover effects: from = REST state (element hiển thị bình thường khi
  // chưa hover). Play khi pointerenter, reverse khi pointerleave; tự skip
  // trên thiết bị không có hover (touch). Dùng được với trigger 'click'
  // (toggle). Listener đặt ở chính element hoặc `data-motion-trigger-target`
  // ('closest:.card' cho pattern hover card → animate con).
  'hover-scale': {
    id: 'hover-scale',
    label: 'Hover Scale',
    appliesTo: ['any'],
    from: { scale: 1 },
    to: { scale: 1.06 },
    defaults: { duration: 0.35, ease: 'power2.out', trigger: 'hover' },
    meta: {
      summary: 'Phóng nhẹ khi hover (scale 1→1.06), reverse khi leave.',
      whenToUse: [
        'Button / card / icon cần feedback hover đơn giản',
        'Khi không cần lift hoặc tilt',
      ],
      whenNotToUse: [
        'Muốn nâng + scale → hover-lift',
        'Ảnh trong khung overflow → hover-zoom',
        'Entrance khi scroll → scale-in (không phải hover)',
      ],
      vs: [
        { id: 'hover-lift', diff: 'thêm y −8' },
        { id: 'hover-zoom', diff: 'cho img trong overflow-hidden' },
        { id: 'scale-in', diff: 'entrance in-view, không hover' },
      ],
      tags: ['hover', 'scale', 'interaction'],
      category: 'hover',
      prerequisites: [],
      relevantAttrs: ['duration', 'ease', 'trigger', 'trigger-target'],
      example: `<button data-motion='hover-scale'>CTA</button>`,
    },
  },
  'hover-lift': {
    id: 'hover-lift',
    label: 'Hover Lift',
    appliesTo: ['any'],
    from: { y: 0 },
    to: { y: -8, scale: 1.02 },
    defaults: { duration: 0.35, ease: 'power2.out', trigger: 'hover' },
    distanceVar: 'y',
    meta: {
      summary: 'Nâng lên (y −8) + scale nhẹ khi hover.',
      whenToUse: [
        'Card grid cần cảm giác “nhấc” khi hover',
        'Khi hover-scale quá phẳng',
      ],
      whenNotToUse: ['Chỉ scale → hover-scale', 'Tilt 3D → hover-tilt'],
      vs: [
        { id: 'hover-scale', diff: 'chỉ scale, không y' },
        { id: 'hover-tilt', diff: 'rotateX/Y 3D' },
      ],
      tags: ['hover', 'lift', 'translate', 'interaction'],
      category: 'hover',
      prerequisites: [],
      relevantAttrs: [
        'duration',
        'ease',
        'distance',
        'trigger',
        'trigger-target',
      ],
      example: `<article data-motion='hover-lift'>Card</article>`,
    },
  },
  'hover-tilt': {
    id: 'hover-tilt',
    label: 'Hover Tilt',
    appliesTo: ['any'],
    from: { rotateX: 0, rotateY: 0, transformPerspective: 600 },
    to: { rotateX: 6, rotateY: -6, scale: 1.03, transformPerspective: 600 },
    defaults: { duration: 0.4, ease: 'power2.out', trigger: 'hover' },
    meta: {
      summary: 'Nghiêng 3D cố định khi hover (không theo vị trí chuột).',
      whenToUse: [
        'Card / media cần tilt nhẹ khi hover',
        'Khi lift chưa đủ “khối”',
      ],
      whenNotToUse: [
        'Tilt theo vị trí chuột (mouse-parallax) → T3',
        'Chỉ nâng → hover-lift',
      ],
      vs: [
        { id: 'hover-lift', diff: 'chỉ y + scale, không rotate' },
        { id: 'flip-in', diff: 'entrance in-view, không hover' },
      ],
      tags: ['hover', 'tilt', '3d', 'interaction'],
      category: 'hover',
      prerequisites: [],
      relevantAttrs: ['duration', 'ease', 'trigger', 'trigger-target'],
      example: `<div data-motion='hover-tilt'>Card</div>`,
    },
  },
  'hover-zoom': {
    id: 'hover-zoom',
    label: 'Hover Zoom',
    appliesTo: ['image'],
    // Đặt lên <img> trong wrapper overflow-hidden; listener thường là card
    // cha: data-motion-trigger-target='closest:.card'.
    from: { scale: 1 },
    to: { scale: 1.08 },
    defaults: { duration: 0.5, ease: 'power2.out', trigger: 'hover' },
    meta: {
      summary: 'Phóng ảnh trong khung khi hover card (scale 1→1.08).',
      whenToUse: [
        'Gallery card: hover card → zoom ảnh con',
        'Pattern listener cha + animate img',
      ],
      whenNotToUse: [
        'Entrance Ken Burns → media-zoom',
        'Scale cả card → hover-scale',
      ],
      vs: [
        { id: 'media-zoom', diff: 'in-view settle, không hover' },
        { id: 'hover-scale', diff: 'scale element bất kỳ, không pattern img' },
        { id: 'zoom-in', diff: 'entrance từ nhỏ' },
      ],
      tags: ['hover', 'zoom', 'image', 'interaction'],
      category: 'hover',
      prerequisites: [
        'Đặt lên <img> trong wrapper overflow-hidden',
        'Thường kèm data-motion-trigger-target="closest:.card" trên img',
      ],
      relevantAttrs: ['duration', 'ease', 'trigger', 'trigger-target'],
      example: `<article className='card overflow-hidden'><img data-motion='hover-zoom' data-motion-trigger-target='closest:.card' alt='' /></article>`,
    },
  },
};

export function getMotionEffect(id: string): MotionEffect | undefined {
  return MOTION_EFFECTS[id];
}

export function listMotionEffects(): MotionEffect[] {
  return Object.values(MOTION_EFFECTS).sort((a, b) => a.id.localeCompare(b.id));
}

export function listMotionEffectIndex(): MotionEffectIndexEntry[] {
  return listMotionEffects().map(effect => ({
    id: effect.id,
    label: effect.label,
    category: effect.meta.category,
    tags: effect.meta.tags,
    summary: effect.meta.summary,
    appliesTo: effect.appliesTo,
  }));
}
