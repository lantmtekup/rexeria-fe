/**
 * Default + normalizer cho block `lecool_header`.
 *
 * `href` để RỖNG hết: các anchor `#intro` / `#design` … của apps trỏ tới id
 * trong trang prototype, sang host không còn tồn tại. Author chọn block đích
 * bằng link picker ("Cuộn tới block").
 */
import type {
  LecoolHeaderAction,
  LecoolHeaderContent,
  LecoolHeaderNavItem,
} from '../types';

export const DEFAULT_HEADER_NAV: LecoolHeaderNavItem[] = [
  { label: 'Intro', href: '' },
  { label: 'Design', href: '' },
  { label: 'Details', href: '' },
  { label: 'Products', href: '' },
  { label: 'The Collection', href: '' },
  { label: 'Inspirations', href: '' },
];

export const DEFAULT_HEADER_ACTIONS: LecoolHeaderAction[] = [
  { iconUrl: '/lecool/header/icon-wishlist.svg', label: 'Wishlist' },
  { iconUrl: '/lecool/header/icon-account.svg', label: 'Account' },
  { iconUrl: '/lecool/header/icon-cart.svg', label: 'Cart' },
];

export function resolveHeaderNav(
  content: LecoolHeaderContent
): LecoolHeaderNavItem[] {
  const raw = content.navItems;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HEADER_NAV;
  return raw.map(item =>
    item && typeof item === 'object' ? item : ({} as LecoolHeaderNavItem)
  );
}

export function resolveHeaderActions(
  content: LecoolHeaderContent
): LecoolHeaderAction[] {
  const raw = content.actions;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HEADER_ACTIONS;
  return raw.map(item =>
    item && typeof item === 'object' ? item : ({} as LecoolHeaderAction)
  );
}
