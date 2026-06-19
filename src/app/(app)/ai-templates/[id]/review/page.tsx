'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Clock, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { serializeCanvas } from '@/components/modules/block-editor/serialize';
import { BlockReviewCard } from '@/components/modules/CanvasTemplate/ai/BlockReviewCard';
import { VersionHistoryDrawer } from '@/components/modules/CanvasTemplate/ai/VersionHistoryDrawer';
import { ImageSuggestionDialog } from '@/components/modules/CanvasTemplate/ai/ImageSuggestionDialog';
import { RegenerateBlockDialog } from '@/components/modules/CanvasTemplate/ai/RegenerateBlockDialog';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AIGeneratedBlock,
  AIGenerationVersion,
  AITemplateGenerateResponse,
} from '@/services/rexer/types';

/**
 * BE Q7: default limit = 10 / session. BE Q3 patch will surface the
 * authoritative `used/limit` inside the 429 error body — when that lands,
 * `RegenerateBlockDialog.onLimitReached` snaps the counter to those values.
 */
const REGEN_LIMIT_DEFAULT = 10;

interface CachedGenerate {
  template_id: string;
  user_input: Record<string, string | number | boolean>;
  result: AITemplateGenerateResponse;
}

function loadCache(sessionId: string): CachedGenerate | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`aitpl:gen:${sessionId}`);
    return raw ? (JSON.parse(raw) as CachedGenerate) : null;
  } catch {
    return null;
  }
}

export default function AITemplateReviewPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const tReview = useTranslations('ai_templates.review');

  const templateId = params.id;
  const sessionId = search.get('session') ?? '';

  const [blocks, setBlocks] = React.useState<AIGeneratedBlock[]>([]);
  const [imageSuggestions, setImageSuggestions] = React.useState<
    Record<string, string[]>
  >({});
  const [currentVersion, setCurrentVersion] = React.useState<number>(1);
  const [userInput, setUserInput] = React.useState<
    Record<string, string | number | boolean>
  >({});
  /**
   * BE Q3 currently doesn't return used/limit in the response. Counted
   * client-side from session versions (non-`initial` kinds). After BE
   * adds details.used/limit to 429 we can sync there too.
   */
  const [regenUsed, setRegenUsed] = React.useState<number>(0);
  const [regenLimit, setRegenLimit] =
    React.useState<number>(REGEN_LIMIT_DEFAULT);
  const [loading, setLoading] = React.useState(true);

  const [regenBlock, setRegenBlock] = React.useState<AIGeneratedBlock | null>(
    null
  );
  const [imageBlock, setImageBlock] = React.useState<AIGeneratedBlock | null>(
    null
  );
  const [historyOpen, setHistoryOpen] = React.useState(false);

  // Hydrate from sessionStorage (fresh navigation from /input form) first;
  // fall back to session API (refresh / share link).
  React.useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const cached = loadCache(sessionId);
    if (cached) {
      setBlocks(cached.result.blocks);
      setImageSuggestions(cached.result.image_suggestions ?? {});
      setCurrentVersion(cached.result.version);
      setUserInput(cached.user_input);
      setLoading(false);
      return;
    }

    let cancelled = false;
    rexerApi.aiTemplates
      .session(sessionId)
      .then(s => {
        if (cancelled) return;
        const sorted = s.versions.slice().sort((a, b) => b.version - a.version);
        const latest = sorted[0];
        if (latest) {
          setBlocks(latest.blocks ?? []);
          setImageSuggestions(latest.image_suggestions ?? {});
          setCurrentVersion(latest.version);
        }
        // Count non-initial versions to derive the regen counter (BE Q8).
        setRegenUsed(
          s.versions.filter(v => v.kind && v.kind !== 'initial').length
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(
          err instanceof RxApiError ? err.message || err.code : String(err)
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const updateBlockContent = (
    blockId: string,
    content: Record<string, unknown>
  ) => {
    setBlocks(prev =>
      prev.map(b => (b.block_id === blockId ? { ...b, content } : b))
    );
  };

  const handleRegenResult = (res: AITemplateGenerateResponse) => {
    if (regenBlock) {
      const fresh = res.blocks.find(b => b.block_id === regenBlock.block_id);
      if (fresh) {
        setBlocks(prev =>
          prev.map(b => (b.block_id === fresh.block_id ? fresh : b))
        );
      }
    }
    setImageSuggestions(res.image_suggestions ?? {});
    setCurrentVersion(res.version);
    setRegenUsed(u => u + 1);
  };

  /**
   * BE Q19 (Option A): we don't tell BE about the user's pick — we just
   * store the chosen media_id on the block's `image_media_ids`. When the
   * AI draft is later applied to a canvas, the canvas save flow persists
   * the choice.
   */
  const handleImagePick = (mediaId: string) => {
    if (!imageBlock) return;
    setBlocks(prev =>
      prev.map(b =>
        b.block_id === imageBlock.block_id
          ? { ...b, image_media_ids: [mediaId] }
          : b
      )
    );
  };

  const handleRestoreVersion = (v: AIGenerationVersion) => {
    setBlocks(v.blocks);
    setImageSuggestions(v.image_suggestions ?? {});
    setCurrentVersion(v.version);
    setHistoryOpen(false);
    toast.success(`Đã khôi phục về v${v.version}`);
  };

  const [saving, setSaving] = React.useState(false);

  const handleConfirmSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Phase 1: persist AI draft into user's canvas-templates list. We
      // create a fresh canvas template (is_template=false → user draft),
      // stash the AI payload as `ai_draft` sidecar inside canvas_data so it
      // survives reload. The block-editor schema itself stays empty for now
      // — wiring a proper AI-blocks → block-editor-blocks mapping is a
      // separate task (TODO below).
      const productName = String(userInput.product_name ?? '').trim();
      const name = productName
        ? `AI: ${productName}`
        : `AI draft ${new Date().toLocaleString('vi-VN')}`;

      // BE validates `canvas_data` against the block-editor schema (v2.0)
      // and rejects unknown top-level keys — so we can't stash the raw AI
      // payload as a sidecar there. Stash it client-side under the new
      // canvas id (sessionStorage); the canvas editor (or a future
      // dedicated route) can read it back when mapping AI blocks →
      // block-editor blocks is wired.
      // TODO(canvas mapping): translate `blocks[]` into block-editor Block[]
      // so the canvas editor renders AI content directly.
      // Use the canonical v2.0 wire format via the editor's own
      // serializer — keeps us in sync with BE schema validator (which
      // rejected our legacy `{ version: 1, blocks: [] }` shape).
      const canvas_data = serializeCanvas([]);
      // eslint-disable-next-line no-console
      console.debug('[ai-templates] canvas_data payload', canvas_data);

      const created = await rexerApi.canvasTemplates.create({
        name,
        width: 1200,
        height: 800,
        engine: 'fabric',
        engine_version: '5.3.0',
        canvas_data,
        is_template: false,
      });

      try {
        sessionStorage.setItem(
          `aitpl:draft:${created.id}`,
          JSON.stringify({
            ai_template_id: templateId,
            session_id: sessionId,
            version: currentVersion,
            user_input: userInput,
            blocks,
            image_suggestions: imageSuggestions,
          })
        );
      } catch {
        // Quota / private-mode — silent fallback.
      }
      toast.success(`Đã lưu vào template "${created.name}"`);
      // Route to /template (canvas tab) so the user sees the new entry.
      router.push('/template');
    } catch (err) {
      toast.error(
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lưu thất bại'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!sessionId) {
    return (
      <div className='mx-auto max-w-2xl px-8 py-20 text-center'>
        <h1 className='mb-2 text-lg font-semibold'>Thiếu session</h1>
        <p className='text-muted-foreground text-sm'>
          URL không có session_id. Quay lại danh sách để chọn template lại.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => router.push('/ai-templates')}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader
        title={tReview('title')}
        actions={
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>
              {tReview('regenerate_counter', {
                used: regenUsed,
                limit: regenLimit,
              })}
            </Badge>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setHistoryOpen(true)}
              className='gap-1'
            >
              <Clock className='size-3.5' />
              {tReview('version_history')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(`/ai-templates/${templateId}`)}
              className='gap-1'
            >
              <ChevronLeft className='size-3.5' />
              {tReview('back_to_form')}
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={handleConfirmSave}
              disabled={saving || blocks.length === 0}
              className='gap-1'
            >
              <Save className='size-3.5' />
              {saving ? 'Đang lưu…' : tReview('confirm_save')}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className='flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {blocks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map(b => (
              <BlockReviewCard
                key={b.block_id}
                block={b}
                onContentChange={c => updateBlockContent(b.block_id, c)}
                onRegenerate={() => setRegenBlock(b)}
                onPickImage={
                  b.role === 'image' || b.layout_type === 'mixed'
                    ? () => setImageBlock(b)
                    : undefined
                }
              />
            ))}
        </div>
      )}

      <RegenerateBlockDialog
        open={regenBlock !== null}
        templateId={templateId}
        sessionId={sessionId}
        userInput={userInput}
        block={regenBlock}
        onClose={() => setRegenBlock(null)}
        onResult={handleRegenResult}
        onLimitReached={(used, limit) => {
          // BE Q3 forward-compat: snap to server-authoritative counter.
          if (typeof used === 'number') setRegenUsed(used);
          if (typeof limit === 'number') setRegenLimit(limit);
        }}
      />

      <ImageSuggestionDialog
        open={imageBlock !== null}
        mediaIds={
          imageBlock ? (imageSuggestions[imageBlock.block_id] ?? []) : []
        }
        selectedMediaId={imageBlock?.image_media_ids?.[0] ?? null}
        onClose={() => setImageBlock(null)}
        onPick={handleImagePick}
      />

      <VersionHistoryDrawer
        open={historyOpen}
        sessionId={sessionId}
        currentVersion={currentVersion}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}
