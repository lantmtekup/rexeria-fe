'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { JourneyCheckRow } from '@/components/organisms/portal-v2/journeys/JourneyCheckRow';
import { JourneyGraph } from '@/components/organisms/portal-v2/journeys/JourneyGraph';
import { JourneyInspector } from '@/components/organisms/portal-v2/journeys/JourneyInspector';
import { nodeById, validateJourney } from '@/lib/portal-v2/journeys/helpers';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type JourneyCanvasPaneProps = {
  journey: Journey;
};

export const JourneyCanvasPane = ({ journey }: JourneyCanvasPaneProps) => {
  const t = useTranslations('portalV2.journeys');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const checks = useMemo(() => validateJourney(journey), [journey]);
  const failing = checks.filter(c => !c.ok);
  const selected = selectedId ? nodeById(journey, selectedId) : null;

  return (
    <div>
      <div className='grid items-start gap-3.5 lg:grid-cols-[minmax(0,1fr)_236px]'>
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-3'>
          <JourneyGraph
            journey={journey}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <JourneyInspector node={selected} branches={selected?.to.length ?? 0} />
      </div>

      <div className='mt-4 flex flex-col gap-1.5'>
        {failing.length ? (
          failing.map(check => (
            <JourneyCheckRow key={check.msg} check={check} />
          ))
        ) : (
          <JourneyCheckRow check={{ ok: true, msg: t('checksAllPass') }} />
        )}
      </div>
    </div>
  );
};
