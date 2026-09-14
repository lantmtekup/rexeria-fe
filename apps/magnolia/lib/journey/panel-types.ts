/**
 * Cấu hình một chương lướt ngang. Mỗi ảnh: `match` = tiền tố tên file (trước `-x…`),
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
  /**
   * Blend riêng của lớp. Nền giấy thì cả cảnh multiply nên không cần;
   * nền tối thì lớp sáng (nắng, sương) phải 'screen' — đen thành vô hình,
   * đúng phép đảo của multiply.
   */
  blend?: 'screen' | 'multiply';
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
