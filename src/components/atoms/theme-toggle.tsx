'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/cn';

export type ThemeToggleProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Segmented Light / Dark toggle shown at the bottom of the app sidebar.
 */
function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? theme : 'light';

  return (
    <div
      role='radiogroup'
      aria-label='Theme'
      className={cn(
        'rounded-pill inline-flex items-center gap-1 bg-neutral-100 p-1 dark:bg-neutral-800',
        className
      )}
      {...props}
    >
      <button
        type='button'
        role='radio'
        aria-checked={current === 'light'}
        onClick={() => setTheme('light')}
        className={cn(
          'rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-medium transition-colors',
          current === 'light'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
        )}
      >
        <Sun className='size-3.5' />
        Light
      </button>
      <button
        type='button'
        role='radio'
        aria-checked={current === 'dark'}
        onClick={() => setTheme('dark')}
        className={cn(
          'rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-medium transition-colors',
          current === 'dark'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
        )}
      >
        <Moon className='size-3.5' />
        Dark
      </button>
    </div>
  );
}

export { ThemeToggle };
