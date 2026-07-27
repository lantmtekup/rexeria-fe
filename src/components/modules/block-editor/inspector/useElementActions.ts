'use client';

import { toast } from 'sonner';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIBlockType } from '@/services/rexer/types';

import { DELVAUX_HERO_FRAMES } from '../blocks/_registry/defs/delvauxHeroFrames';
import { buildAiPrompt } from '../buildAiPrompt';
import { getContentAt, setContentAt } from '../contentPath';
import type { ElementKind } from '../resolveElementKind';
import type { Block, BlockBackground, BlockContent, Lang } from '../types';
import { writeTextField } from './textField';

interface UseElementActionsArgs {
  block: Block;
  lang: Lang;
  /** Content for the variant currently being edited. */
  content: BlockContent;
  selectedKey: string;
  kind: ElementKind;
  label: string;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  onResetStyle: () => void;
  onClose: () => void;
}

export interface ElementActions {
  runAi: (prompt: string) => Promise<void>;
  deleteContent: () => void;
}

/**
 * Element-scoped AI generation and delete, shared by the floating selection
 * toolbar and the inspector. Extracted from `ElementToolbar` so the two
 * surfaces can never drift on the PNJ legacy-shape handling.
 */
export function useElementActions({
  block,
  lang,
  content,
  selectedKey,
  kind,
  label,
  onContentChange,
  onUpdateBackground,
  onResetStyle,
  onClose,
}: UseElementActionsArgs): ElementActions {
  const deleteContent = () => {
    const c = content as Record<string, unknown>;

    if (kind === 'background') {
      onUpdateBackground(undefined);
      toast.success('Đã xoá nền');
      onClose();
      return;
    }

    if (!window.confirm(`Xoá nội dung "${label}"?`)) return;

    if (kind === 'pnjFrames') {
      const next = { ...c };
      delete next.frames;
      onContentChange(next as BlockContent);
      toast.success('Đã reset frame sequence về mặc định PNJ');
      onClose();
      return;
    }

    if (kind === 'delvauxFrames') {
      onContentChange({
        ...c,
        frameUrls: [...DELVAUX_HERO_FRAMES],
        frameCount: DELVAUX_HERO_FRAMES.length,
        frameUrlPattern: '',
      } as BlockContent);
      toast.success('Đã reset chuỗi frame về mặc định Delvaux');
      onClose();
      return;
    }

    if (kind === 'pnjScrim') {
      const next = { ...c };
      delete next.scrim;
      onContentChange(next as BlockContent);
      toast.success('Đã reset lớp mờ về mặc định PNJ');
      onClose();
      return;
    }

    if (kind === 'text' || kind === 'image' || kind === 'link') {
      writeTextField(selectedKey, '', onContentChange);
    } else {
      onContentChange(setContentAt(c, selectedKey, []) as BlockContent);
    }

    if (kind === 'text') onResetStyle();
    toast.success(`Đã xoá ${label.toLowerCase()}`);
    onClose();
  };

  const runAi = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Nhập mô tả trước khi tạo nội dung AI');
      return;
    }
    try {
      const richPrompt = buildAiPrompt({
        userPrompt: prompt.trim(),
        blockType: block.blockType,
        blockName: block.name,
        selectedField: selectedKey,
        currentContent: content,
        lang,
      });

      const res = await rexerApi.ai.blockContent({
        block_type: block.blockType as AIBlockType,
        prompt: richPrompt,
        lang,
        current_content: content as Record<string, unknown>,
        selected_field: selectedKey,
        block_name: block.name,
      });

      const next = getContentAt(
        res.content as Record<string, unknown>,
        selectedKey
      );
      if (next === undefined) {
        toast.error('AI không trả về trường này');
        return;
      }

      if (typeof next === 'string') {
        writeTextField(selectedKey, next, onContentChange);
      } else {
        onContentChange(
          setContentAt(
            content as Record<string, unknown>,
            selectedKey,
            next
          ) as BlockContent
        );
      }

      toast.success(
        res.source === 'ai'
          ? `AI đã đề xuất ${label}`
          : `Đã dùng nội dung mẫu cho ${label}`
      );
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`AI thất bại: ${msg}`);
    }
  };

  return { runAi, deleteContent };
}
