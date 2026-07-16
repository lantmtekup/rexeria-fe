'use client';

import { useCallback, useEffect, useState } from 'react';

import { useDeviceView } from './useDeviceView';

/**
 * Toggle chuyển chế độ mobile ↔ desktop, nằm cố định góc phải–trên màn hình.
 * Tone-and-style khớp ad-showcase: pill trắng, gold #b8965a khi active.
 *
 * 2 cách dùng:
 *  1) Không truyền props → component tự quản lý state qua useDeviceView().
 *  2) Controlled: truyền `value` + `onChange` (vd: dùng chung state với Frame).
 *
 * @param {Object} props
 * @param {'mobile'|'desktop'} [props.value]
 * @param {(v: 'mobile'|'desktop') => void} [props.onChange]
 * @param {'mobile'|'desktop'} [props.defaultValue='mobile']
 * @param {string} [props.className='']
 */
export default function DeviceToggle({
  value,
  onChange,
  defaultValue = 'mobile',
  className = '',
}) {
  const isControlled = value !== undefined;
  const { device: hookDevice, setDevice: hookSet } = useDeviceView();
  const [internal, setInternal] = useState(defaultValue);

  // Nếu uncontrolled, hydrate từ hook (localStorage).
  useEffect(() => {
    if (!isControlled) setInternal(hookDevice);
  }, [isControlled, hookDevice]);

  const current = isControlled ? value : internal;

  const handleClick = useCallback(
    next => {
      if (!isControlled) {
        setInternal(next);
        hookSet(next);
      } else {
        onChange?.(next);
      }
    },
    [isControlled, onChange, hookSet]
  );

  return (
    <div
      className={`dv-toggle ${className}`}
      role='group'
      aria-label='Device preview'
    >
      <button
        type='button'
        className={`dv-toggle-btn ${current === 'mobile' ? 'is-active' : ''}`}
        onClick={() => handleClick('mobile')}
        aria-pressed={current === 'mobile'}
        aria-label='Mobile view'
        title='Mobile view'
      >
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <rect x='7' y='2.5' width='10' height='19' rx='2.5' />
          <line x1='11' y1='18.5' x2='13' y2='18.5' />
        </svg>
      </button>
      <button
        type='button'
        className={`dv-toggle-btn ${current === 'desktop' ? 'is-active' : ''}`}
        onClick={() => handleClick('desktop')}
        aria-pressed={current === 'desktop'}
        aria-label='Desktop view'
        title='Desktop view'
      >
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <rect x='2.5' y='4' width='19' height='13' rx='2' />
          <line x1='8' y1='20.5' x2='16' y2='20.5' />
          <line x1='12' y1='17' x2='12' y2='20.5' />
        </svg>
      </button>
    </div>
  );
}
