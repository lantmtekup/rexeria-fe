// Floor catalog — each floor reuses the shared camera_paths.glb (one empty +
// AnimationClip per floor) and its own POV scene model. Assets on the CDN.
const CDN = 'https://d10zufojjcedud.cloudfront.net/icggallery/webgl';
// Media (images) live at icggallery/media (NOT under /webgl).
const MEDIA = 'https://d10zufojjcedud.cloudfront.net/icggallery/media';

export const DRACO = `${CDN}/draco/gltf/`;
// v10 (CDN) + ht_empty bake lại từ camera thật "Corona_Camera001" trong
// Living Room_Bake.fbx (Downloads/260712), thay cho path Home Theatre cũ —
// gf/ff/uf/pu giữ nguyên từ v10, chỉ ht đổi. Xem
// scripts/make-ht-path-living-room.mjs. TẠM host local do chưa có quyền
// upload lên CloudFront; đổi lại CDN URL khi có bản build lên đó.
export const CAMERA_PATHS = '/webgl/models/camera_paths_living_room.glb';
// Isometric "dollhouse" model for the landing (one group per floor: gf_iso, ff_iso, uf_iso).
export const SLIDER = '/webgl/models/slider.glb';

// 👇 GLB model(s) of the furniture to show in the click-to-view 3D popup.
// Paste the chair/sofa GLB URL here (e.g. `${CDN}/models/chair.glb`).
// Each `clickables` entry below references one of these.
export const FURNITURE_MODELS = {
  sofa: `${CDN}/models/modern-chair-11.glb`, // first floor `sopha`
  armchair: `${CDN}/models/modern-chair-11.glb`, // ground floor French chair (tạm dùng chung)
};

// Hotspots are anchored to a point the camera looks at during the tour:
//   at   — scroll progress 0..1 where the camera frames the object
//   dist — metres in front of the camera at that moment
//   side — metres right(+)/left(-),  up — metres up(+)/down(-)
// The point is computed from the camera path, so it naturally appears when you
// scroll to it and hides once you pass by.
export const FLOORS = {
  'ground-floor': {
    label: 'Ground Floor',
    model: `${CDN}/models/gf_pov.glb`,
    iso: 'gf_iso',
    empty: 'gf_empty',
    clip: 'gf_empty_action',
    // Clickable zones — drawn in Author Mode (?author). Each zone is a polygon of
    // world-space points; hover highlights it, click opens an image or 3D model.
    // { id, title, eyebrow?, type:'model'|'image', src, points:[[x,y,z],...] }
    zones: [],
    hotspots: [
      {
        id: 'gf-1',
        position: [-19.06, 1.26, 3.61],
        image: '/hotspots/chair.jpg',
        eyebrow: 'Nội thất · Phong cách Pháp',
        title: 'Bộ bàn ghế Pháp',
        body: [
          'Ghế bành phong cách Pháp cổ điển với khung gỗ chạm khắc thủ công, thếp vàng tinh xảo và lớp vải hoa văn damask sang trọng.',
          'Mỗi đường nét uốn lượn tôn lên vẻ quý phái, mang hơi thở của những phòng khách quý tộc châu Âu thế kỷ 18.',
        ],
        captions: ['Gỗ tự nhiên chạm khắc thủ công', 'Họa tiết damask cổ điển'],
      },
      {
        id: 'gf-2',
        position: [-5.86, 0.93, 11.21],
        image: '/hotspots/table.jpg',
        eyebrow: 'Nội thất · Bàn trà',
        title: 'Bàn trà cổ điển',
        body: [
          'Bàn ngồi cổ điển với chân trụ trung tâm chạm khắc cầu kỳ, mặt bàn gỗ uốn lượn mềm mại và hoàn thiện bóng sâu.',
          'Điểm nhấn ấm cúng cho không gian tiếp khách, kết hợp hoàn hảo cùng bộ ghế bành Pháp.',
        ],
        captions: ['Chân trụ chạm khắc thủ công', 'Mặt gỗ hoàn thiện bóng'],
      },
      {
        id: 'gf-3',
        position: [19.13, 1.08, -4.88],
        image: '/hotspots/painting.jpg',
        eyebrow: 'Tác phẩm · Di sản',
        title: 'Tranh Mona Lisa',
        body: [
          'Kiệt tác của Leonardo da Vinci — bức chân dung nổi tiếng nhất thế giới — được đặt trong khung mạ vàng cổ điển.',
          'Nụ cười bí ẩn cùng kỹ thuật sfumato huyền thoại tiếp tục mê hoặc người xem suốt hơn năm thế kỷ.',
        ],
        captions: ['Leonardo da Vinci, ~1503', 'Sơn dầu trên gỗ dương'],
      },
      {
        id: 'gf-4',
        position: [-5.17, 2.08, -13.83],
        eyebrow: 'Điểm tham quan',
        title: 'Hotspot 4',
        body: [
          'Cho tôi biết đây là vật/khu vực gì để điền nội dung và thêm ảnh.',
        ],
      },
    ],
  },
  'first-floor': {
    label: 'First Floor',
    model: `${CDN}/models/ff_pov.glb`,
    iso: 'ff_iso',
    empty: 'ff_empty',
    clip: 'ff_empty_action',
    // Clickable zones — drawn in Author Mode (?author). Example assets on CDN:
    // model FURNITURE_MODELS.sofa, image `${CDN}/media/demo-art.jpg`.
    zones: [
      {
        id: 'zone-1',
        title: 'Item',
        eyebrow: '',
        type: 'model', // click → popup viewer 3D (xoay/zoom), xem chi tiết
        src: FURNITURE_MODELS.sofa, // 👈 thay bằng URL model thật
        points: [
          [-13.429, 0.468, 2.837],
          [-14.198, 0.55, 3.069],
          [-13.429, 0.356, 2.339],
          [-14.624, 0.55, 3.25],
          [-14.763, 0.55, 3.544],
          [-14.768, 0.55, 3.762],
          [-14.724, 0.55, 3.931],
          [-14.657, 0.55, 4.015],
          [-14.604, 0.55, 4.092],
          [-14.446, 0.527, 4.197],
          [-14.281, 0.534, 4.237],
          [-14.022, 0.55, 4.178],
          [-13.803, 0.55, 4.0],
          [-13.429, 0.525, 3.645],
          [-13.429, 0.532, 3.469],
          [-13.429, 0.521, 3.204],
          [-13.429, 0.531, 2.964],
          [-13.429, 0.471, 2.828],
        ],
      },
      {
        id: 'zone-2',
        title: 'Tranh',
        eyebrow: 'Tác phẩm',
        type: 'video-inline', // video loop phát thẳng trong scene 3D
        src: `${MEDIA}/sample-10s.mp4`, // ảnh tĩnh: type:'image-inline' + `${MEDIA}/painting-2.jpg`
        points: [
          [9.244, 3.033, -2.172],
          [9.244, 3.017, -3.313],
          [9.243, 1.398, -3.309],
          [9.244, 1.376, -2.165],
          [9.244, 3.024, -2.167],
        ],
      },
      {
        id: 'zone-3',
        title: 'Hotspot 1',
        eyebrow: 'Điểm tham quan',
        type: 'hotspot', // chấm marker → click hiện info popup
        body: ['Cho mình nội dung + ảnh cho hotspot này.'],
        points: [
          [-3.546, 2.625, -1.499],
          [-3.546, 2.674, -1.344],
          [-3.917, 2.444, -1.476],
        ],
      },
      {
        id: 'zone-4',
        title: 'Hotspot 2',
        eyebrow: 'Điểm tham quan',
        type: 'hotspot',
        body: ['Cho mình nội dung + ảnh cho hotspot này.'],
        points: [
          [-7.238, 0.89, 5.165],
          [-7.187, 0.847, 5.209],
          [-7.262, 0.784, 5.253],
        ],
      },
    ],
    hotspots: [
      {
        id: 'display',
        at: 0.3,
        dist: 2.4,
        side: 0,
        up: -0.1,
        title: 'Surface Display',
        body: 'Curated sample wall presenting the season’s textures and finishes — touch-friendly tiles in matte and polished.',
      },
      {
        id: 'lighting',
        at: 0.7,
        dist: 3.2,
        side: -0.4,
        up: 0.4,
        title: 'Ambient Lighting',
        body: 'Recessed warm lighting grazes the surfaces to reveal depth and reflectivity across the porcelain range.',
      },
    ],
  },
  'home-theatre': {
    label: 'Home Theatre',
    // TẠM: thay bằng model "Living Room" (nguồn: Downloads/260712/Lingving
    // Room.glb, nén Draco + WebP 226MB → 4.7MB, dịch chuyển gốc toạ độ để
    // trùng vùng camera path cũ x~57-60/z~-53..-57/y~7.2). Model gốc không
    // phải phòng home-theatre thật nên bố cục/hotspot không khớp 100% —
    // chỉ dùng tạm cho tới khi có file ht_pov.glb export lại đúng texture.
    model: '/webgl/models/ht_living_room.glb',
    // slider.glb chưa có group ht_iso → iso: null khiến landing/dollhouse
    // fallback sang clay-clone của chính model POV (xem Experience.jsx).
    iso: null,
    empty: 'ht_empty',
    clip: 'ht_empty_action',
    // Toạ độ lấy bằng Author Mode (?author) — click trực tiếp lên model thật
    // qua Playwright, không phải ước lượng tay.
    zones: [
      {
        id: 'ht-coffee-table',
        title: 'Bàn trà gỗ tròn',
        eyebrow: 'Nội thất · Bàn trà',
        type: 'hotspot',
        body: [
          'Mặt bàn gỗ óc chó nguyên khối kết hợp đá cẩm thạch trắng, tạo điểm nhấn ấm áp giữa không gian phòng khách.',
          'Đường cong mềm mại của mặt bàn hài hoà với hình khối tròn của bộ ghế bành xung quanh.',
        ],
        captions: ['Gỗ óc chó nguyên khối', 'Mặt phụ đá cẩm thạch'],
        points: [
          [57.469, 5.5, -49.985],
          [58.197, 5.5, -50.474],
          [58.806, 5.5, -50.846],
        ],
      },
      {
        id: 'ht-accent-chair',
        title: 'Ghế bành bọc da',
        eyebrow: 'Nội thất · Ghế bành',
        type: 'hotspot',
        body: [
          'Cặp ghế bành dáng tròn bọc da cao cấp, phần lưng ôm sát tạo cảm giác êm ái khi ngồi thư giãn.',
          'Tông màu kem trung tính dễ phối cùng sofa và thảm dệt, giữ tổng thể không gian nhẹ nhàng, tinh tế.',
        ],
        captions: ['Khung gỗ bọc đệm da', 'Thiết kế bo tròn hiện đại'],
        points: [
          [63.67, 6.026, -54.196],
          [63.733, 6.018, -54.268],
          [63.757, 6.005, -54.286],
        ],
      },
      {
        id: 'ht-staircase',
        title: 'Cầu thang nổi kính cường lực',
        eyebrow: 'Kiến trúc · Cầu thang',
        type: 'hotspot',
        body: [
          'Bậc thang gỗ tối giản "nổi" trên vách kính cường lực trong suốt, tạo cảm giác nhẹ bẫng cho không gian.',
          'Hệ đèn thả dạng bong bóng ánh sáng ấm dọc theo tường, dẫn lối lên tầng trong khi vẫn giữ trọn tầm nhìn xuyên suốt.',
        ],
        captions: [
          'Bậc gỗ + lan can kính cường lực',
          'Đèn thả dạng chuỗi bong bóng',
        ],
        points: [
          [63.607, 6.538, -57.43],
          [63.629, 6.538, -57.43],
          [63.612, 6.518, -57.43],
        ],
      },
      {
        id: 'ht-floor-lamp',
        title: 'Đèn sàn dáng nấm',
        eyebrow: 'Nội thất · Đèn trang trí',
        type: 'hotspot',
        body: [
          'Đèn sàn chao nấm màu cam trầm, điểm nhấn màu sắc hiếm hoi giữa tông gỗ - kem chủ đạo của căn phòng.',
          'Ánh sáng vàng ấm toả đều, phù hợp cho những buổi tối thư giãn cạnh cửa kính nhìn ra ngoài.',
        ],
        captions: ['Chao đèn nấm màu cam đất', 'Ánh sáng vàng ấm dịu'],
        points: [
          [64.887, 6.182, -53.286],
          [64.893, 6.183, -53.281],
          [64.887, 6.173, -53.286],
        ],
      },
      {
        id: 'ht-sofa',
        title: 'Sofa da góc chữ L',
        eyebrow: 'Nội thất · Sofa',
        type: 'hotspot',
        body: [
          'Sofa góc bọc da/vải bố cỡ lớn, đủ chỗ cho cả gia đình quây quần xem phim hoặc trò chuyện.',
          'Gối tựa phối màu tương phản nhẹ tạo điểm nhấn, trong khi form dáng vuông vức giữ nét hiện đại, tối giản.',
        ],
        captions: ['Sofa góc chữ L', 'Gối tựa phối màu tương phản'],
        points: [
          [61.819, 6.133, -51.948],
          [61.823, 6.132, -51.951],
          [61.822, 6.128, -51.944],
        ],
      },
    ],
    hotspots: [],
  },
};

export const FLOOR_KEYS = Object.keys(FLOORS);
export const DEFAULT_FLOOR = 'ground-floor';

// Resolve the floor slug from a /…/floors/<slug> path.
export function floorFromPath(pathname) {
  const m = (pathname || '').match(/floors\/([a-z-]+)/);
  return m && FLOORS[m[1]] ? m[1] : DEFAULT_FLOOR;
}
