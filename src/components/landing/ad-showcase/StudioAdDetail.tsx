'use client';

/**
 * StudioAdDetail — trang chi tiết 1 block: render LIVE, tương tác đầy đủ
 * (không có lớp tap-catcher như gallery).
 *
 * Có 2 chế độ hiển thị: mobile (iPhone frame, mặc định) và desktop
 * (browser frame). Người dùng chuyển qua lại bằng DeviceToggle ở góc
 * phải trên; lựa chọn được persist bằng localStorage (xem useDeviceView).
 */
import * as React from 'react';
import Link from 'next/link';

import './ads.css';
import './ads-extra.css';
import './interscroller-preview.css';
import './preview.css';
import './device-toggle.css';
import './showcase.css';
import { ALL_ITEMS } from './content';
import InterscrollerPreview from './ads/InterscrollerPreview';
import { useDeviceView } from './ads/shared/useDeviceView';
import DeviceToggle from './ads/shared/DeviceToggle';
import DeviceFrame from './ads/shared/DeviceFrame';

type AdItem = {
  id: string;
  name: string;
  desc: string;
  by: 'Nguyên' | 'Thảo';
  render: () => React.ReactNode;
};

export function StudioAdDetail({ id }: { id: string }) {
  const item = (ALL_ITEMS as AdItem[]).find(i => i.id === id);
  const { device, setDevice } = useDeviceView();

  // Khung phone notch/home-bar chỉ ngữ cảnh mobile; desktop dùng window chrome.
  // Render cùng children cho cả 2 nhánh (ad render()), chỉ đổi khung bao.
  const adNode = item ? (
    <InterscrollerPreview>{item.render()}</InterscrollerPreview>
  ) : null;
  const urlBar = item ? `rexer.studio/ads/${item.id}` : 'about:blank';

  return (
    // Overlay full-screen phủ header/footer landing (route nằm trong layout
    // landing → không bỏ parent layout được). Bên trong dùng DeviceFrame:
    // mobile → .pv-page + iPhone chrome (preview.css); desktop → browser chrome
    // (device-toggle.css).
    <div className={`ad-showcase-root fixed inset-0 z-[999] dv-mode-${device}`}>
      <Link href='/rexer/ads' className='pv-back'>
        ← Studio
      </Link>

      {/* Controlled: cùng state với DeviceFrame bên dưới. */}
      <DeviceToggle value={device} onChange={setDevice} />

      <DeviceFrame
        device={device}
        desktopMaxWidth='1200px'
        desktopUrl={urlBar}
        urlBarText={urlBar}
      >
        {item ? (
          device === 'mobile' ? (
            // <div className='pv-phone-area'>
            //   <div className='pv-phone'>
            //     <div className='pv-notch' />
            //     <div className='pv-screen'>
            <>
              {adNode}
              <div className='pv-home-bar' />
            </>
          ) : (
            //     </div>
            //   </div>
            // </div>
            // desktop: DeviceFrame đã bọc khung browser, chỉ cần render ad full-bleed.
            <>{adNode}</>
          )
        ) : (
          <div className='text-center text-neutral-600'>
            <p className='text-lg font-semibold'>Format not found</p>
            <Link
              href='/rexer/ads'
              className='mt-4 inline-block text-sm text-[#b8965a] underline'
            >
              Back to all formats
            </Link>
          </div>
        )}
      </DeviceFrame>
    </div>
  );
}

export default StudioAdDetail;
