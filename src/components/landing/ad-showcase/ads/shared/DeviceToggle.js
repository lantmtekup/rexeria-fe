'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { useDeviceView } from './useDeviceView';

const OPTIONS = [
  {
    id: 'mobile',
    title: 'Mobile view',
    icon: (
      <svg
        width='15'
        height='15'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <rect x='7' y='2.5' width='10' height='19' rx='2.5' />
        <line x1='11' y1='18.5' x2='13' y2='18.5' />
      </svg>
    ),
  },
  {
    id: 'desktop',
    title: 'Desktop view',
    icon: (
      <svg
        width='15'
        height='15'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <rect x='2.5' y='4' width='19' height='13' rx='2' />
        <line x1='8' y1='20.5' x2='16' y2='20.5' />
        <line x1='12' y1='17' x2='12' y2='20.5' />
      </svg>
    ),
  },
];

/**
 * Toggle chuyển chế độ mobile ↔ desktop.
 * Segmented control icon-only, sliding thumb (spring).
 *
 * 2 cách dùng:
 *  1) Không truyền props → component tự quản lý state qua useDeviceView().
 *  2) Controlled: truyền `value` + `onChange`.
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
  const reduceMotion = useReducedMotion();
  const isControlled = value !== undefined;
  const { device: hookDevice, setDevice: hookSet } = useDeviceView();
  const [internal, setInternal] = useState(defaultValue);

  useEffect(() => {
    if (!isControlled) setInternal(hookDevice);
  }, [isControlled, hookDevice]);

  const current = isControlled ? value : internal;
  const activeIndex = current === 'mobile' ? 0 : 1;

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
      <div className='dv-toggle-track'>
        <motion.div
          className='dv-toggle-thumb'
          aria-hidden='true'
          initial={false}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 520, damping: 36, mass: 0.8 }
          }
        />
        {OPTIONS.map(opt => {
          const isActive = current === opt.id;
          return (
            <button
              key={opt.id}
              type='button'
              className={`dv-toggle-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => handleClick(opt.id)}
              aria-pressed={isActive}
              aria-label={opt.title}
              title={opt.title}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
