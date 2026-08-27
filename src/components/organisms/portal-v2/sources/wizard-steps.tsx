'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type {
  WizardAccount,
  WizardPerm,
  WizardPopup,
  WizardStep,
} from '@/lib/portal-v2/journey-audit/types';

/** Các mảnh trình bày của ConnectWizard — không giữ state. */

export const PermRow = ({ perm }: { perm: WizardPerm }) => (
  <div className='flex items-start gap-2.5 border-b border-dashed border-[var(--pv2-hair)] py-2 last:border-b-0'>
    <span className='mt-0.5 shrink-0 font-bold text-[var(--pv2-success)]'>
      ✓
    </span>
    <div>
      <b className='block text-xs text-[var(--pv2-ink)]'>
        {perm.title}
        {perm.code ? (
          <code className='text-3xs ml-1.5 rounded-[5px] bg-[var(--pv2-canvas)] px-1.5 py-0.5 text-[var(--pv2-faint)]'>
            {perm.code}
          </code>
        ) : null}
      </b>
      <span className='text-2xs mt-0.5 block leading-relaxed text-[var(--pv2-faint)]'>
        {perm.desc}
      </span>
    </div>
  </div>
);

export const DenyNote = ({ text }: { text: string }) => {
  const t = useTranslations('portalV2.sources');
  return (
    <p className='text-2xs mt-2.5 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] px-3 py-2 text-[var(--pv2-mut)]'>
      <b className='text-[var(--pv2-success)]'>{t('wizardNoWrite')}</b> {text}
    </p>
  );
};

export const PopupFrame = ({
  popup,
  children,
}: {
  popup: WizardPopup;
  children: React.ReactNode;
}) => (
  <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-sm)]'>
    <div className='flex items-center gap-1.5 border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2'>
      <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
      <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
      <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
      <span className='text-3xs ml-1.5 flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-[6px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 py-1 whitespace-nowrap text-[var(--pv2-faint)]'>
        <span className='text-[var(--pv2-success)]'>🔒</span>
        {popup.url}
      </span>
    </div>
    <div className='px-5 py-4'>
      <div className='mb-1 flex items-center gap-2 text-[15px] font-bold text-[var(--pv2-ink)]'>
        <span
          aria-hidden
          className='grid size-[26px] shrink-0 place-items-center rounded-[7px] text-[13px] font-extrabold text-[var(--pv2-paper)]'
          style={{
            background: popup.brandBg,
            color: popup.brandBg === '#ffffff' ? '#4285F4' : undefined,
            border:
              popup.brandBg === '#ffffff'
                ? '1px solid var(--pv2-hair)'
                : undefined,
          }}
        >
          {popup.brandLetter}
        </span>
        {popup.brandName}
      </div>
      <p
        className='mb-3.5 text-xs leading-relaxed text-[var(--pv2-faint)] [&_b]:text-[var(--pv2-mut)]'
        dangerouslySetInnerHTML={{ __html: popup.brandSub }}
      />
      {children}
    </div>
  </div>
);

export const AccountRow = ({
  account,
  selected,
  onSelect,
}: {
  account: WizardAccount;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type='button'
    onClick={onSelect}
    className={cn(
      'mb-2 flex w-full items-center gap-3 rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-left transition-colors',
      selected
        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
        : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-electric)]'
    )}
  >
    <span
      aria-hidden
      className='grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold text-[var(--pv2-paper)]'
      style={{ background: account.bg }}
    >
      {account.initials}
    </span>
    <span className='min-w-0'>
      <b className='block truncate text-[13px] text-[var(--pv2-ink)]'>
        {account.name}
      </b>
      <span className='text-2xs block truncate text-[var(--pv2-faint)]'>
        {account.sub}
      </span>
    </span>
    <span
      aria-hidden
      className={cn(
        'ml-auto size-[15px] shrink-0 rounded-full border-2',
        selected
          ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] shadow-[inset_0_0_0_3px_var(--pv2-paper)]'
          : 'border-[var(--pv2-hair)]'
      )}
    />
  </button>
);

export const SyncRows = ({
  rows,
  doneCount,
}: {
  rows: Array<[string, string?]>;
  doneCount: number;
}) => (
  <div>
    {rows.map(([label, detail], index) => (
      <div
        key={label}
        className='flex items-center gap-2.5 border-b border-dashed border-[var(--pv2-hair)] py-2 text-xs text-[var(--pv2-mut)] last:border-b-0'
      >
        <span className='w-[18px] shrink-0 text-center'>
          {index < doneCount ? (
            <span className='font-bold text-[var(--pv2-success)]'>✓</span>
          ) : index === doneCount ? (
            <span
              aria-hidden
              className='inline-block size-[13px] animate-spin rounded-full border-2 border-[var(--pv2-hair)] border-t-[var(--pv2-electric)] align-[-2px]'
            />
          ) : (
            '·'
          )}
        </span>
        <span>{label}</span>
        <span className='text-3xs ml-auto text-[var(--pv2-faint)]'>
          {detail ?? ''}
        </span>
      </div>
    ))}
  </div>
);

type StepBodyProps = {
  step: Exclude<WizardStep, { kind: 'sync' }>;
  selections: Record<string, number>;
  onSelect: (key: string, index: number) => void;
  /** Giá trị field của bước form (controlled — bước authorize thật cần đọc,
   *  vd shop domain của Shopify). */
  fieldValues: Record<string, string>;
  onFieldChange: (label: string, value: string) => void;
};

/** Body của một bước không-sync, theo `kind`. */
export const WizardStepBody = ({
  step,
  selections,
  onSelect,
  fieldValues,
  onFieldChange,
}: StepBodyProps) => {
  const t = useTranslations('portalV2.sources');

  if (step.kind === 'form') {
    return (
      <div>
        {step.lead ? (
          <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
            {step.lead}
          </p>
        ) : null}
        {step.guide ? (
          <div className='text-2xs mb-3.5 rounded-[var(--pv2-r-sm)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 leading-relaxed text-[var(--pv2-mut)]'>
            <b className='text-3xs mb-1 block font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'>
              {step.guide.title}
            </b>
            {step.guide.body}
          </div>
        ) : null}
        {step.fields.map(field => (
          <div key={field.label} className='mb-3'>
            <label className='text-3xs mb-1 block font-bold tracking-[0.07em] text-[var(--pv2-faint)] uppercase'>
              {field.label}
              <input
                type={field.type ?? 'text'}
                value={fieldValues[field.label] ?? field.value}
                onChange={event =>
                  onFieldChange(field.label, event.target.value)
                }
                spellCheck={false}
                className='mt-1 w-full rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2 text-[13px] text-[var(--pv2-ink)] normal-case focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric-soft)] focus:outline-none'
              />
            </label>
            {field.help ? (
              <p className='text-2xs mt-1 leading-relaxed text-[var(--pv2-faint)]'>
                {field.help}
              </p>
            ) : null}
          </div>
        ))}
        {step.denyNote ? <DenyNote text={step.denyNote} /> : null}
      </div>
    );
  }

  if (step.kind === 'oauth') {
    return (
      <PopupFrame popup={step.popup}>
        {step.perms?.map(perm => (
          <PermRow key={perm.title} perm={perm} />
        ))}
        {step.accounts
          ? step.accounts.items.map((account, index) => (
              <AccountRow
                key={account.name}
                account={account}
                selected={(selections[step.accounts!.key] ?? 0) === index}
                onSelect={() => onSelect(step.accounts!.key, index)}
              />
            ))
          : null}
        {step.denyNote ? <DenyNote text={step.denyNote} /> : null}
      </PopupFrame>
    );
  }

  if (step.kind === 'picker') {
    return (
      <div>
        <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
          {step.lead}
        </p>
        {step.accounts.map((account, index) => (
          <AccountRow
            key={account.name}
            account={account}
            selected={(selections[step.accountsKey] ?? 0) === index}
            onSelect={() => onSelect(step.accountsKey, index)}
          />
        ))}
        {step.help ? (
          <p className='text-2xs mt-1 leading-relaxed text-[var(--pv2-faint)]'>
            {step.help}
          </p>
        ) : null}
      </div>
    );
  }

  // mapping
  return (
    <div>
      <p className='mb-3.5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
        {step.lead}
      </p>
      {step.rows.map(row => (
        <PermRow key={row.title} perm={row} />
      ))}
      <p className='sr-only'>{t('wizardMappingAria')}</p>
    </div>
  );
};
