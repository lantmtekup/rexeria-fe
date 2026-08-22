'use client';

/**
 * StudioAdDetail — trang chi tiết 1 block: render LIVE, tương tác đầy đủ
 * (không có lớp tap-catcher như gallery).
 *
 * Có 2 chế độ hiển thị: mobile (iPhone frame, mặc định) và desktop
 * (browser frame). Người dùng chuyển qua lại bằng DeviceToggle ở góc
 * phải trên. Mặc định luôn mobile; đồng bộ trong cùng tab (xem useDeviceView).
 *
 * Chrome: light stage (#F6F6F6) + top bar (back / title / device toggle).
 */
import * as React from 'react';
import Link from 'next/link';

import './ads.css';
import './ads-extra.css';
import './interscroller-preview.css';
import './preview.css';
import './device-toggle.css';
import './showcase.css';
import './detail-chrome.css';
import { ALL_ITEMS } from './content';
import InterscrollerPreview from './ads/InterscrollerPreview';
import { useDeviceView } from './ads/shared/useDeviceView';
import DeviceToggle from './ads/shared/DeviceToggle';
import DeviceFrame from './ads/shared/DeviceFrame';

type AdItem = {
  id: string;
  name?: string;
  render: () => React.ReactNode;
};

/**
 * `embed` — trang này đang nằm trong iframe của một màn khác (Exchange →
 * Smart ads). Chỉ bỏ thanh chrome trên cùng (nút back + tên + device toggle);
 * DeviceFrame giữ NGUYÊN vì `InterscrollerPreview` đo bounds của `.isp` bên
 * trong nó để ghim quảng cáo — bỏ frame là vỡ. Device khi đó do host quyết,
 * truyền vào qua `?device=`.
 */
export function StudioAdDetail({
  id,
  embed = false,
  device: deviceOverride,
}: {
  id: string;
  embed?: boolean;
  device?: 'mobile' | 'desktop';
}) {
  const items = ALL_ITEMS as AdItem[];
  const item = items.find(i => i.id === id);

  const { device: ownDevice, setDevice } = useDeviceView();
  const device = embed && deviceOverride ? deviceOverride : ownDevice;

  const urlBar = item ? `rexer.studio/ads/${item.id}` : 'about:blank';

  React.useLayoutEffect(() => {
    if (!embed) return;
    const root = document.documentElement;
    root.classList.add('pvx-embed-doc');
    if (device === 'mobile') root.classList.add('pvx-embed-doc-mobile');
    return () => {
      root.classList.remove('pvx-embed-doc', 'pvx-embed-doc-mobile');
    };
  }, [embed, device]);

  // Khung phone notch/home-bar chỉ ngữ cảnh mobile; desktop dùng display bezel.
  // Render cùng children cho cả 2 nhánh (ad render()), chỉ đổi khung bao.
  const adNode = item ? (
    <InterscrollerPreview>{item.render()}</InterscrollerPreview>
  ) : null;

  return (
    // Overlay full-screen phủ header/footer landing. DeviceFrame giữ nguyên
    // khung phone / display bezel; chỉ stage + top bar dùng light theme.
    <div
      className={[
        'ad-showcase-root ad-showcase-detail z-[999]',
        embed ? 'absolute inset-0' : 'fixed inset-0',
        `dv-mode-${device}`,
        embed ? 'pvx-embed' : '',
        embed && device === 'mobile' ? 'overflow-hidden rounded-[28px]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {embed ? null : (
        <header className='pvx-chrome'>
          <Link
            href='/rexer/ads'
            className='pv-back'
            aria-label='Back to Studio'
          >
            <span className='pv-back-mark' aria-hidden='true'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M19 12H5' />
                <path d='M12 19l-7-7 7-7' />
              </svg>
            </span>
            <span className='pv-back-text'>Studio</span>
          </Link>
          {item ? (
            <>
              <p className='pvx-chrome-title'>{item.name ?? item.id}</p>
              <DeviceToggle value={device} onChange={setDevice} />
            </>
          ) : (
            <span className='pvx-chrome-spacer' aria-hidden='true' />
          )}
        </header>
      )}

      {item ? (
        embed ? (
          // Embed: host đã dựng khung máy quanh iframe rồi, nên ở đây KHÔNG
          // dựng thêm DeviceFrame và không vẽ home-bar. `.isp` là width/height
          // 100% nên nó lấp đầy đúng khung của host.
          adNode
        ) : (
          <DeviceFrame
            device={device}
            desktopMaxWidth='1040px'
            desktopUrl={urlBar}
            urlBarText={urlBar}
          >
            {device === 'mobile' ? (
              <>
                {adNode}
                <div className='pv-home-bar' />
              </>
            ) : (
              // desktop: DeviceFrame đã bọc display bezel, chỉ cần render ad full-bleed.
              <>{adNode}</>
            )}
          </DeviceFrame>
        )
      ) : (
        // Not-found: light stage từ detail-chrome.css.
        <div className='pv-page'>
          <div className='pvx-notfound'>
            <p className='pvx-notfound-title'>Format not found</p>
            <p className='pvx-notfound-sub'>
              This demo does not exist or has moved.
            </p>
            <Link href='/rexer/ads' className='pvx-notfound-link'>
              Back to all formats
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudioAdDetail;
