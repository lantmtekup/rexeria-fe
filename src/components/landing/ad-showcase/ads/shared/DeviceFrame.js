'use client';

import { useMemo } from 'react';

/**
 * Khung hiển thị ad theo chế độ mobile / desktop.
 *
 *  - mobile  → bọc children trong `.pv-phone-area + .pv-phone`
 *              (CSS dùng các class có sẵn trong preview.css — không cần thêm CSS).
 *  - desktop → bọc trong `.dv-desktop-window` (khung browser, định nghĩa ở device-toggle.css).
 *
 * Children nhận cùng 1 node — chỉ đổi khung bao quanh.
 * Hook mobile/desktop tùy chỉnh không được truyền props `desktopUrl`, `desktopTitle`.
 *
 * @param {Object} props
 * @param {'mobile'|'desktop'} props.device
 * @param {React.ReactNode}    props.children
 * @param {string}             [props.desktopMaxWidth='1200px']
 * @param {string}             [props.desktopUrl]      - hiển thị trên URL bar (decorative)
 * @param {string}             [props.className]
 * @param {string}             [props.urlBarText]      - text URL bar; fallback desktopUrl hoặc 'About:blank'
 */
export default function DeviceFrame({
  device,
  children,
  desktopMaxWidth = '1200px',
  desktopUrl,
  urlBarText,
  className = '',
}) {
  const urlText = useMemo(
    () => urlBarText || desktopUrl || 'about:blank',
    [urlBarText, desktopUrl]
  );

  if (device === 'desktop') {
    return (
      <div className={`dv-desktop ${className}`}>
        <div
          className='dv-desktop-window'
          style={{ maxWidth: desktopMaxWidth }}
        >
          <div className='dv-desktop-chrome'>
            <span className='dv-desktop-dot dv-desktop-dot--red' />
            <span className='dv-desktop-dot dv-desktop-dot--yellow' />
            <span className='dv-desktop-dot dv-desktop-dot--green' />
            <div className='dv-desktop-urlbar'>{urlText}</div>
          </div>
          <div className='dv-desktop-content'>{children}</div>
        </div>
      </div>
    );
  }

  // mobile — giữ nguyên cấu trúc phone frame hiện có để không phá vỡ preview.css
  return (
    <div className={`pv-page ${className}`}>
      <div className='pv-phone-area'>
        <div className='pv-phone'>
          <div className='pv-notch' />
          <div className='pv-screen'>{children}</div>
        </div>
      </div>
    </div>
  );
}
