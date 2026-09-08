'use client';

import * as React from 'react';

/**
 * Ô tick "đồng ý được liên hệ" cho form của block.
 *
 * KHÔNG hiện gì khi `text` rỗng — mặc định mọi block giữ nguyên thiết kế cũ.
 * Chủ nội dung điền `consentText` trong trình dựng thì ô mới xuất hiện.
 *
 * Vì sao cần: BE `leadUsecase.submitCore` từ chối 400 khi trang có điểm đo ở
 * bậc `identified` mà submit không mang `consent` — "form bắt buộc checkbox
 * consent" (sheet 2 §C). Không có ô này thì trang như vậy KHÔNG nhận được lead
 * nào, và cách duy nhất để biết là đọc lỗi trên form.
 *
 * Tick hộ khách (gửi thẳng `consent: true`) thì qua được cửa BE nhưng ghi vào
 * `leads.consent_at` một sự đồng ý chưa từng xảy ra — đúng thứ mà PDPD hỏi đến.
 */
export function LeadConsentField({
  text,
  checked,
  onChange,
  className,
  style,
}: {
  text?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const label = text?.trim();
  if (!label) return null;
  return (
    <label
      className={className ?? 'flex cursor-pointer items-start gap-2 text-xs'}
      style={style}
    >
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        required
        className='mt-0.5 size-3.5 shrink-0 cursor-pointer'
      />
      <span>{label}</span>
    </label>
  );
}
