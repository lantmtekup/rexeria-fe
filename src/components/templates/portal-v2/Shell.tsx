'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Rail } from '@/components/organisms/portal-v2/Rail';
import { Topbar } from '@/components/organisms/portal-v2/Topbar';
import { cn } from '@/lib/cn';
import {
  readRailCollapsed,
  writeRailCollapsed,
} from '@/lib/portal-v2/rail-preference';

type ShellProps = {
  children: ReactNode;
  /**
   * `false` = khách chưa đăng nhập (chỉ tới được `/portal-v2/exchange`).
   *
   * Khi đó KHÔNG dựng thanh điều hướng trái: mọi mục trong đó đều dẫn tới màn
   * đòi đăng nhập, nên bày ra chỉ là một hàng bẫy. Khung còn lại một cột, và
   * Topbar đổi sang mời đăng nhập thay vì avatar + chuông + nút Tạo.
   */
  signedIn?: boolean;
};

export const Shell = ({ children, signedIn = true }: ShellProps) => {
  // collapsed = icon-only rail; expanded = full sidebar with labels
  const [railCollapsed, setRailCollapsed] = useState(false);

  useEffect(() => {
    setRailCollapsed(readRailCollapsed());
  }, []);

  const handleToggleRail = useCallback(() => {
    setRailCollapsed(prev => {
      const next = !prev;
      writeRailCollapsed(next);
      return next;
    });
  }, []);

  return (
    <div
      className={cn(
        'grid h-dvh grid-rows-[var(--pv2-top)_minmax(0,1fr)] overflow-hidden',
        'transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none',
        !signedIn
          ? 'grid-cols-[minmax(0,1fr)]'
          : railCollapsed
            ? 'grid-cols-[var(--pv2-rail)_minmax(0,1fr)]'
            : 'grid-cols-[var(--pv2-rail-full)_minmax(0,1fr)]',

        'bg-white'
      )}
      data-rail-collapsed={railCollapsed ? 'true' : 'false'}
      data-guest={signedIn ? undefined : 'true'}
    >
      <Topbar
        railCollapsed={railCollapsed}
        onToggleRail={handleToggleRail}
        signedIn={signedIn}
      />
      {signedIn ? <Rail collapsed={railCollapsed} /> : null}
      <main className='relative min-w-0 overflow-x-hidden overflow-y-auto bg-[var(--pv2-canvas)] outline-none'>
        {children}
      </main>
    </div>
  );
};
