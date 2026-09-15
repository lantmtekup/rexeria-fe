/**
 * "Một ngày tại Magnolia" — tranh tổng thể kéo-zoom, có bookmark dẫn đường.
 *
 * Đây là bản tự dựng của cơ chế Endless Paper WebXP: canvas một tấm, kéo để
 * di chuyển, cuộn để zoom, và bookmark bay tới từng vùng. Lý do không dùng
 * WebXP thật: nội dung chỉ tạo được trên iPad, canvas host trên server của
 * họ, publish lại là sinh URL mới (URL cũ chết), subscription hết hạn là
 * WebXP bị xoá, và bản thương mại phải hỏi giá riêng. Với một trang bán hàng
 * thì bốn điều đó đều là rủi ro thật.
 *
 * ĐỘ NÉT THEO TẦNG là điểm chính, và cũng là điều bản brief nói đúng: một
 * ảnh tổng thể 1536×1024 zoom sâu sẽ nhoè. Nên tranh tổng thể chỉ là NỀN ở
 * mức zoom thấp; zoom vào một vùng thì hai ảnh render gốc 2400px của vùng đó
 * hiện lên đè lên nền. Ảnh gốc chỉ tải khi sắp cần.
 *
 * Hành trình theo chiều kim đồng hồ, khớp đúng bố cục tranh:
 *   trên-trái   Sáng    — sân vườn, vận động
 *   trên-phải   Trưa    — tầm nhìn thành phố, gia đình
 *   dưới-phải   Chiều   — spa, dạo bước
 *   dưới-trái   Tối     — golf, ánh đèn đô thị
 */

/** Không gian tranh, đơn vị world. Tỉ lệ đúng ảnh tổng thể (3:2). */
export const WORLD = { w: 1536, h: 1024 } as const;

/** Mức zoom tối đa, tính theo bội số của mức vừa khung. */
export const MAX_ZOOM = 4.2;

export type PhaseId = 'morning' | 'noon' | 'afternoon' | 'evening';

export type DetailImage = {
  src: string;
  /** Hộp trong không gian world — nơi ảnh gốc đè lên nền. */
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Bao nhiêu phần trăm mỗi mép được tan dần. Không có nó thì ảnh gốc là một
   * hình chữ nhật cắt cứng dán lên tranh — thấy ngay mép và thấy đường ghép
   * giữa hai ảnh trong cùng một ô.
   */
  feather?: number;
};

export type Phase = {
  id: PhaseId;
  /** Tâm bookmark, theo tỉ lệ 0–1 của world. */
  cx: number;
  cy: number;
  /** Bội số zoom khi bay tới. */
  zoom: number;
  details: DetailImage[];
};

const Q = { w: WORLD.w / 2, h: WORLD.h / 2 };

/**
 * Mỗi vùng có hai ảnh gốc, theo đúng brief: một ảnh CHÍNH phủ gần kín ô, và
 * một ảnh LỒNG nhỏ hơn nằm lệch trong ô — đọc ra "một chi tiết bên trong
 * không gian đó" chứ không phải hai tấm dán cạnh nhau.
 *
 * Cả hai đều tan mép, và ảnh lồng tan mạnh hơn vì nó nằm hẳn trong lòng ảnh
 * chính. Ảnh đặt tràn quá mép ô (`over`) để lúc hiện lên không hở ra nền.
 */
const over = 56;

const zone = (
  col: 0 | 1,
  row: 0 | 1,
  main: string,
  inset: string,
  insetAt: { x: number; y: number }
): DetailImage[] => {
  const ox = col * Q.w;
  const oy = row * Q.h;
  return [
    {
      src: main,
      x: ox - over,
      y: oy - over,
      w: Q.w + over * 2,
      h: Q.h + over * 2,
      feather: 9,
    },
    {
      src: inset,
      x: ox + Q.w * insetAt.x,
      y: oy + Q.h * insetAt.y,
      w: Q.w * 0.54,
      h: Q.h * 0.46,
      feather: 16,
    },
  ];
};

export const PHASES: Phase[] = [
  {
    id: 'morning',
    cx: 0.26,
    cy: 0.24,
    zoom: 2.7,
    details: zone(
      0,
      0,
      '/images/assets/day-experience/morning-01.webp',
      '/images/assets/day-experience/morning-02.webp',
      { x: 0.42, y: 0.5 }
    ),
  },
  {
    id: 'noon',
    cx: 0.75,
    cy: 0.24,
    zoom: 2.7,
    details: zone(
      1,
      0,
      '/images/assets/day-experience/noon-01.webp',
      '/images/assets/day-experience/noon-02.webp',
      { x: 0.04, y: 0.48 }
    ),
  },
  {
    id: 'afternoon',
    cx: 0.75,
    cy: 0.75,
    zoom: 2.7,
    details: zone(
      1,
      1,
      '/images/assets/day-experience/afternoon-01.webp',
      '/images/assets/day-experience/afternoon-02.webp',
      { x: 0.05, y: 0.06 }
    ),
  },
  {
    id: 'evening',
    cx: 0.25,
    cy: 0.75,
    zoom: 2.7,
    details: zone(
      0,
      1,
      '/images/assets/day-experience/evening-02.webp',
      '/images/assets/day-experience/evening-01.webp',
      { x: 0.42, y: 0.06 }
    ),
  },
];

export const OVERVIEW = '/journey/day-canvas/overview.webp';
export const OVERVIEW_PREVIEW = '/journey/day-canvas/overview-preview.jpg';

/**
 * Ảnh chi tiết bắt đầu hiện ở mức zoom này và rõ hẳn ở mức kia (bội số của
 * mức vừa khung). Dưới 1.5× thì người xem đang ngắm toàn cảnh, đưa ảnh gốc
 * vào chỉ tốn băng thông mà không thấy nét hơn.
 */
export const DETAIL_FADE = { from: 1.5, to: 2.3 } as const;

/** Nội dung từng vùng. Nhãn buổi lấy từ `t.gallery.phases`. */
export const PHASE_COPY: Record<PhaseId, Record<'vi' | 'en', { title: string; body: string }>> = {
  morning: {
    vi: { title: 'Sân vườn, và một ngày bắt đầu', body: 'Sân thượng mở ra lúc nắng còn thấp: bàn cà phê dưới tán mộc lan, sân tennis phía sau. Ngày bắt đầu trong dự án, không phải trên đường.' },
    en: { title: 'The garden, and a day beginning', body: 'The terrace opens while the light is still low: a coffee table under the magnolias, a court behind. The day starts inside the development, not on the road.' },
  },
  noon: {
    vi: { title: 'Thành phố ở ngoài kia, gia đình ở trong này', body: 'Giữa trưa, kính lấy trọn sông và đường chân trời; phòng trẻ mở ra ngay cạnh. Hai khoảng cách cùng tồn tại trong một tầm mắt.' },
    en: { title: 'The city out there, the family in here', body: 'At midday the glass takes the river and the skyline; the children’s room opens right beside it. Two distances in one line of sight.' },
  },
  afternoon: {
    vi: { title: 'Chiều chậm lại', body: 'Spa và những lối dạo dưới bóng cây. Đây là quãng trong ngày mà tiện ích được dùng thật, không phải chỉ để xem trong brochure.' },
    en: { title: 'The afternoon slows', body: 'The spa, and shaded walks. This is the stretch of the day when amenities are actually used, not just pictured.' },
  },
  evening: {
    vi: { title: 'Tối, và đèn thành phố bật lên', body: 'Phòng golf mô phỏng nhìn ra sông đã lên đèn. Ngày đóng lại ở tầng nhà mình, không phải ở một nơi nào khác.' },
    en: { title: 'Evening, and the city lights come up', body: 'The golf simulator looks out over a lit river. The day closes on your own floor, not somewhere else.' },
  },
};
