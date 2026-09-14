/**
 * Cấu hình các panel lướt ngang — chép từ bundle brunellocucinelli.ai
 * (`home-panel1…5`). Mỗi ảnh: `match` = tiền tố tên file (trước `-x…`),
 * `z` (> 0 xa, < 0 gần), `offsetX/offsetY`, `x/y` ghi đè toạ độ trong tên file.
 * Thứ tự mảng = thứ tự vẽ của trang mẫu.
 *
 * pan: X đi from → to (sine.inOut), dài `x × 0.06vh` (CSS `--x` của trang mẫu).
 * enter: 'reveal' chỉ hiện dần (Life, sau Highlights); 'panelIn' hiện dần kèm
 * z 0.2 → 0 (scale 0.92 → 1) như `c-home__st--panel-in`.
 */
export type PanelImage = {
  match: string;
  z: number;
  offsetX?: number;
  offsetY?: number;
  x?: number;
  y?: number;
};

export type PanelConfig = {
  id: string;
  dir: string;
  enter: 'reveal' | 'panelIn';
  pan: { from: number; to: number; x: number };
  images: PanelImage[];
};

const seq = (
  prefix: string,
  from: number,
  to: number,
  cfg: Omit<PanelImage, 'match'>
) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    match: `${prefix}-${String(from + i).padStart(2, '0')}`,
    ...cfg,
  }));

export const LIFE_PANEL: PanelConfig = {
  id: 'life',
  dir: '03-life',
  enter: 'reveal',
  pan: { from: -1050, to: -5600, x: 4450 },
  images: [
    ...seq('life-clouds', 1, 4, { z: 1 }),
    ...seq('life-farm', 1, 3, { z: 0 }),
    { match: 'life-memories-01', z: -0.8, offsetX: 500 },
    { match: 'life-memories-02', z: -1, offsetX: 500 },
    { match: 'life-midground-01', z: -0.2, offsetX: -50 },
    { match: 'life-midground-02', z: -0.1 },
    { match: 'life-foreground-01', z: -1.3, offsetX: 60 },
    { match: 'life-foreground-02', z: -0.6, offsetX: -100, y: 5 },
    { match: 'life-foreground-03', z: -0.5, offsetX: 250 },
    { match: 'life-memories-fg-01', z: -2, offsetX: 1050 },
    { match: 'life-memories-fg-02', z: -2, offsetX: 1100 },
  ],
};

export const HC_PANEL: PanelConfig = {
  id: 'hc',
  dir: '05-humanistic-capitalism',
  enter: 'panelIn',
  pan: { from: -1745, to: -5860, x: 4115 },
  images: [
    { match: 'hc-birthday-bg-01', z: 0.3, x: 290 },
    { match: 'hc-birthday-bg-02', z: 0.3, x: 2547 },
    ...seq('hc-birthday-fg', 1, 2, { z: 0 }),
    { match: 'hc-kant-02', z: -1, offsetX: 350 },
    ...seq('hc-lunch', 1, 5, { z: 0 }),
    { match: 'hc-family-bg', z: 0.2 },
    { match: 'hc-family-fg', z: -0.1, offsetX: 70, offsetY: -50 },
  ],
};

export const COMPANY_PANEL: PanelConfig = {
  id: 'company',
  dir: '04-company',
  enter: 'panelIn',
  pan: { from: -930, to: -5350, x: 4420 },
  images: [
    { match: 'company-trees-bg', z: 1.5, offsetX: -30 },
    ...seq('company-trees-fg', 1, 4, { z: 1, offsetX: -90 }),
    { match: 'company-table', z: 0 },
    { match: 'company-room', z: 0 },
    ...seq('company-busto', 1, 2, { z: -0.3 }),
    { match: 'company-mongolia-bg', z: 2, offsetX: -900 },
    { match: 'company-mongolia-mid', z: 1, offsetX: -600 },
    ...seq('company-mongolia-fg', 1, 3, { z: 0 }),
    { match: 'company-scissor', z: -1.2, offsetX: 500 },
  ],
};

export const AI_PANEL: PanelConfig = {
  id: 'ai',
  dir: '06-ai',
  enter: 'panelIn',
  pan: { from: -950, to: -5400, x: 4450 },
  images: [
    ...seq('ai-clouds', 1, 2, { z: 1, offsetX: -350 }),
    { match: 'ai-hands', z: 0.5, offsetX: -90 },
    { match: 'ai-theano', z: 0.5, offsetX: -180 },
    ...seq('ai-balaustra', 1, 2, { z: 0 }),
    ...seq('ai-dioscuri', 1, 3, { z: -0.2 }),
    ...seq('ai-hands-clouds', 1, 5, { z: -1 }),
    { match: 'ai-column', z: -1, offsetX: 130 },
    ...seq('ai-callimacus', 1, 2, { z: 0 }),
    ...seq('ai-demosthenes', 1, 4, { z: -0.2 }),
    ...seq('ai-faces-bg', 1, 2, { z: 0.5, offsetX: -230 }),
    ...seq('ai-faces-fg', 1, 3, { z: 0 }),
  ],
};

export const SOLOMEO_PANEL: PanelConfig = {
  id: 'solomeo',
  dir: '02-solomeo',
  enter: 'panelIn',
  pan: { from: -985, to: -5610, x: 4175 },
  images: [
    ...seq('solomeo-clouds', 1, 2, { z: 3, offsetX: -230 }),
    { match: 'solomeo-land-01', z: 2.5, offsetX: -60 },
    ...seq('solomeo-bg', 1, 5, { z: 0.5, offsetX: -290 }),
    ...seq('solomeo-scene', 2, 15, { z: 0 }),
    { match: 'solomeo-scene-01', z: 0 },
    ...seq('solomeo-fg', 1, 3, { z: -0.7, offsetX: 200 }),
  ],
};
