'use client';

import { useTranslations } from 'next-intl';
import { HoverCard } from 'radix-ui';

import { EXCHANGE_OBJECTIVES } from '@/lib/portal-v2/exchange/constants';
import { objectivePillStyle } from '@/lib/portal-v2/exchange/objectiveStyles';
import type { ExchangeObjective } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

/**
 * Bảng giải thích bộ lọc Mục tiêu — cho người lần đầu vào màn Exchange.
 *
 * Rê chuột từng chip (`FilterChips` → `hint`) chỉ trả lời được MỘT cái một lúc.
 * Người mới không phân biệt được bốn nhãn này vì chúng không cùng một trục:
 * `CTA` là một thành phần trên trang, `Insights` là cách ReXeR gọi. Nên cái họ
 * cần là nhìn cả bốn CẠNH NHAU, và đó là việc của bảng này.
 *
 * Dòng cuối nói thẳng rằng món chưa khai mục tiêu sẽ không hiện khi lọc. Không
 * nói thì người dùng chọn một mục tiêu, thấy màn hình trống, và kết luận là chợ
 * rỗng — trong khi sự thật là hàng có mà chưa ai gắn nhãn.
 */
export const ObjectiveFilterHelp = () => {
  const t = useTranslations('portalV2.exchange');

  /** Bỏ 'all' — nó không phải một mục tiêu, chỉ là "đừng lọc". */
  const objectives = EXCHANGE_OBJECTIVES.filter(o => o.id !== 'all');

  return (
    <HoverCard.Root openDelay={80} closeDelay={140}>
      <HoverCard.Trigger asChild>
        <button
          type='button'
          aria-label={t('objHelpAria')}
          className={cn(
            'inline-flex size-3.5 shrink-0 items-center justify-center rounded-full',
            'bg-[var(--pv2-hair)] text-[9.5px] leading-none font-bold text-[var(--pv2-mut)]',
            'align-middle transition-colors',
            'hover:bg-[var(--pv2-violet)] hover:text-[var(--pv2-paper)]',
            'focus-visible:bg-[var(--pv2-violet)] focus-visible:text-[var(--pv2-paper)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          )}
        >
          ?
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side='bottom'
          align='start'
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            'z-[var(--pv2-z-tip)] w-[340px] max-w-[calc(100vw-24px)]',
            'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
            'p-3.5 shadow-[var(--pv2-sh-soft)]'
          )}
        >
          <strong className='font-[family-name:var(--pv2-disp)] text-[13px] font-semibold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('objHelpTitle')}
          </strong>
          <p className='mt-1.5 text-[12px] leading-[1.55] text-[var(--pv2-mut)]'>
            {t('objHelpIntro')}
          </p>

          <ul className='mt-2.5 space-y-2'>
            {objectives.map(o => {
              const pill = objectivePillStyle(
                o.id as Exclude<ExchangeObjective, 'all'>
              );
              return (
                <li key={o.id} className='flex gap-2'>
                  <span
                    className='mt-px inline-flex h-fit shrink-0 items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
                    style={{ background: pill.bg, color: pill.fg }}
                  >
                    {t(o.labelKey)}
                  </span>
                  <span className='text-[11.5px] leading-[1.5] text-[var(--pv2-mut)]'>
                    {t(o.hintKey)}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className='mt-2.5 border-t border-[var(--pv2-hair)] pt-2 text-[10.5px] leading-[1.5] text-[var(--pv2-faint)]'>
            {t('objHelpUnset')}
          </p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
