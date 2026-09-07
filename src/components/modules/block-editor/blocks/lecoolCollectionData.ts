/**
 * Default + normalizer cho block `lecool_collection`.
 *
 * apps trỏ màu bằng chỉ số vào `PRODUCT_COLORS` + `COLOR_IMAGES`; ở đây mỗi thẻ
 * giữ trọn danh sách màu của nó (đã trải phẳng theo đúng thứ tự apps) để CMS
 * sửa một thẻ không kéo theo thẻ khác.
 */
import type { LecoolCollectionContent, LecoolCollectionItem } from '../types';

const GRIGIO = '/lecool/collection/grigio.png';
const VEGETAL = '/lecool/collection/vegetal.png';
const VIOLET = '/lecool/collection/violet.png';
const BLACK = '/lecool/collection/black.png';

const RAIN = { name: 'Rain', from: '#999A97', to: '#343433', imageUrl: GRIGIO };
const SAND = {
  name: 'Sand',
  from: '#7D745D',
  to: '#E3D3A9',
  imageUrl: VEGETAL,
};
const LILAC = {
  name: 'Lilac',
  from: '#BAB7C8',
  to: '#5B5A62',
  imageUrl: VIOLET,
};
const NOIR = { name: 'Noir', from: '#000000', to: '#666666', imageUrl: BLACK };
const CACAO = {
  name: 'Cacao',
  from: '#8C6C54',
  to: '#261D17',
  imageUrl: VEGETAL,
};

const item = (colors: Array<typeof RAIN>): LecoolCollectionItem => ({
  material: 'Sellier Calf',
  name: 'Cool Move',
  price: '3.900 €',
  colors: colors.map(color => ({ ...color })),
});

export const DEFAULT_COLLECTION_ITEMS: LecoolCollectionItem[] = [
  item([LILAC, RAIN, NOIR, CACAO]),
  item([RAIN, SAND, NOIR, CACAO]),
  item([CACAO, NOIR, RAIN, LILAC]),
  item([NOIR, SAND, LILAC, CACAO]),
];

export function resolveCollectionItems(
  content: LecoolCollectionContent
): LecoolCollectionItem[] {
  const raw = content.items;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_COLLECTION_ITEMS;
  return raw.map(entry =>
    entry && typeof entry === 'object' ? entry : ({} as LecoolCollectionItem)
  );
}
