'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { newShareToken, type PublishMeta } from '../serialize';

/**
 * Publish meta + share-token operations. The hook owns state and exposes
 * imperative ops; the caller pairs them with autosave flushes so the new
 * share URL becomes live immediately after toggle/rotate.
 */
export interface UsePublishStateApi {
  publish: PublishMeta | undefined;
  /** Replace publish meta entirely (e.g. on initial load). */
  setPublish: (next: PublishMeta | undefined) => void;
  /** Toggle published flag. Caller flushes save after. */
  togglePublish: () => PublishMeta | undefined;
  /** Rotate share token. Caller flushes save after. No-op when not published. */
  rotateShareToken: () => PublishMeta | undefined;
}

export function usePublishState(initial?: PublishMeta): UsePublishStateApi {
  const [publish, setPublish] = React.useState<PublishMeta | undefined>(
    initial
  );

  const togglePublish = React.useCallback((): PublishMeta | undefined => {
    let next: PublishMeta | undefined;
    setPublish(prev => {
      next = prev?.published
        ? { ...prev, published: false }
        : {
            published: true,
            shareToken: prev?.shareToken ?? newShareToken(),
            publishedAt: new Date().toISOString(),
          };
      return next;
    });
    if (next) {
      toast.success(
        next.published
          ? 'Đã xuất bản — link sẵn sàng chia sẻ'
          : 'Đã ngưng xuất bản'
      );
    }
    return next;
  }, []);

  const rotateShareToken = React.useCallback((): PublishMeta | undefined => {
    let next: PublishMeta | undefined;
    setPublish(prev => {
      if (!prev?.published) return prev;
      next = {
        ...prev,
        shareToken: newShareToken(),
        publishedAt: new Date().toISOString(),
      };
      return next;
    });
    if (next) {
      toast.success('Đã đổi link chia sẻ — link cũ không còn dùng được');
    }
    return next;
  }, []);

  return { publish, setPublish, togglePublish, rotateShareToken };
}
