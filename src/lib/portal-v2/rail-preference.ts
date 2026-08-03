const RAIL_COLLAPSED_KEY = 'rexer:portal-v2:rail-collapsed';

export const readRailCollapsed = (): boolean => {
  try {
    return localStorage.getItem(RAIL_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeRailCollapsed = (collapsed: boolean): void => {
  try {
    localStorage.setItem(RAIL_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    // private mode / blocked storage
  }
};
