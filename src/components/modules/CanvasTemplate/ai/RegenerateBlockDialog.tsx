'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Label } from '@/components/atoms/label';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { parseAITemplateError } from '@/components/modules/CanvasTemplate/ai/errors';
import type {
  AIGeneratedBlock,
  AITemplateGenerateResponse,
} from '@/services/rexer/types';

interface Props {
  open: boolean;
  templateId: string;
  sessionId: string;
  /** Existing user_input collected at /generate time — replayed on regenerate. */
  userInput: Record<string, string | number | boolean>;
  block: AIGeneratedBlock | null;
  onClose: () => void;
  /** Receives the full /generate response so caller can replace the block + bump counters. */
  onResult: (response: AITemplateGenerateResponse) => void;
  /**
   * Fires when BE returns 429 ERR_AI_TEMPLATE_REGEN_LIMIT. With BE Q3
   * shipped, `details.used/limit` are populated by the server; the dialog
   * passes them through so the Review page can snap its counter to
   * the authoritative server-side value.
   */
  onLimitReached?: (used?: number, limit?: number) => void;
}

export function RegenerateBlockDialog({
  open,
  templateId,
  sessionId,
  userInput,
  block,
  onClose,
  onResult,
  onLimitReached,
}: Props) {
  const tReview = useTranslations('ai_templates.review');
  const tErr = useTranslations('ai_templates.errors');
  const [hint, setHint] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setHint('');
  }, [open, block?.block_id]);

  const handleSubmit = async () => {
    if (!block) return;
    setSubmitting(true);
    try {
      const res = await rexerApi.aiTemplates.generate(templateId, {
        user_input: userInput,
        session_id: sessionId,
        lang: 'vi',
        regenerate: {
          block_id: block.block_id,
          // BE Q11: hint ≤ 1000 chars.
          hint: hint.trim().slice(0, 1000) || undefined,
        },
      });
      onResult(res);
      onClose();
    } catch (err) {
      const parsed = parseAITemplateError(err);
      if ('used' in parsed || 'limit' in parsed) {
        onLimitReached?.(
          'used' in parsed ? parsed.used : undefined,
          'limit' in parsed ? parsed.limit : undefined
        );
      }
      toast.error(rxMessage(err, tErr));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tReview('regenerate')}</DialogTitle>
          <DialogDescription>
            {block ? `#${block.position} — ${block.role}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='regen-hint'>Gợi ý cho AI (tuỳ chọn)</Label>
          <Textarea
            id='regen-hint'
            value={hint}
            onChange={e => setHint(e.target.value)}
            placeholder='Ví dụ: ngắn gọn hơn, dùng tone trẻ trung…'
            disabled={submitting}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button
            type='button'
            variant='primary'
            onClick={handleSubmit}
            disabled={submitting || !block}
          >
            {submitting ? (
              <span className='flex items-center gap-2'>
                <Spinner size={14} />
                {tReview('regenerate')}…
              </span>
            ) : (
              tReview('regenerate')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function rxMessage(err: unknown, tErr: (key: string) => string): string {
  if (err instanceof RxApiError) {
    if (err.code === 'ERR_AI_TEMPLATE_REGEN_LIMIT') return tErr('regen_limit');
    return err.message || tErr('generic');
  }
  if (err instanceof Error) return err.message;
  return tErr('generic');
}
