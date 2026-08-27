/**
 * Formatter dùng chung cho Portal V2 — trước đây là
 * `formatMiningMoney`/`formatMiningCount` trong `lib/portal-v2/mining/helpers`;
 * chuyển ra đây khi gỡ module Mining vì Analytics và Experiments vẫn dùng.
 */

export const formatMoney = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const formatCount = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
