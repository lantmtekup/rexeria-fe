import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  Image as ImageIcon,
  Package,
  Target,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

import type {
  ExperienceGoal,
  GoalRanking,
  InsightBrief,
  InsightStepSuggestion,
  SuggestJourneyResponse,
} from '@/services/rexer/types';

/**
 * Logic phía client cho wizard v2 (intake nhiều bước).
 *
 * Gồm: cấu hình bước, hằng số chọn, và 3 heuristic tạm thời thay cho endpoint BE
 * (`suggest`, `classify-goal`, `suggest-journey`). Heuristic ở đây là gợi ý DẪN
 * HƯỚNG dựa trên quy tắc đơn giản — KHÔNG phải suy luận AI thật; UI luôn gắn nhãn
 * trung thực. Khi BE deploy 3 endpoint, container ưu tiên dữ liệu BE và bỏ heuristic.
 */

export type StepId =
  | 'brand'
  | 'product'
  | 'objective'
  | 'audience'
  | 'market'
  | 'assets'
  | 'challenges'
  | 'goal'
  | 'journey'
  | 'review';

export interface StepDef {
  id: StepId;
  icon: LucideIcon;
  /** 0 = nhập liệu, 1 = AI phân tích (goal/journey/review). */
  phase: 0 | 1;
  /** Bước có lớp AI (goal/journey) → tô accent violet. */
  ai?: boolean;
}

/** 10 bước cố định; nhãn lấy từ i18n `intake.steps.<id>`. */
export const STEPS: StepDef[] = [
  { id: 'brand', icon: Building2, phase: 0 },
  { id: 'product', icon: Package, phase: 0 },
  { id: 'objective', icon: Target, phase: 0 },
  { id: 'audience', icon: Users, phase: 0 },
  { id: 'market', icon: TrendingUp, phase: 0 },
  { id: 'assets', icon: ImageIcon, phase: 0 },
  { id: 'challenges', icon: AlertTriangle, phase: 0 },
  { id: 'goal', icon: Target, phase: 1, ai: true },
  { id: 'journey', icon: Workflow, phase: 1, ai: true },
  { id: 'review', icon: ClipboardCheck, phase: 1 },
];

/** Index bước đầu tiên thuộc phase AI — dùng để chèn divider trong sidebar. */
export const FIRST_AI_INDEX = STEPS.findIndex(s => s.ai);

export const TONES = [
  'Sang trọng',
  'Tin cậy',
  'Cảm xúc',
  'Hiện đại',
  'Thân thiện',
];
export const OBJECTIVES = [
  'Nhận biết',
  'Giáo dục',
  'Thu lead',
  'Chuyển đổi',
  'Ra mắt',
];
export const DEVICES: Array<'mobile' | 'desktop' | 'both'> = [
  'mobile',
  'desktop',
  'both',
];
export const CHALLENGES = [
  'Chuyển đổi thấp',
  'Giá trị sản phẩm chưa rõ',
  'Tương tác yếu',
  'Chu kỳ bán dài',
];

/** Thứ tự + nhãn EN của 6 Experience Goal (nhãn VN lấy từ i18n `goals.*`). */
export const GOAL_META: Array<{ id: ExperienceGoal; en: string }> = [
  { id: 'product_discovery', en: 'Product Discovery' },
  { id: 'interactive_story', en: 'Interactive / Curated Story' },
  { id: 'comparison', en: 'Comparison' },
  { id: 'lead_excitement', en: 'Lead / Excitement Generation' },
  { id: 'brand_storytelling', en: 'Brand Storytelling' },
  { id: 'guided_decision', en: 'Guided Decision-making' },
];

// ── Phát hiện ngành từ brief (cho journey pattern) ──────────────────────────

type Industry =
  | 'real_estate'
  | 'saas'
  | 'fashion'
  | 'fintech'
  | 'education'
  | 'ecommerce'
  | 'generic';

const INDUSTRY_KEYWORDS: Array<[Industry, string[]]> = [
  [
    'real_estate',
    [
      'căn hộ',
      'bđs',
      'bất động sản',
      'dự án',
      'ven sông',
      'chung cư',
      'nhà phố',
      'villa',
      'biệt thự',
    ],
  ],
  [
    'saas',
    ['phần mềm', 'saas', 'nền tảng', 'ứng dụng', 'app', 'hrm', 'crm', 'erp'],
  ],
  [
    'fashion',
    [
      'thời trang',
      'bộ sưu tập',
      'đồng hồ',
      'trang sức',
      'xa xỉ',
      'luxury',
      'lookbook',
    ],
  ],
  [
    'fintech',
    [
      'đầu tư',
      'tài chính',
      'ngân hàng',
      'ví điện tử',
      'lợi suất',
      'tích luỹ',
      'chứng khoán',
    ],
  ],
  [
    'education',
    ['khoá học', 'khóa học', 'đào tạo', 'chứng chỉ', 'giảng viên', 'học viên'],
  ],
  [
    'ecommerce',
    ['flash sale', 'giảm giá', 'mua sắm', 'combo', 'freeship', 'sale sốc'],
  ],
];

function briefHaystack(brief: InsightBrief): string {
  return [
    brief.brand?.name,
    brief.brand?.positioning,
    brief.product?.benefits,
    ...(brief.product?.use_cases ?? []),
    ...(brief.product?.features ?? []),
    brief.audience?.persona,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function detectIndustry(brief: InsightBrief): Industry {
  const hay = briefHaystack(brief);
  for (const [industry, kws] of INDUSTRY_KEYWORDS) {
    if (kws.some(k => hay.includes(k))) return industry;
  }
  return 'generic';
}

// ── Heuristic 1: gợi ý lũy tiến cho từng bước ───────────────────────────────

/**
 * Trả gợi ý dẫn hướng cho 1 bước dựa trên các bước trước. `null` nếu bước không có
 * gợi ý (vd `brand` là bước đầu, chưa có gì để dựa vào).
 */
export function localSuggest(
  step: StepId,
  brief: InsightBrief
): InsightStepSuggestion | null {
  const tone = brief.brand?.tone ?? [];
  const isPremium = tone.includes('Sang trọng') || tone.includes('Cảm xúc');
  const industry = detectIndustry(brief);
  const longCycle = industry === 'real_estate' || industry === 'fintech';

  switch (step) {
    case 'product':
      return {
        text: isPremium
          ? 'Định vị cao cấp → ưu tiên nhấn các tính năng đẳng cấp và yếu tố tạo niềm tin (pháp lý, bảo hành, chứng nhận).'
          : 'Liệt kê 3-5 tính năng tạo khác biệt rõ nhất; mỗi dòng một ý để AI map vào block.',
        based_on: ['Thương hiệu'],
      };
    case 'objective':
      return {
        text: longCycle
          ? 'Sản phẩm giá trị cao, chu kỳ quyết định dài → mục tiêu phù hợp nhất là Thu lead.'
          : 'Sản phẩm chu kỳ ngắn → có thể nhắm thẳng Chuyển đổi.',
        based_on: ['Sản phẩm'],
        values: {
          campaign_objectives: longCycle ? ['Thu lead'] : ['Chuyển đổi'],
        },
      };
    case 'audience':
      return {
        text: 'Mô tả pain point càng cụ thể càng tốt. Đây là tín hiệu chính để AI chèn stage giảm rủi ro (Risk Reducer) vào journey.',
        based_on: ['Sản phẩm', 'Mục tiêu'],
      };
    case 'market':
      return {
        text: 'Nêu đối thủ cùng phân khúc + xu hướng nổi bật để AI biết cần nhấn điểm khác biệt nào.',
        based_on: ['Sản phẩm', 'Đối tượng'],
      };
    case 'assets':
      return {
        text: 'Để dựng trải nghiệm cảm xúc + uy tín, nên có: ảnh/video chất lượng cao và tài liệu chứng thực (giấy tờ, review, case study).',
        based_on: ['Đối tượng'],
      };
    case 'challenges':
      return {
        text: longCycle
          ? 'Mục tiêu Thu lead + chu kỳ dài → thách thức điển hình: chuyển đổi thấp, chu kỳ bán dài.'
          : 'Chọn đúng thách thức đang cản trở để AI ưu tiên block tháo gỡ nó.',
        based_on: ['Mục tiêu'],
      };
    default:
      return null;
  }
}

// ── Heuristic 2: xếp hạng Experience Goal ───────────────────────────────────

const GOAL_RATIONALE: Record<ExperienceGoal, string> = {
  product_discovery: 'Nhiều tính năng cần được khám phá trực quan.',
  interactive_story: 'Thương hiệu giàu cảm xúc, hợp kể chuyện tương tác.',
  comparison: 'Khách cân nhắc giữa nhiều lựa chọn, cần so sánh rõ.',
  lead_excitement:
    'Mục tiêu thu lead + chu kỳ dài → khơi gợi mong muốn để lấy thông tin.',
  brand_storytelling:
    'Tone sang trọng/cảm xúc → kể chuyện thương hiệu tạo niềm tin.',
  guided_decision: 'Nhiều pain point → cần dẫn dắt từng bước tới quyết định.',
};

/**
 * Chấm điểm 6 goal từ tín hiệu brief rồi normalize thành confidence (tổng ≈ 1).
 * Trả mảng đã sắp giảm dần; gắn rank primary/secondary/other.
 */
export function localClassifyGoal(brief: InsightBrief): GoalRanking[] {
  const tone = brief.brand?.tone ?? [];
  const objectives = brief.objective?.campaign_objectives ?? [];
  const pains = brief.audience?.pain_points ?? [];
  const challenges = brief.challenges ?? [];
  const featureCount = (brief.product?.features ?? []).length;
  const hasCompetitors = Boolean(brief.market?.competitors?.trim());

  const score: Record<ExperienceGoal, number> = {
    product_discovery: 1,
    interactive_story: 1,
    comparison: 1,
    lead_excitement: 1,
    brand_storytelling: 1,
    guided_decision: 1,
  };

  if (objectives.includes('Thu lead')) score.lead_excitement += 3;
  if (objectives.includes('Chuyển đổi')) {
    score.lead_excitement += 1;
    score.guided_decision += 2;
  }
  if (objectives.includes('Nhận biết') || objectives.includes('Ra mắt')) {
    score.brand_storytelling += 2;
    score.product_discovery += 1;
  }
  if (objectives.includes('Giáo dục')) score.product_discovery += 2;

  if (tone.includes('Sang trọng')) score.brand_storytelling += 2;
  if (tone.includes('Cảm xúc')) {
    score.brand_storytelling += 1;
    score.interactive_story += 2;
  }
  if (tone.includes('Hiện đại')) score.interactive_story += 1;

  if (pains.length >= 2) {
    score.guided_decision += 2;
    score.lead_excitement += 1;
  }
  if (challenges.includes('Giá trị sản phẩm chưa rõ') || hasCompetitors) {
    score.comparison += 2;
  }
  if (challenges.includes('Chu kỳ bán dài')) score.lead_excitement += 1;
  if (featureCount >= 4) score.product_discovery += 1;

  const total = Object.values(score).reduce((a, b) => a + b, 0);
  const ranked = GOAL_META.map(({ id }) => ({
    goal: id,
    confidence: score[id] / total,
    rationale: GOAL_RATIONALE[id],
  })).sort((a, b) => b.confidence - a.confidence);

  return ranked.map((g, i) => ({
    ...g,
    rank: i === 0 ? 'primary' : i === 1 ? 'secondary' : 'other',
  })) as GoalRanking[];
}

// ── Heuristic 3: đề xuất journey theo goal ──────────────────────────────────

/** Pattern ngành (nhãn EN hiển thị) cho phần tham chiếu. */
const INDUSTRY_PATTERN: Record<Industry, { name: string; stages: string[] }> = {
  real_estate: {
    name: 'REAL ESTATE',
    stages: ['Vision', 'Location', 'Lifestyle', 'Investment Value', 'Inquiry'],
  },
  saas: {
    name: 'SAAS',
    stages: ['Problem', 'Solution', 'How It Works', 'Proof', 'Get Started'],
  },
  fashion: {
    name: 'FASHION / LUXURY',
    stages: ['Mood', 'Collection', 'Detail', 'Styling', 'Shop'],
  },
  fintech: {
    name: 'FINTECH',
    stages: ['Trust', 'How It Works', 'Returns', 'Security', 'Open Account'],
  },
  education: {
    name: 'EDUCATION',
    stages: ['Goal', 'Curriculum', 'Mentors', 'Outcomes', 'Enroll'],
  },
  ecommerce: {
    name: 'ECOMMERCE',
    stages: ['Hook', 'Offer', 'Products', 'Proof', 'Checkout'],
  },
  generic: {
    name: 'GENERIC',
    stages: ['Attract', 'Engage', 'Reassure', 'Convert'],
  },
};

/** Stage VN (name + intent) theo ngành; stage cuối sẽ tinh chỉnh theo goal. */
const JOURNEY_TEMPLATES: Record<
  Industry,
  Array<{ key: string; name: string; intent: string }>
> = {
  real_estate: [
    {
      key: 'vision',
      name: 'Khám phá vẻ đẹp tổng quan',
      intent: 'Thu hút chú ý',
    },
    {
      key: 'lifestyle',
      name: 'Trải nghiệm tiện ích đẳng cấp',
      intent: 'Kết nối cảm xúc',
    },
    { key: 'reassure', name: 'Cam kết an tâm pháp lý', intent: 'Giảm rủi ro' },
    {
      key: 'inquiry',
      name: 'Đăng ký ưu đãi & tham quan',
      intent: 'Chuyển đổi',
    },
  ],
  saas: [
    {
      key: 'problem',
      name: 'Gọi tên vấn đề của khách',
      intent: 'Thu hút chú ý',
    },
    { key: 'solution', name: 'Giới thiệu giải pháp', intent: 'Tạo quan tâm' },
    { key: 'how', name: 'Cách hoạt động & tính năng', intent: 'Thuyết phục' },
    { key: 'proof', name: 'Bằng chứng & khách hàng', intent: 'Tạo niềm tin' },
    { key: 'start', name: 'Bắt đầu dùng thử', intent: 'Chuyển đổi' },
  ],
  fashion: [
    {
      key: 'mood',
      name: 'Khơi gợi cảm hứng bộ sưu tập',
      intent: 'Thu hút chú ý',
    },
    { key: 'collection', name: 'Khám phá sản phẩm', intent: 'Kết nối cảm xúc' },
    {
      key: 'detail',
      name: 'Chi tiết thủ công & chất liệu',
      intent: 'Thuyết phục',
    },
    { key: 'shop', name: 'Đặt mua / liên hệ', intent: 'Chuyển đổi' },
  ],
  fintech: [
    {
      key: 'trust',
      name: 'Khẳng định uy tín & cấp phép',
      intent: 'Tạo niềm tin',
    },
    { key: 'how', name: 'Cách thức hoạt động', intent: 'Thuyết phục' },
    { key: 'security', name: 'An toàn & minh bạch', intent: 'Giảm rủi ro' },
    { key: 'open', name: 'Mở tài khoản / tải app', intent: 'Chuyển đổi' },
  ],
  education: [
    { key: 'goal', name: 'Mục tiêu nghề nghiệp', intent: 'Thu hút chú ý' },
    {
      key: 'curriculum',
      name: 'Lộ trình & nội dung học',
      intent: 'Tạo quan tâm',
    },
    { key: 'outcomes', name: 'Kết quả học viên', intent: 'Tạo niềm tin' },
    { key: 'enroll', name: 'Đăng ký học thử', intent: 'Chuyển đổi' },
  ],
  ecommerce: [
    { key: 'hook', name: 'Tạo chú ý bằng ưu đãi', intent: 'Thu hút chú ý' },
    { key: 'products', name: 'Trưng bày sản phẩm', intent: 'Tạo quan tâm' },
    { key: 'proof', name: 'Đánh giá & uy tín', intent: 'Tạo niềm tin' },
    { key: 'checkout', name: 'Chốt đơn nhanh', intent: 'Chuyển đổi' },
  ],
  generic: [
    { key: 'attract', name: 'Thu hút sự chú ý', intent: 'Thu hút chú ý' },
    { key: 'engage', name: 'Tạo tương tác & quan tâm', intent: 'Tạo quan tâm' },
    { key: 'reassure', name: 'Củng cố niềm tin', intent: 'Giảm rủi ro' },
    { key: 'convert', name: 'Kêu gọi hành động', intent: 'Chuyển đổi' },
  ],
};

/** Tinh chỉnh tên stage cuối theo goal đã chốt (để journey "ăn" theo mục tiêu). */
const FINAL_STAGE_BY_GOAL: Partial<Record<ExperienceGoal, string>> = {
  lead_excitement: 'Đăng ký ưu đãi & thu lead',
  guided_decision: 'Hỗ trợ ra quyết định cuối',
  comparison: 'Chọn phương án & liên hệ',
};

/**
 * Dựng journey đề xuất từ ngành phát hiện được + goal đã chốt. Trả về cùng shape
 * như endpoint `suggest-journey` để container dùng chung đường render.
 */
export function localSuggestJourney(
  brief: InsightBrief,
  primaryGoal: ExperienceGoal
): SuggestJourneyResponse {
  const industry = detectIndustry(brief);
  const pattern = INDUSTRY_PATTERN[industry];
  const template = JOURNEY_TEMPLATES[industry];

  const stages = template.map((st, i) => {
    const isLast = i === template.length - 1;
    const name =
      isLast && FINAL_STAGE_BY_GOAL[primaryGoal]
        ? FINAL_STAGE_BY_GOAL[primaryGoal]!
        : st.name;
    return {
      key: st.key,
      name,
      intent: st.intent,
      rationale: '',
    };
  });

  return {
    journey: {
      journey_pattern_name: pattern.name,
      rationale: `Áp mẫu journey ngành ${pattern.name}, tùy biến theo mục tiêu đã chốt.`,
      stages,
    },
    industry_pattern: pattern,
  };
}
