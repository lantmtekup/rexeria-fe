/**
 * Smart ads — 11 định dạng quảng cáo tương tác của ReXeR Studio.
 *
 * NGUỒN GỐC: `src/components/landing/ad-showcase/content.jsx` (`GROUPS`).
 * File đó là JSX: mỗi mục mang một `render()` kéo theo cả component quảng cáo
 * lẫn 7 file CSS. `fetchExchangeCatalog` chạy được ở CẢ server (route
 * `exchange/page.tsx`) lẫn client (ô tìm kiếm), nên import thẳng vào đó sẽ lôi
 * toàn bộ bundle showcase vào server bundle. Vì vậy phần mô tả được chép sang
 * đây dưới dạng dữ liệu thuần.
 *
 * ĐÁNH ĐỔI ĐÃ BIẾT: sửa tên/mô tả một format bên `content.jsx` thì phải sửa cả
 * ở đây. Danh sách này tĩnh và hiếm đổi; `id` mới là thứ phải khớp — nó là
 * đường dẫn `/rexer/ads/{id}`, sai id thì thẻ mở ra trang trống.
 *
 * Chúng KHÔNG phải bản ghi trong DB: không brand, không status, không đo được,
 * và chưa mang sang Experiences được (xem `ExchangeActionState`).
 */
export type AdFormat = {
  /** Khớp `ALL_ITEMS[].id` — cũng là route `/rexer/ads/{id}`. */
  id: string;
  name: string;
  desc: string;
  author: string;
  /** Nhóm trong showcase, dùng làm `category` của thẻ. */
  group: string;
  /** Một ảnh đại diện lấy từ chính props của format. */
  thumbnailUrl: string;
};

const CDN = 'https://d10zufojjcedud.cloudfront.net/ad-showcase';

export const AD_FORMATS: AdFormat[] = [
  {
    id: 'slider',
    name: 'Slider Compare',
    desc: 'Drag to compare day / night',
    author: 'Nguyên',
    group: 'Core Interactions',
    thumbnailUrl: `${CDN}/images/slider/night-view.webp`,
  },
  {
    id: 'interscroller-scroll',
    name: 'Aerial Pan',
    desc: 'Pan the aerial view with pinned details',
    author: 'Nguyên',
    group: 'Core Interactions',
    thumbnailUrl: `${CDN}/images/interscroller-scroll/background.webp`,
  },
  {
    id: 'pannable-hotspot',
    name: 'Pannable + Hotspot',
    desc: 'Drag + tap info points',
    author: 'Nguyên',
    group: 'Core Interactions',
    // `IMG.skyline` bên content.jsx là ảnh Unsplash, không nằm trên CDN.
    thumbnailUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=70&fm=webp&auto=format',
  },
  {
    id: 'gallery-displacement',
    name: 'Displacement Gallery',
    desc: 'Luxury dissolve transitions',
    author: 'Nguyên',
    group: 'Gallery & Visual',
    thumbnailUrl: `${CDN}/images/gallery-displacement/01.webp`,
  },
  {
    id: '3d-carousel',
    name: '3D Carousel',
    desc: 'Drag to spin the product set',
    author: 'Nguyên',
    group: 'Gallery & Visual',
    thumbnailUrl: `${CDN}/images/3d/balo.webp`,
  },
  {
    id: 'tap-play',
    name: 'Tap to Play',
    desc: 'Poster + tap to play video',
    author: 'Nguyên',
    group: 'Video & Story',
    thumbnailUrl: `${CDN}/images/video/background-video.webp`,
  },
  {
    id: 'stories',
    name: 'Stories',
    desc: 'Instagram-style stories',
    author: 'Thảo',
    group: 'Video & Story',
    thumbnailUrl: `${CDN}/images/stories/03.webp`,
  },
  {
    id: 'scratch-reveal',
    name: 'Scratch Reveal',
    desc: 'Scratch to reveal the reward',
    author: 'Nguyên',
    group: 'Touch & Reveal',
    thumbnailUrl: `${CDN}/images/scratch-reveal/background-gift-card.webp`,
  },
  {
    id: 'swipe-stack',
    name: 'Swipe Stack',
    desc: 'Swipe through product cards',
    author: 'Nguyên',
    group: 'Touch & Reveal',
    thumbnailUrl: `${CDN}/images/swipe-stack/01.webp`,
  },
  {
    id: 'countdown',
    name: 'Countdown',
    desc: 'Real-time hour:minute:second countdown',
    author: 'Thảo',
    group: 'Promo & Commerce',
    thumbnailUrl: `${CDN}/images/countdown/1.webp`,
  },
  {
    id: 'configurator',
    name: 'Configurator',
    desc: 'Change color and configure the product',
    author: 'Thảo',
    group: 'Promo & Commerce',
    thumbnailUrl: `${CDN}/configurator/03.webp`,
  },
];

/**
 * Route công khai render một format độc lập.
 *
 * `embed=1` bỏ thanh chrome của trang đó (nút back + device toggle riêng) để
 * không chồng lên chrome của preview shell. `device` truyền xuống vì trang ads
 * TỰ dựng khung máy (`DeviceFrame`) — khung này phải nghe host chứ không nghe
 * toggle đã bị ẩn.
 */
export const adFormatPreviewSrc = (
  id: string,
  device: 'mobile' | 'desktop'
): string => `/rexer/ads/${id}?embed=1&device=${device}`;
