type SectionHeadProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export const SectionHead = ({
  title,
  subtitle,
  className,
}: SectionHeadProps) => {
  return (
    <div className={className}>
      <h2 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
        {title}
      </h2>
      {subtitle ? (
        <p className='mt-0.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
