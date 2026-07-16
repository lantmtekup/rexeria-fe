'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook đồng bộ chế độ xem mobile/desktop qua localStorage.
 *
 * Key: 'rexerai:ad-device-mode' (string 'mobile' | 'desktop')
 * Default: 'mobile'
 * Broadcast nội bộ tab qua CustomEvent 'rexerai:device-change'
 * để các component cùng page đồng bộ mà không cần thêm storage listener.
 *
 * @returns {{ device: 'mobile'|'desktop', setDevice: (v: 'mobile'|'desktop') => void }}
 */

const STORAGE_KEY = 'rexerai:ad-device-mode';
const EVENT_NAME = 'rexerai:device-change';
const VALID = new Set(['mobile', 'desktop']);
const DEFAULT = 'mobile';

const readStored = () => {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return VALID.has(v) ? v : DEFAULT;
  } catch {
    return DEFAULT;
  }
};

export function useDeviceView() {
  const [device, setDeviceState] = useState(
    /** @type {'mobile'|'desktop'} */ (DEFAULT)
  );

  // Hydrate từ localStorage (client-only).
  useEffect(() => {
    const stored = readStored();
    if (stored !== DEFAULT) setDeviceState(stored);
  }, []);

  // Đồng bộ giữa các instance trong cùng tab.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onChange = e => {
      const next = e?.detail;
      if (VALID.has(next))
        setDeviceState(/** @type {'mobile'|'desktop'} */ (next));
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setDevice = useCallback(next => {
    if (!VALID.has(/** @type {string} */ (next))) return;
    const value = /** @type {'mobile'|'desktop'} */ (next);
    setDeviceState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore quota / private-mode errors
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
    }
  }, []);

  return { device, setDevice };
}

export const DEVICE_VIEW_STORAGE_KEY = STORAGE_KEY;
export const DEVICE_VIEW_DEFAULT = DEFAULT;
