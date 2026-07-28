'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook đồng bộ chế độ xem mobile/desktop trong cùng tab (in-memory).
 *
 * Default luôn là 'mobile' mỗi lần vào trang — không đọc/ghi storage
 * để tránh lần trước chọn desktop bị khôi phục.
 * Broadcast nội bộ tab qua CustomEvent 'rexerai:device-change'
 * để các component cùng page đồng bộ.
 *
 * @returns {{ device: 'mobile'|'desktop', setDevice: (v: 'mobile'|'desktop') => void }}
 */

const EVENT_NAME = 'rexerai:device-change';
const VALID = new Set(['mobile', 'desktop']);
const DEFAULT = 'mobile';

// Giá trị hiện tại được chia sẻ ở phạm vi module (in-memory, cùng tab).
// Khi đổi device, các component bao ngoài (vd DeviceFrame) đổi cây DOM →
// ad con bị REMOUNT sau khi event 'device-change' đã bắn → instance mới
// không nghe được event và kẹt ở DEFAULT. Đọc biến này lúc khởi tạo state
// để mount mới lấy đúng device hiện tại thay vì luôn 'mobile'.
let currentDevice = /** @type {'mobile'|'desktop'} */ (DEFAULT);

export function useDeviceView() {
  const [device, setDeviceState] = useState(
    /** @type {'mobile'|'desktop'} */ (currentDevice)
  );

  // Đồng bộ giữa các instance trong cùng tab.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onChange = e => {
      const next = e?.detail;
      if (VALID.has(next)) {
        currentDevice = /** @type {'mobile'|'desktop'} */ (next);
        setDeviceState(/** @type {'mobile'|'desktop'} */ (next));
      }
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setDevice = useCallback(next => {
    if (!VALID.has(/** @type {string} */ (next))) return;
    const value = /** @type {'mobile'|'desktop'} */ (next);
    currentDevice = value;
    setDeviceState(value);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
    }
  }, []);

  return { device, setDevice };
}

export const DEVICE_VIEW_DEFAULT = DEFAULT;
