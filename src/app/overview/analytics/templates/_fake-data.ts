export type TemplateAnalyticsRow = {
  template_id: string;
  template_title: string | null;
  views: number;
  unique_visitors: number;
  blocks_viewed: number;
  total_clicks: number;
};

export type ActionTarget = { target: string; count: number };

export type ActionBreakdown = {
  action: string;
  count: number;
  unique_visitors: number;
  targets: ActionTarget[];
};

export type FunnelStep = {
  name: string;
  label: string;
  count: number;
  drop_off_pct: number; // % drop từ step trước
};

export type SlideStat = {
  index: number;
  label: string;
  views: number;
  clicks: number;
  avg_dwell_ms: number;
};

export type GalleryImageStat = {
  index: number;
  src: string;
  clicks: number;
  zooms: number;
};

export type BlockBreakdownRow = {
  block_id: string;
  block_type: string | null;
  views: number;
  clicks: number;
  unique_viewers: number;
  avg_dwell_ms: number | null;
  total_dwell_ms: number | null;
  top_action: string | null;
  top_target: string | null;
  // Rich detail (drilldown level 3)
  actions: ActionBreakdown[];
  funnel?: FunnelStep[];
  slides?: SlideStat[];
  images?: GalleryImageStat[];
};

/* ---------- summary ---------- */

export const FAKE_SUMMARY: TemplateAnalyticsRow[] = [
  {
    template_id: 'tpl_01',
    template_title: 'Tour Đà Nẵng 3N2Đ — luxury',
    views: 12_482,
    unique_visitors: 8_124,
    blocks_viewed: 48_310,
    total_clicks: 1_562,
  },
  {
    template_id: 'tpl_02',
    template_title: 'Hạ Long Bay Cruise 2N1Đ',
    views: 9_842,
    unique_visitors: 7_403,
    blocks_viewed: 39_201,
    total_clicks: 1_244,
  },
  {
    template_id: 'tpl_03',
    template_title: 'Sapa Trekking Adventure',
    views: 6_540,
    unique_visitors: 5_210,
    blocks_viewed: 23_800,
    total_clicks: 781,
  },
  {
    template_id: 'tpl_04',
    template_title: 'Phú Quốc Resort 5★',
    views: 4_321,
    unique_visitors: 3_780,
    blocks_viewed: 18_302,
    total_clicks: 520,
  },
  {
    template_id: 'tpl_05',
    template_title: 'Mộc Châu Spring Festival',
    views: 3_120,
    unique_visitors: 2_870,
    blocks_viewed: 12_400,
    total_clicks: 412,
  },
  {
    template_id: 'tpl_06',
    template_title: 'Côn Đảo Eco Tour',
    views: 2_104,
    unique_visitors: 1_982,
    blocks_viewed: 8_420,
    total_clicks: 287,
  },
  {
    template_id: 'tpl_07',
    template_title: 'Cao Bằng — Bản Giốc 4N3Đ',
    views: 1_872,
    unique_visitors: 1_651,
    blocks_viewed: 7_120,
    total_clicks: 198,
  },
  {
    template_id: 'tpl_08',
    template_title: null,
    views: 642,
    unique_visitors: 590,
    blocks_viewed: 2_148,
    total_clicks: 73,
  },
];

/* ---------- breakdown ---------- */

export const FAKE_BREAKDOWN: Record<string, BlockBreakdownRow[]> = {
  tpl_01: [
    {
      block_id: 'blk_hero_01',
      block_type: 'HeroOverlay',
      views: 12_482,
      unique_viewers: 8_124,
      clicks: 672,
      avg_dwell_ms: 8_240,
      total_dwell_ms: 102_852_480,
      top_action: 'cta_click',
      top_target: 'btn-book-now',
      actions: [
        {
          action: 'cta_click',
          count: 672,
          unique_visitors: 583,
          targets: [
            { target: 'btn-book-now', count: 540 },
            { target: 'btn-watch-video', count: 132 },
          ],
        },
        {
          action: 'bg_video_play',
          count: 3_420,
          unique_visitors: 2_840,
          targets: [{ target: 'hero-bg-video', count: 3_420 }],
        },
        {
          action: 'scroll_past',
          count: 8_940,
          unique_visitors: 6_120,
          targets: [],
        },
      ],
    },
    {
      block_id: 'blk_feat_01',
      block_type: 'FeatureSection',
      views: 11_820,
      unique_viewers: 7_910,
      clicks: 234,
      avg_dwell_ms: 12_440,
      total_dwell_ms: 147_040_800,
      top_action: 'feature_click',
      top_target: 'feature-2-included-meals',
      actions: [
        {
          action: 'feature_click',
          count: 234,
          unique_visitors: 198,
          targets: [
            { target: 'feature-2-included-meals', count: 102 },
            { target: 'feature-3-hotel-4star', count: 78 },
            { target: 'feature-1-flight', count: 32 },
            { target: 'feature-4-guide', count: 22 },
          ],
        },
        {
          action: 'feature_hover_long',
          count: 1_120,
          unique_visitors: 820,
          targets: [
            { target: 'feature-2-included-meals', count: 480 },
            { target: 'feature-3-hotel-4star', count: 380 },
          ],
        },
      ],
    },
    {
      block_id: 'blk_gal_01',
      block_type: 'PhotoGallery',
      views: 10_310,
      unique_viewers: 7_410,
      clicks: 412,
      avg_dwell_ms: 18_320,
      total_dwell_ms: 188_879_200,
      top_action: 'image_click',
      top_target: 'gallery-3.jpg',
      actions: [
        {
          action: 'image_click',
          count: 412,
          unique_visitors: 387,
          targets: [
            { target: 'gallery-3.jpg', count: 142 },
            { target: 'gallery-1.jpg', count: 98 },
            { target: 'gallery-7.jpg', count: 82 },
            { target: 'gallery-2.jpg', count: 52 },
          ],
        },
        {
          action: 'lightbox_open',
          count: 240,
          unique_visitors: 218,
          targets: [],
        },
        {
          action: 'image_zoom',
          count: 87,
          unique_visitors: 71,
          targets: [{ target: 'gallery-3.jpg', count: 38 }],
        },
      ],
      images: [
        { index: 1, src: 'gallery-1.jpg', clicks: 98, zooms: 14 },
        { index: 2, src: 'gallery-2.jpg', clicks: 52, zooms: 8 },
        { index: 3, src: 'gallery-3.jpg', clicks: 142, zooms: 38 },
        { index: 4, src: 'gallery-4.jpg', clicks: 32, zooms: 5 },
        { index: 5, src: 'gallery-5.jpg', clicks: 28, zooms: 2 },
        { index: 6, src: 'gallery-6.jpg', clicks: 18, zooms: 1 },
        { index: 7, src: 'gallery-7.jpg', clicks: 82, zooms: 19 },
      ],
    },
    {
      block_id: 'blk_cta_01',
      block_type: 'CtaSection',
      views: 8_240,
      unique_viewers: 6_120,
      clicks: 187,
      avg_dwell_ms: 4_120,
      total_dwell_ms: 33_948_800,
      top_action: 'cta_primary_click',
      top_target: 'btn-book-now',
      actions: [
        {
          action: 'cta_primary_click',
          count: 152,
          unique_visitors: 138,
          targets: [{ target: 'btn-book-now', count: 152 }],
        },
        {
          action: 'cta_secondary_click',
          count: 35,
          unique_visitors: 32,
          targets: [{ target: 'btn-contact', count: 35 }],
        },
      ],
    },
    {
      block_id: 'blk_book_01',
      block_type: 'BookingForm',
      views: 5_460,
      unique_viewers: 4_321,
      clicks: 57,
      avg_dwell_ms: 24_120,
      total_dwell_ms: 131_695_200,
      top_action: 'field_focus',
      top_target: 'field-name',
      actions: [
        {
          action: 'field_focus',
          count: 4_120,
          unique_visitors: 2_840,
          targets: [
            { target: 'field-name', count: 1_820 },
            { target: 'field-phone', count: 1_240 },
            { target: 'field-email', count: 680 },
            { target: 'field-date', count: 380 },
          ],
        },
        {
          action: 'field_blur',
          count: 3_980,
          unique_visitors: 2_820,
          targets: [],
        },
        {
          action: 'field_error',
          count: 320,
          unique_visitors: 248,
          targets: [
            { target: 'field-phone:invalid_format', count: 180 },
            { target: 'field-email:invalid_email', count: 140 },
          ],
        },
        {
          action: 'submit_attempt',
          count: 412,
          unique_visitors: 387,
          targets: [{ target: 'form-booking', count: 412 }],
        },
        {
          action: 'submit_success',
          count: 287,
          unique_visitors: 287,
          targets: [{ target: 'form-booking', count: 287 }],
        },
        {
          action: 'submit_error',
          count: 125,
          unique_visitors: 102,
          targets: [
            { target: 'validation_failed', count: 88 },
            { target: 'rate_limited', count: 22 },
            { target: 'server_error', count: 15 },
          ],
        },
      ],
      funnel: [
        {
          name: 'view',
          label: 'Block xuất hiện',
          count: 5_460,
          drop_off_pct: 0,
        },
        {
          name: 'focus',
          label: 'Focus field đầu',
          count: 2_840,
          drop_off_pct: 48,
        },
        {
          name: 'fill',
          label: 'Điền ≥ 1 field',
          count: 1_820,
          drop_off_pct: 36,
        },
        {
          name: 'submit_attempt',
          label: 'Bấm Submit',
          count: 412,
          drop_off_pct: 77,
        },
        {
          name: 'submit_success',
          label: 'Submit thành công',
          count: 287,
          drop_off_pct: 30,
        },
      ],
    },
  ],

  tpl_02: [
    {
      block_id: 'blk_hero_02',
      block_type: 'HeroSplit',
      views: 9_842,
      unique_viewers: 7_403,
      clicks: 543,
      avg_dwell_ms: 7_820,
      total_dwell_ms: 76_964_440,
      top_action: 'cta_click',
      top_target: 'btn-explore',
      actions: [
        {
          action: 'cta_click',
          count: 543,
          unique_visitors: 481,
          targets: [
            { target: 'btn-explore', count: 421 },
            { target: 'btn-watch-trailer', count: 122 },
          ],
        },
        {
          action: 'scroll_past',
          count: 7_120,
          unique_visitors: 5_420,
          targets: [],
        },
      ],
    },
    {
      block_id: 'blk_carousel_02',
      block_type: 'ImageCarousel',
      views: 8_201,
      unique_viewers: 6_840,
      clicks: 381,
      avg_dwell_ms: 21_400,
      total_dwell_ms: 175_501_400,
      top_action: 'swipe_next',
      top_target: 'slide-2',
      actions: [
        {
          action: 'swipe_next',
          count: 4_820,
          unique_visitors: 3_120,
          targets: [
            { target: 'slide-1→slide-2', count: 2_840 },
            { target: 'slide-2→slide-3', count: 1_240 },
            { target: 'slide-3→slide-4', count: 740 },
          ],
        },
        {
          action: 'swipe_prev',
          count: 1_240,
          unique_visitors: 820,
          targets: [],
        },
        {
          action: 'dot_click',
          count: 287,
          unique_visitors: 198,
          targets: [
            { target: 'dot-2', count: 142 },
            { target: 'dot-3', count: 78 },
            { target: 'dot-1', count: 67 },
          ],
        },
        {
          action: 'slide_click',
          count: 381,
          unique_visitors: 320,
          targets: [
            { target: 'slide-2', count: 187 },
            { target: 'slide-3', count: 102 },
            { target: 'slide-1', count: 92 },
          ],
        },
        {
          action: 'autoplay_pause',
          count: 1_820,
          unique_visitors: 1_420,
          targets: [],
        },
      ],
      slides: [
        {
          index: 1,
          label: 'Cabin sang trọng',
          views: 8_201,
          clicks: 92,
          avg_dwell_ms: 4_200,
        },
        {
          index: 2,
          label: 'Buổi sáng trên vịnh',
          views: 5_361,
          clicks: 187,
          avg_dwell_ms: 7_800,
        },
        {
          index: 3,
          label: 'Hoàng hôn',
          views: 4_121,
          clicks: 102,
          avg_dwell_ms: 6_200,
        },
        {
          index: 4,
          label: 'Hoạt động chèo kayak',
          views: 3_381,
          clicks: 0,
          avg_dwell_ms: 3_120,
        },
      ],
    },
    {
      block_id: 'blk_book_02',
      block_type: 'BookingForm',
      views: 4_120,
      unique_viewers: 3_520,
      clicks: 47,
      avg_dwell_ms: 22_400,
      total_dwell_ms: 92_288_000,
      top_action: 'submit_success',
      top_target: 'form-booking',
      actions: [
        {
          action: 'field_focus',
          count: 2_840,
          unique_visitors: 1_920,
          targets: [],
        },
        {
          action: 'submit_success',
          count: 198,
          unique_visitors: 198,
          targets: [{ target: 'form-booking', count: 198 }],
        },
        {
          action: 'submit_error',
          count: 87,
          unique_visitors: 78,
          targets: [{ target: 'validation_failed', count: 65 }],
        },
      ],
      funnel: [
        {
          name: 'view',
          label: 'Block xuất hiện',
          count: 4_120,
          drop_off_pct: 0,
        },
        {
          name: 'focus',
          label: 'Focus field đầu',
          count: 1_920,
          drop_off_pct: 53,
        },
        {
          name: 'fill',
          label: 'Điền ≥ 1 field',
          count: 1_240,
          drop_off_pct: 35,
        },
        {
          name: 'submit_attempt',
          label: 'Bấm Submit',
          count: 285,
          drop_off_pct: 77,
        },
        {
          name: 'submit_success',
          label: 'Submit thành công',
          count: 198,
          drop_off_pct: 31,
        },
      ],
    },
  ],

  tpl_03: [
    {
      block_id: 'blk_hero_03',
      block_type: 'HeroOverlay',
      views: 6_540,
      unique_viewers: 5_210,
      clicks: 387,
      avg_dwell_ms: 6_840,
      total_dwell_ms: 44_733_600,
      top_action: 'cta_click',
      top_target: 'btn-discover',
      actions: [
        {
          action: 'cta_click',
          count: 387,
          unique_visitors: 340,
          targets: [{ target: 'btn-discover', count: 387 }],
        },
      ],
    },
    {
      block_id: 'blk_feat_03',
      block_type: 'FeatureSection',
      views: 5_820,
      unique_viewers: 4_910,
      clicks: 102,
      avg_dwell_ms: 9_420,
      total_dwell_ms: 54_824_400,
      top_action: 'feature_hover_long',
      top_target: 'feat-difficulty',
      actions: [
        {
          action: 'feature_click',
          count: 102,
          unique_visitors: 92,
          targets: [{ target: 'feat-difficulty', count: 68 }],
        },
        {
          action: 'feature_hover_long',
          count: 820,
          unique_visitors: 640,
          targets: [],
        },
      ],
    },
  ],

  tpl_04: [
    {
      block_id: 'blk_hero_04',
      block_type: 'HeroSplit',
      views: 4_321,
      unique_viewers: 3_780,
      clicks: 248,
      avg_dwell_ms: 9_120,
      total_dwell_ms: 39_407_520,
      top_action: 'cta_click',
      top_target: 'btn-reserve',
      actions: [
        {
          action: 'cta_click',
          count: 248,
          unique_visitors: 221,
          targets: [{ target: 'btn-reserve', count: 248 }],
        },
      ],
    },
  ],

  tpl_05: [
    {
      block_id: 'blk_hero_05',
      block_type: 'HeroOverlay',
      views: 3_120,
      unique_viewers: 2_870,
      clicks: 198,
      avg_dwell_ms: 5_720,
      total_dwell_ms: 17_846_400,
      top_action: 'cta_click',
      top_target: 'btn-join',
      actions: [
        {
          action: 'cta_click',
          count: 198,
          unique_visitors: 184,
          targets: [{ target: 'btn-join', count: 198 }],
        },
      ],
    },
  ],
};

export type RangePreset = '7d' | '30d' | '90d' | 'all';

export const PRESET_LABEL: Record<RangePreset, string> = {
  '7d': '7 ngày',
  '30d': '30 ngày',
  '90d': '90 ngày',
  all: 'Tất cả',
};

export const PRESET_MULTIPLIER: Record<RangePreset, number> = {
  '7d': 0.18,
  '30d': 0.55,
  '90d': 0.85,
  all: 1,
};

export function applyPreset(
  rows: TemplateAnalyticsRow[],
  preset: RangePreset
): TemplateAnalyticsRow[] {
  const m = PRESET_MULTIPLIER[preset];
  if (m === 1) return rows;
  return rows.map(r => ({
    ...r,
    views: Math.round(r.views * m),
    unique_visitors: Math.round(r.unique_visitors * m),
    blocks_viewed: Math.round(r.blocks_viewed * m),
    total_clicks: Math.round(r.total_clicks * m),
  }));
}

export function applyPresetBreakdown(
  rows: BlockBreakdownRow[],
  preset: RangePreset
): BlockBreakdownRow[] {
  const m = PRESET_MULTIPLIER[preset];
  if (m === 1) return rows;
  return rows.map(r => ({
    ...r,
    views: Math.round(r.views * m),
    unique_viewers: Math.round(r.unique_viewers * m),
    clicks: Math.round(r.clicks * m),
    total_dwell_ms: r.total_dwell_ms
      ? Math.round(r.total_dwell_ms * m)
      : r.total_dwell_ms,
    actions: r.actions.map(a => ({
      ...a,
      count: Math.round(a.count * m),
      unique_visitors: Math.round(a.unique_visitors * m),
      targets: a.targets.map(t => ({ ...t, count: Math.round(t.count * m) })),
    })),
    funnel: r.funnel?.map(f => ({
      ...f,
      count: Math.round(f.count * m),
    })),
    slides: r.slides?.map(s => ({
      ...s,
      views: Math.round(s.views * m),
      clicks: Math.round(s.clicks * m),
    })),
    images: r.images?.map(i => ({
      ...i,
      clicks: Math.round(i.clicks * m),
      zooms: Math.round(i.zooms * m),
    })),
  }));
}

/* ---------- action taxonomy per block type (used in tooltip / docs) ---------- */

export const ACTION_TAXONOMY: Record<
  string,
  { actions: string[]; description: string }
> = {
  HeroOverlay: {
    actions: ['cta_click', 'bg_video_play', 'bg_video_pause', 'scroll_past'],
    description: 'Hero có overlay text + CTA chính',
  },
  HeroSplit: {
    actions: ['cta_click', 'scroll_past'],
    description: 'Hero chia 2 cột: text + ảnh/video',
  },
  FeatureSection: {
    actions: ['feature_click', 'feature_hover_long', 'read_more_click'],
    description: 'Grid các tính năng / điểm bán hàng',
  },
  PhotoGallery: {
    actions: [
      'image_click',
      'lightbox_open',
      'lightbox_close',
      'image_zoom',
      'swipe_next',
      'swipe_prev',
    ],
    description: 'Lưới ảnh có lightbox',
  },
  ImageCarousel: {
    actions: [
      'swipe_next',
      'swipe_prev',
      'dot_click',
      'slide_click',
      'autoplay_pause',
      'autoplay_resume',
    ],
    description: 'Slider ảnh nhiều slide',
  },
  CtaSection: {
    actions: ['cta_primary_click', 'cta_secondary_click'],
    description: 'Block CTA độc lập',
  },
  BookingForm: {
    actions: [
      'field_focus',
      'field_blur',
      'field_error',
      'field_abandon',
      'submit_attempt',
      'submit_success',
      'submit_error',
    ],
    description: 'Form nhận booking / lead — có funnel view',
  },
  Hotspot: {
    actions: ['hotspot_hover', 'hotspot_click', 'hotspot_link_open'],
    description: 'Extra element gắn lên ảnh',
  },
};
