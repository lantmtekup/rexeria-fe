/**
 * Pool ảnh mẫu Unsplash (đã verify 200) cho default content của block animation.
 * Mục tiêu: tránh lặp 1 nhúm ảnh khắp nơi — mỗi block lấy 1 lát khác nhau qua
 * `pickMedia(n, offset)`. Tất cả URL `images.unsplash.com` ổn định + tối ưu.
 */

const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Nhóm theo chủ đề — dùng khi cần ảnh đúng ngữ cảnh (vd interior cho nội thất). */
export const MEDIA = {
  architecture: [
    U('1600596542815-ffad4c1539a9'),
    U('1512917774080-9991f1c4c750'),
    U('1570129477492-45c003edd2be'),
    U('1583608205776-bfd35f0d9f83'),
    U('1564013799919-ab600027ffc6'),
    U('1600566753086-00f18fb6b3ea'),
  ],
  interior: [
    U('1600585154340-be6161a56a0c'),
    U('1600607687939-ce8a6c25118c'),
    U('1505693416388-ac5ce068fe85'),
    U('1586023492125-27b2c045efd7'),
    U('1567767292278-a4f21aa2d36e'),
  ],
  people: [U('1556909114-f6e7ad7d3136'), U('1521737604893-d14cc237f11d')],
  product: [
    U('1523275335684-37898b6baf30'),
    U('1542291026-7eec264c27ff'),
    U('1505740420928-5e560c06d30e'),
  ],
  nature: [
    U('1502672260266-1c1ef2d93688'),
    U('1469474968028-56623f02e42e'),
    U('1470770841072-f978cf4d019e'),
    U('1493809842364-78817add7ffb'),
  ],
  work: [
    U('1531973576160-7125cd663d86'),
    U('1497366216548-37526070297c'),
    U('1497366811353-6870744d04b2'),
  ],
  abstract: [
    U('1486406146926-c627a92ad1ab'),
    U('1518770660439-4636190af475'),
    U('1554995207-c18c203602cb'),
  ],
};

/** Toàn bộ ảnh xen kẽ chủ đề (kiến trúc/nội thất/sản phẩm…) để dải đa dạng. */
export const ALL_MEDIA: string[] = [
  MEDIA.architecture[0],
  MEDIA.interior[0],
  MEDIA.nature[0],
  MEDIA.architecture[1],
  MEDIA.interior[1],
  MEDIA.product[0],
  MEDIA.architecture[2],
  MEDIA.interior[2],
  MEDIA.nature[1],
  MEDIA.architecture[3],
  MEDIA.work[0],
  MEDIA.interior[3],
  MEDIA.product[1],
  MEDIA.architecture[4],
  MEDIA.nature[2],
  MEDIA.interior[4],
  MEDIA.people[0],
  MEDIA.abstract[0],
  MEDIA.architecture[5],
  MEDIA.nature[3],
  MEDIA.product[2],
  MEDIA.work[1],
  MEDIA.people[1],
  MEDIA.abstract[1],
  MEDIA.work[2],
  MEDIA.abstract[2],
];

/** Lấy `n` ảnh đa dạng bắt đầu từ `offset` (xoay vòng pool). */
export function pickMedia(n: number, offset = 0): string[] {
  return Array.from(
    { length: n },
    (_, i) => ALL_MEDIA[(offset + i) % ALL_MEDIA.length]
  );
}
