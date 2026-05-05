'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CampaignObjective } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const OBJECTIVES: CampaignObjective[] = [
  'awareness',
  'traffic',
  'conversion',
  'retention',
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function NewCampaignPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const basePath = `/product/${id}`;

  const [name, setName] = React.useState('');
  const [objective, setObjective] =
    React.useState<CampaignObjective>('conversion');
  const [budget, setBudget] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await rexerApi.campaigns.create({
        name: name.trim(),
        product_id: id,
        objective,
        budget_amount: budget ? Number(budget) : undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Campaign created');
      router.push(`${basePath}/marketing/${created.id}`);
    } catch (err) {
      toast.error(`Create failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName='New campaign'
      scope='product'
      section='marketing'
      actions={
        <Button asChild variant='pill-light' size='sm'>
          <Link href={`${basePath}/marketing`}>
            <ArrowLeft className='size-3.5' /> Cancel
          </Link>
        </Button>
      }
    >
      <form
        onSubmit={handleCreate}
        className='mx-auto flex w-full max-w-[700px] flex-col gap-4 px-6 pb-10'
      >
        <div className='flex flex-col gap-2'>
          <Label htmlFor='c-name'>Name</Label>
          <Input
            id='c-name'
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Spring launch'
            disabled={submitting}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='c-obj'>Objective</Label>
          <select
            id='c-obj'
            value={objective}
            onChange={e => setObjective(e.target.value as CampaignObjective)}
            disabled={submitting}
            className='border-input bg-background h-10 rounded-md border px-3 text-sm'
          >
            {OBJECTIVES.map(o => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='c-budget'>Budget (USD)</Label>
          <Input
            id='c-budget'
            type='number'
            min={0}
            step={100}
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder='1000'
            disabled={submitting}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='c-notes'>Notes</Label>
          <Textarea
            id='c-notes'
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Audience, channels, brand guardrails…'
            disabled={submitting}
          />
        </div>

        <div className='flex items-center justify-between gap-3 pt-2'>
          <Button asChild variant='ai' size='md'>
            <Link href={`/ai-agents/${id}/campaign`}>
              <Sparkles className='size-3.5' /> Plan with AI instead
            </Link>
          </Button>
          <Button
            type='submit'
            variant='primary'
            size='md'
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size={14} /> Creating…
              </>
            ) : (
              'Create campaign'
            )}
          </Button>
        </div>
      </form>
    </ProductWorkspaceLayout>
  );
}
