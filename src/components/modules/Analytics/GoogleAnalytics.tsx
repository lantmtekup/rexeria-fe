'use client';

import * as React from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

import {
  GA_MEASUREMENT_ID,
  isGaEnabled,
  gaPageview,
  syncStoredConsent,
} from '@/lib/analytics/ga';

/**
 * Theo dõi chuyển route phía client. Tách riêng để bọc <Suspense> —
 * `useSearchParams` ép toàn bộ cây cha sang client-side rendering nếu không có
 * ranh giới suspense, và điều đó sẽ kéo cả trang landing công khai theo.
 */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Phát lại consent đã lưu TRƯỚC lượt xem đầu tiên — khai báo trước nên effect
  // này chạy trước effect page_view bên dưới.
  React.useEffect(() => {
    if (!isGaEnabled()) return;
    syncStoredConsent();
  }, []);

  React.useEffect(() => {
    if (!isGaEnabled()) return;
    const qs = searchParams.toString();
    gaPageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Nạp gtag.js cho GA4.
 *
 * Phần khai báo `consent default` KHÔNG nằm ở đây mà là thẻ script thô trong
 * `<head>` của root layout: nó bắt buộc phải chạy TRƯỚC khi gtag.js kịp xử lý
 * hàng đợi, còn next/script dù ở chiến lược nào cũng chèn muộn hơn. Ở đây chỉ
 * còn việc tải script ngoài và `config`.
 *
 * `send_page_view: false` vì lượt xem đầu tiên và mọi lần chuyển route đều do
 * `PageviewTracker` bắn — để gtag tự bắn sẽ nhân đôi lượt xem trang đầu.
 */
export function GoogleAnalytics() {
  if (!isGaEnabled()) return null;

  return (
    <>
      <Script
        id='ga-lib'
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id='ga-config' strategy='afterInteractive'>
        {`gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
      </Script>
      <React.Suspense fallback={null}>
        <PageviewTracker />
      </React.Suspense>
    </>
  );
}
