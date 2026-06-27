'use client';

/**
 * StudioAdDetail — trang chi tiết 1 block: render LIVE, tương tác đầy đủ
 * (không có lớp tap-catcher như gallery). Giống màn /preview của site cũ.
 */
import * as React from 'react';
import Link from 'next/link';

import './ads.css';
import './ads-extra.css';
import './interscroller-preview.css';
import './preview.css';
import './showcase.css';
import { ALL_ITEMS } from './content';
import InterscrollerPreview from './ads/InterscrollerPreview';

type AdItem = {
  id: string;
  name: string;
  desc: string;
  by: 'Nguyên' | 'Thảo';
  render: () => React.ReactNode;
};

export function StudioAdDetail({ id }: { id: string }) {
  const item = (ALL_ITEMS as AdItem[]).find(i => i.id === id);

  return (
    // Overlay full-screen phủ header/footer landing (route nằm trong layout
    // landing → không bỏ parent layout được). Bên trong dùng NGUYÊN cấu trúc
    // .pv-* copy từ ads_demo /preview để khung phone khớp 100% (iPhone
    // 393/852, EXPAND tab, notch, home bar).
    <div className='ad-showcase-root fixed inset-0 z-[999]'>
      <div className='pv-page'>
        <Link href='/rexer/ads' className='pv-back'>
          ← Studio
        </Link>

        {item ? (
          <div className='pv-phone-area'>
            <div className='pv-phone'>
              <div className='pv-notch' />
              <div className='pv-screen'>
                <InterscrollerPreview>{item.render()}</InterscrollerPreview>
                <div className='pv-home-bar' />
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
}

export default StudioAdDetail;
