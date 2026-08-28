/**
 * Formatter dùng chung cho Portal V2 — tách ra từ helpers của module Mining
 * cũ khi module đó được thay bằng Journey Audit; Analytics và Experiments
 * vẫn dùng chung hai hàm này.
 */

export const formatMoney = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const formatCount = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
