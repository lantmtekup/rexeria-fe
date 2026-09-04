import type {
  AccountType,
  PrivacyTier,
  ProductDefaultStatus,
  SettingsData,
  SettingsMember,
} from '@/lib/portal-v2/settings/types';
import type {
  RxBrandMember,
  RxCapabilities,
  RxGovernance,
  RxMeProfile,
  RxPutGovernanceRequest,
} from '@/services/rexer-v2/types/settings';

/**
 * Ba nguồn → shape màn Settings đang vẽ.
 *
 * `measurement`, `privacy` và `defaults` trùng khít với `/org/governance`, nên
 * đây chỉ là đổi tên. Tab General thì ghép từ ba chỗ và CÓ trường không nguồn
 * nào trả — xem `MISSING_*` bên dưới.
 */

const PRIVACY: PrivacyTier[] = ['anonymous', 'pseudonymous', 'identified'];
const ACCOUNT: AccountType[] = ['brand', 'company', 'agency', 'freelance'];

const pick = <T extends string>(v: string | undefined, all: T[], fb: T): T =>
  v && (all as string[]).includes(v) ? (v as T) : fb;

/**
 * Không nguồn nào trả `since` (ngày mở tài khoản) — không có trong governance,
 * capabilities hay profile. Để trống thay vì bịa một ngày.
 */
const MISSING_SINCE = '';

/** Tên → chữ cái đầu. API không trả `initials`, và suy ra thì luôn đúng. */
const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

/**
 * `last_seen_at = null` nghĩa là người này CHƯA từng đăng nhập kể từ lúc được
 * mời — đó chính là "pending", không cần một cột riêng.
 */
export const v2ToMember = (m: RxBrandMember): SettingsMember => ({
  id: m.user_id,
  name: m.display_name || m.email,
  initials: initialsOf(m.display_name || m.email),
  email: m.email,
  role: m.role,
  lastActive: m.last_seen_at ?? '',
  ...(m.last_seen_at ? {} : { pending: true }),
});

export const v2ToSettings = (
  gov: RxGovernance,
  caps: RxCapabilities,
  me: RxMeProfile,
  opts: { seats?: number; members?: SettingsMember[] } = {}
): SettingsData => ({
  general: {
    orgName: gov.org_name ?? '',
    // Gói hiển thị = loại tài khoản. BE không có khái niệm "plan" tách riêng;
    // `capabilities` mới là thứ quyết định mở được gì.
    orgPlan: caps.account_type,
    planTier: caps.account_type,
    accountName: me.name,
    accountEmail: me.email,
    accountTitle: me.title,
    accountType: pick(caps.account_type, ACCOUNT, 'brand'),
    // Đếm từ danh sách thành viên; 0 khi chưa nạp, KHÔNG phải "không có ai".
    seats: opts.seats ?? 0,
    since: MISSING_SINCE,
  },
  measurement: {
    highFloor: gov.high_floor,
    dirFloor: gov.directional_floor,
    blkGapPts: gov.block_gap_pts,
    scoreW: {
      order: gov.score_weights.order,
      blocks: gov.score_weights.blocks,
      signals: gov.score_weights.signals,
    },
    fitW: {
      obj: gov.fit_weights.objective,
      aud: gov.fit_weights.audience,
      ev: gov.fit_weights.evidence,
    },
  },
  privacy: {
    defPrivacy: pick(gov.default_privacy, PRIVACY, 'pseudonymous'),
    maxPrivacy: pick(gov.max_privacy, PRIVACY, 'identified'),
  },
  defaults: {
    productStatus: (gov.default_product_status === 'active'
      ? 'active'
      : 'draft') as ProductDefaultStatus,
  },
  members: opts.members ?? [],
});

/**
 * Chiều ngược. `PUT` gửi TOÀN BỘ tài liệu và mọi trường là `required`, nên
 * không thể gửi từng mục — thiếu một cái là 400.
 */
export const settingsToGovernance = (
  data: SettingsData,
  version: number
): RxPutGovernanceRequest => ({
  version,
  high_floor: data.measurement.highFloor,
  directional_floor: data.measurement.dirFloor,
  block_gap_pts: data.measurement.blkGapPts,
  score_weights: {
    order: data.measurement.scoreW.order,
    blocks: data.measurement.scoreW.blocks,
    signals: data.measurement.scoreW.signals,
  },
  fit_weights: {
    objective: data.measurement.fitW.obj,
    audience: data.measurement.fitW.aud,
    evidence: data.measurement.fitW.ev,
  },
  default_privacy: data.privacy.defPrivacy,
  max_privacy: data.privacy.maxPrivacy,
  default_product_status: data.defaults.productStatus,
  org_name: data.general.orgName,
});
