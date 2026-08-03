import type { BelgoFlavorItem, BelgoMoreFlavorsContent } from '../types';

export const BELGO_DEFAULT_FLAVORS: BelgoFlavorItem[] = [
  {
    key: 'blonde',
    name: 'BLONDE',
    color: '#F5B301',
    bgImageUrl: '/belgo/section-5/blonde/bg.png',
    bottleImageUrl: '/belgo/section-5/blonde/bottle.png',
    glassImageUrl: '/belgo/section-5/blonde/glass.png',
  },
  {
    key: 'amber',
    name: 'AMBER',
    color: '#C4622D',
    bgImageUrl: '/belgo/section-5/amber/bg.png',
    bottleImageUrl: '/belgo/section-5/amber/bottle.png',
    glassImageUrl: '/belgo/section-5/amber/glass.png',
  },
  {
    key: 'cherry',
    name: 'CHERRY',
    color: '#C0392B',
    bgImageUrl: '/belgo/section-5/cherry/bg.png',
    bottleImageUrl: '/belgo/section-5/cherry/bottle.png',
    glassImageUrl: '/belgo/section-5/cherry/glass.png',
  },
  {
    key: 'full-moon',
    name: 'FULL MOON',
    color: '#8C6A3F',
    bgImageUrl: '/belgo/section-5/full-moon/bg.png',
    bottleImageUrl: '/belgo/section-5/full-moon/bottle.png',
    glassImageUrl: '/belgo/section-5/full-moon/glass.png',
  },
  {
    key: 'artisan-pilsner',
    name: 'ARTISAN PILSNER',
    color: '#D4A017',
    bgImageUrl: '/belgo/section-5/artisan-pilsner/bg.png',
    bottleImageUrl: '/belgo/section-5/artisan-pilsner/bottle.png',
    glassImageUrl: '/belgo/section-5/artisan-pilsner/glass.png',
  },
];

const assetForKey = (key: string, file: string) =>
  `/belgo/section-5/${key}/${file}`;

export const resolveBelgoFlavorItem = (
  item: BelgoFlavorItem | undefined,
  index: number
): BelgoFlavorItem => {
  const key =
    item?.key?.trim() ||
    BELGO_DEFAULT_FLAVORS[index]?.key ||
    `flavor-${index + 1}`;
  const fallback = BELGO_DEFAULT_FLAVORS.find(f => f.key === key) ??
    BELGO_DEFAULT_FLAVORS[index] ?? {
      key,
      name: 'FLAVOR',
      color: '#F5B301',
    };
  return {
    key,
    name: item?.name?.trim() || fallback.name,
    color: item?.color?.trim() || fallback.color,
    bgImageUrl:
      item?.bgImageUrl?.trim() ||
      fallback.bgImageUrl ||
      assetForKey(key, 'bg.png'),
    bottleImageUrl:
      item?.bottleImageUrl?.trim() ||
      fallback.bottleImageUrl ||
      assetForKey(key, 'bottle.png'),
    glassImageUrl:
      item?.glassImageUrl?.trim() ||
      fallback.glassImageUrl ||
      assetForKey(key, 'glass.png'),
  };
};

export const resolveBelgoMoreFlavors = (
  content: BelgoMoreFlavorsContent | undefined
): BelgoFlavorItem[] => {
  const raw = content?.flavors;
  if (!Array.isArray(raw) || raw.length === 0) {
    return BELGO_DEFAULT_FLAVORS.map(item => ({ ...item }));
  }
  return raw.map((item, i) => resolveBelgoFlavorItem(item, i));
};
