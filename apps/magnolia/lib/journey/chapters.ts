import type { PanelConfig } from './panel-types';

/**
 * Hai chương lướt ngang của trang, dựng bằng render sẵn có của Magnolia.
 *
 * Nền than nên luật blend đảo so với trang mẫu tranh khắc: ở đó cả cảnh
 * `multiply` và TRẮNG là vô hình; ở đây cảnh vẽ thường, và các lớp sáng
 * (nắng, sương) đi qua `screen` nên ĐEN là vô hình.
 *
 * Thứ tự mảng = thứ tự vẽ. `z` > 0 trôi chậm hơn camera (xa), < 0 nhanh hơn
 * (gần). Toạ độ đặt lớp đọc từ tên file, không khai trong code.
 *
 * Trụ ở đường ghép là điểm mấu chốt và không hiển nhiên: nó phải ở z = 0,
 * cùng tốc độ với nền. Lớp tiền cảnh (z < 0) trôi lệch so với nền nên chỉ che
 * được đường ghép ở đúng một khoảnh khắc.
 *
 * Mỗi đường ghép dùng hai lớp: `pier` là dải bóng loang 360 px mỗi bên — thứ
 * xoá bậc sáng giữa hai render lệch tông; `stone` là trụ travertine có nẹp
 * đồng thật, che đúng đường cắt. Lớp `fg` cũng là trụ đó nhưng đã nhoè như
 * vật sát ống kính trong một cú lia.
 */

/** Sảnh đón — canvas 5905×1080, đường ghép tại x 1963 và 3910. */
export const ARRIVAL_CHAPTER: PanelConfig = {
  id: 'arrival',
  dir: 'journey/arrival',
  enter: 'panelIn',
  // Tâm camera 1010 → 4900. Nửa khung nhìn ở 16:9 là 914 px nên hai đầu vừa
  // đủ không hở mép. Dài cuộn = 3890 × 0.0006 ≈ 233vh.
  pan: { from: -1010, to: -4900, x: 3890 },
  images: [
    { match: 'arrival-base-01', z: 0 },
    { match: 'arrival-base-02', z: 0 },
    { match: 'arrival-base-03', z: 0 },

    // Hai lớp ở mỗi đường ghép, cùng z = 0:
    //   pier  — dải bóng loang, xoá bậc sáng giữa hai render lệch tông;
    //   stone — trụ travertine + nẹp đồng thật, che đúng đường cắt.
    { match: 'arrival-pier-01', z: 0 },
    { match: 'arrival-pier-02', z: 0 },
    { match: 'arrival-stone-01', z: 0 },
    { match: 'arrival-stone-02', z: 0 },

    { match: 'arrival-haze-01', z: 0.8, blend: 'screen' },
    { match: 'arrival-haze-02', z: 0.8, blend: 'screen' },
    { match: 'arrival-haze-03', z: 0.8, blend: 'screen' },

    { match: 'arrival-light-01', z: -0.4, blend: 'screen' },
    { match: 'arrival-light-02', z: -0.4, blend: 'screen' },

    { match: 'arrival-fg-01', z: -1.2 },
    { match: 'arrival-fg-02', z: -1.2 },
    { match: 'arrival-fg-03', z: -1.4 },
    { match: 'arrival-fg-04', z: -1.2 },
  ],
};

/**
 * Một ngày — canvas 6400×1080, đường ghép tại x 1600 / 3200 / 4800.
 * Sáng → trưa → chiều → tối đặt trên trục ngang, nên THỜI GIAN thành KHOẢNG
 * CÁCH: cuộn sang phải là mặt trời đi, thay vì bốn lần chớp mắt của stack
 * cross-fade cũ. Sương dày dần về cuối dải — buổi tối mù hơn buổi sáng.
 */
export const DAY_CHAPTER: PanelConfig = {
  id: 'day',
  dir: 'journey/day',
  enter: 'panelIn',
  pan: { from: -1010, to: -5400, x: 4390 },
  images: [
    { match: 'day-base-01', z: 0 },
    { match: 'day-base-02', z: 0 },
    { match: 'day-base-03', z: 0 },
    { match: 'day-base-04', z: 0 },

    { match: 'day-pier-01', z: 0 },
    { match: 'day-pier-02', z: 0 },
    { match: 'day-pier-03', z: 0 },
    { match: 'day-stone-01', z: 0 },
    { match: 'day-stone-02', z: 0 },
    { match: 'day-stone-03', z: 0 },

    { match: 'day-haze-01', z: 0.8, blend: 'screen' },
    { match: 'day-haze-02', z: 0.8, blend: 'screen' },
    { match: 'day-haze-03', z: 0.8, blend: 'screen' },

    { match: 'day-fg-01', z: -1.2 },
    { match: 'day-fg-02', z: -1.3 },
    { match: 'day-fg-03', z: -1.2 },
    { match: 'day-fg-04', z: -1.2 },
  ],
};

/** Thứ tự nhóm khi đọc thư mục — từ xa tới gần. */
export const ARRIVAL_GROUPS = ['base', 'pier', 'haze', 'light', 'fg'];
export const DAY_GROUPS = ['base', 'pier', 'haze', 'fg'];

/** Nền than của cả hành trình (charcoal-950). */
export const JOURNEY_GROUND = '#0b0908';
