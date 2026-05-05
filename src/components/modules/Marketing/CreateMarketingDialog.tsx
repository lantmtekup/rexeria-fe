'use client';

import * as React from 'react';
import { ArrowLeft, Info, Pencil, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';

export interface MarketingDraft {
  name: string;
  members: string[];
  campaigns: string[];
  status: 'active' | 'stop';
}

const DEFAULT_MEMBERS = [
  'Zayden Jarvis',
  'Kailee Rogers',
  'Ember Mooney',
  'Jaxon Reed',
];

interface CreateMarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the assembled draft. Currently BE has no Marketing entity
   * — caller may persist as N campaigns or just close. Default behaviour
   * (no handler) shows a success toast and closes.
   */
  onCreate?: (draft: MarketingDraft) => Promise<void> | void;
}

export function CreateMarketingDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateMarketingDialogProps) {
  const [name, setName] = React.useState('Marketing name');
  const [editingName, setEditingName] = React.useState(false);
  const [members, setMembers] = React.useState<string[]>(DEFAULT_MEMBERS);
  const [memberDraft, setMemberDraft] = React.useState('');
  const [addingMember, setAddingMember] = React.useState(false);
  const [campaigns, setCampaigns] = React.useState<string[]>(['']);
  const [status, setStatus] = React.useState<'active' | 'stop'>('active');
  const [submitting, setSubmitting] = React.useState(false);

  // Reset form when dialog opens fresh.
  React.useEffect(() => {
    if (open) {
      setName('Marketing name');
      setEditingName(false);
      setMembers(DEFAULT_MEMBERS);
      setMemberDraft('');
      setAddingMember(false);
      setCampaigns(['']);
      setStatus('active');
    }
  }, [open]);

  const updateCampaign = (i: number, v: string) => {
    setCampaigns(prev => prev.map((c, idx) => (idx === i ? v : c)));
  };
  const addCampaign = () => setCampaigns(prev => [...prev, '']);
  const removeCampaign = (i: number) => {
    setCampaigns(prev =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );
  };
  const removeMember = (m: string) =>
    setMembers(prev => prev.filter(x => x !== m));
  const commitMember = () => {
    const next = memberDraft.trim();
    if (!next) {
      setAddingMember(false);
      setMemberDraft('');
      return;
    }
    setMembers(prev => (prev.includes(next) ? prev : [...prev, next]));
    setMemberDraft('');
    setAddingMember(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || name.trim() === 'Marketing name') {
      toast.error('Đặt tên cho marketing trước');
      return;
    }
    const filledCampaigns = campaigns.map(c => c.trim()).filter(Boolean);
    if (filledCampaigns.length === 0) {
      toast.error('Thêm ít nhất 1 campaign');
      return;
    }
    const draft: MarketingDraft = {
      name: name.trim(),
      members,
      campaigns: filledCampaigns,
      status,
    };
    setSubmitting(true);
    try {
      if (onCreate) {
        await onCreate(draft);
      } else {
        toast.success(
          `Đã tạo "${draft.name}" với ${filledCampaigns.length} campaign`
        );
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <header className='-mx-6 -mt-6 flex items-center justify-between border-b border-neutral-100 px-4 py-3'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            aria-label='Quay lại'
            className='flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          >
            <ArrowLeft className='size-4' />
          </button>
          <DialogTitle className='text-base font-semibold'>
            Create Marketing
          </DialogTitle>
          <button
            type='button'
            aria-label='Info'
            className='flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100'
          >
            <Info className='size-4' />
          </button>
        </header>

        <div className='flex flex-col gap-5 pt-2'>
          {/* Name */}
          <div className='flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2.5'>
            {editingName ? (
              <Input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setEditingName(false);
                  }
                }}
                className='h-7 flex-1 border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0'
              />
            ) : (
              <button
                type='button'
                onClick={() => setEditingName(true)}
                className='flex flex-1 cursor-pointer items-center gap-2 text-left text-sm font-medium'
              >
                {name}
                <Pencil className='size-3 text-neutral-500' />
              </button>
            )}
            <button
              type='button'
              aria-label='Hành động'
              className='text-neutral-400 hover:text-neutral-700'
            >
              ⋮
            </button>
          </div>

          {/* Members */}
          <section>
            <h4 className='text-foreground mb-2 text-sm font-semibold'>
              Member
            </h4>
            <div className='flex flex-wrap items-center gap-2'>
              {members.map(m => (
                <span
                  key={m}
                  data-testid='member-chip'
                  className='inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-1 pr-2 pl-1 text-xs font-medium'
                >
                  <Avatar src='' name={m} size='xs' />
                  {m}
                  <button
                    type='button'
                    onClick={() => removeMember(m)}
                    aria-label={`Bỏ ${m}`}
                    className='ml-0.5 cursor-pointer text-neutral-400 hover:text-neutral-700'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}
              {addingMember ? (
                <span className='inline-flex items-center gap-1 rounded-full bg-neutral-100 py-1 pr-1.5 pl-2 text-xs font-medium'>
                  <Input
                    autoFocus
                    value={memberDraft}
                    onChange={e => setMemberDraft(e.target.value)}
                    onBlur={commitMember}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitMember();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setMemberDraft('');
                        setAddingMember(false);
                      }
                    }}
                    placeholder='Member name'
                    aria-label='Tên thành viên'
                    className='h-6 w-32 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0'
                  />
                </span>
              ) : (
                <button
                  type='button'
                  onClick={() => setAddingMember(true)}
                  aria-label='Thêm thành viên'
                  className='inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-500 hover:border-neutral-500 hover:text-neutral-800'
                >
                  <Plus className='size-3' /> Add
                </button>
              )}
            </div>
          </section>

          {/* Campaigns */}
          <section>
            <h4 className='text-foreground mb-2 text-sm font-semibold'>
              Campaign
            </h4>
            <div className='flex flex-col gap-2'>
              {campaigns.map((c, i) => (
                <div
                  key={i}
                  className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5'
                >
                  <Input
                    value={c}
                    onChange={e => updateCampaign(i, e.target.value)}
                    placeholder='Campaign name'
                    className='h-7 flex-1 border-0 p-0 text-sm shadow-none focus-visible:ring-0'
                  />
                  {campaigns.length > 1 ? (
                    <button
                      type='button'
                      onClick={() => removeCampaign(i)}
                      aria-label='Xoá'
                      className='text-neutral-400 hover:text-rose-600'
                    >
                      <X className='size-3.5' />
                    </button>
                  ) : (
                    <Pencil className='size-3.5 text-neutral-400' />
                  )}
                </div>
              ))}
            </div>
            <button
              type='button'
              onClick={addCampaign}
              className='rounded-pill mt-2 inline-flex h-8 cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800'
            >
              <Plus className='size-3.5' /> Add more
            </button>
          </section>

          {/* Status */}
          <section>
            <h4 className='text-foreground mb-2 text-sm font-semibold'>
              Status
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              {(['active', 'stop'] as const).map(s => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type='button'
                    onClick={() => setStatus(s)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-neutral-900 bg-white'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        s === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                      )}
                    />
                    {s === 'active' ? 'Active' : 'Stop'}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <Button
          variant='primary'
          size='md'
          onClick={handleSubmit}
          disabled={submitting}
          className='rounded-pill mt-2 w-full justify-center'
        >
          {submitting ? 'Đang tạo…' : 'Create'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
