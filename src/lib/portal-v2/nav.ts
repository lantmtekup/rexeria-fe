import {
  BarChart3,
  Bot,
  DatabaseZap,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  Map,
  Package,
  Palette,
  Rocket,
  ScanSearch,
  Settings,
  Sparkles,
  Store,
  Target,
  TrendingDown,
  Wand2,
  type LucideIcon,
} from 'lucide-react';

export type PortalV2NavItem = {
  id: string;
  href: string;
  /** Resolves via t(`nav.${labelKey}`) */
  labelKey: string;
  icon: LucideIcon;
};

export type PortalV2NavGroup = {
  /** Resolves via t(`groups.${groupKey}`) / t(`groups.${groupKey}Short`) */
  groupKey?: string;
  bottom?: boolean;
  items: PortalV2NavItem[];
};

export const PORTAL_V2_BASE = '/portal-v2';

export const PORTAL_V2_NAV: PortalV2NavGroup[] = [
  {
    items: [
      {
        id: 'command',
        href: PORTAL_V2_BASE,
        labelKey: 'command',
        icon: LayoutDashboard,
      },
      {
        id: 'exchange',
        href: `${PORTAL_V2_BASE}/exchange`,
        labelKey: 'exchange',
        icon: Store,
      },
    ],
  },
  {
    groupKey: 'journeyAudit',
    items: [
      {
        id: 'journeyAudit',
        href: `${PORTAL_V2_BASE}/journey-audit`,
        labelKey: 'journeyAudit',
        icon: ScanSearch,
      },
      {
        id: 'sources',
        href: `${PORTAL_V2_BASE}/sources`,
        labelKey: 'sources',
        icon: DatabaseZap,
      },
      {
        id: 'dropoff',
        href: `${PORTAL_V2_BASE}/dropoff`,
        labelKey: 'dropoff',
        icon: TrendingDown,
      },
      {
        id: 'experiments',
        href: `${PORTAL_V2_BASE}/experiments`,
        labelKey: 'experiments',
        icon: FlaskConical,
      },
    ],
  },
  {
    groupKey: 'plan',
    items: [
      {
        id: 'brand',
        href: `${PORTAL_V2_BASE}/brand`,
        labelKey: 'brand',
        icon: Palette,
      },
      {
        id: 'campaigns',
        href: `${PORTAL_V2_BASE}/campaigns`,
        labelKey: 'campaigns',
        icon: Target,
      },
      {
        id: 'journeys',
        href: `${PORTAL_V2_BASE}/journeys`,
        labelKey: 'journeys',
        icon: Map,
      },
    ],
  },
  {
    groupKey: 'create',
    items: [
      {
        id: 'experiences',
        href: `${PORTAL_V2_BASE}/experiences`,
        labelKey: 'experiences',
        icon: Sparkles,
      },
      {
        id: 'automation',
        href: `${PORTAL_V2_BASE}/automation`,
        labelKey: 'automation',
        icon: Wand2,
      },
      {
        id: 'media',
        href: `${PORTAL_V2_BASE}/media`,
        labelKey: 'media',
        icon: FolderOpen,
      },
      {
        id: 'products',
        href: `${PORTAL_V2_BASE}/products`,
        labelKey: 'products',
        icon: Package,
      },
    ],
  },
  {
    groupKey: 'publish',
    items: [
      {
        id: 'deploy',
        href: `${PORTAL_V2_BASE}/deploy`,
        labelKey: 'deploy',
        icon: Rocket,
      },
    ],
  },
  {
    groupKey: 'learn',
    items: [
      {
        id: 'analytics',
        href: `${PORTAL_V2_BASE}/analytics`,
        labelKey: 'analytics',
        icon: BarChart3,
      },
      {
        id: 'ai',
        href: `${PORTAL_V2_BASE}/ai`,
        labelKey: 'ai',
        icon: Bot,
      },
    ],
  },
  {
    bottom: true,
    items: [
      {
        id: 'settings',
        href: `${PORTAL_V2_BASE}/settings`,
        labelKey: 'settings',
        icon: Settings,
      },
    ],
  },
];

export const isPortalV2NavActive = (
  pathname: string,
  href: string
): boolean => {
  if (href === PORTAL_V2_BASE) return pathname === PORTAL_V2_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
};
