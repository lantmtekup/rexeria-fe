'use client';

import * as React from 'react';

import { rexerApi } from './endpoints';
import type {
  BindMediaItem,
  BindProductMediaItem,
  MediaAsset,
  ProductMediaBinding,
  ProjectMediaBinding,
} from './types';

type AnyBinding = ProjectMediaBinding | ProductMediaBinding;

export type BindTarget =
  | { kind: 'project'; projectId: string }
  | { kind: 'product'; productId: string };

export interface UploadAndBindOptions {
  /** Where to bind the uploaded asset — landing project or product. */
  target: BindTarget;
  /**
   * `field_key` (and optional `slot_key`) used in the bind request.
   * Default: `gallery` / undefined — fine for galleries; pass explicit
   * keys for hero/logo/etc.
   */
  fieldKey?: string;
  slotKey?: string;
  /**
   * V2: link product binding to a `Product.colors[].name`. Only meaningful
   * for `target.kind === 'product'`. Lets the canvas color-swatch UI swap
   * images per color.
   */
  colorName?: string;
  /** V2: ordering within the same `(field_key, color_name)` group. */
  sortOrder?: number;
  /**
   * Owner scope. `library` keeps the asset reusable; `project` scopes it
   * to the landing. Default `library`.
   */
  ownerScope?: 'project' | 'library';
}

export interface UploadAndBindResult {
  asset: MediaAsset;
  binding: AnyBinding;
}

export interface UploadAndBindHook {
  uploadAndBind: (file: File) => Promise<UploadAndBindResult>;
  uploading: boolean;
  /** 0–100 — only useful for the raw PUT step. */
  progress: number;
  error: Error | null;
}

/**
 * Three-step BE upload flow + bind to project, packaged as a single call.
 *
 *   1. POST /v1/media/uploads/init        → upload_id + (optional) presigned_url
 *   2. PUT  /v1/media/uploads/{id}/raw    → upload bytes (proxy or presigned)
 *   3. POST /v1/media/uploads/complete    → MediaAsset
 *   4. POST /v1/projects/{id}/media/bind  → ProjectMediaBinding
 *
 * This is the canonical way to attach assets to a landing — without step 4 the
 * media exists in the library but doesn't render in the published page.
 */
export function useUploadAndBind({
  target,
  fieldKey = 'gallery',
  slotKey,
  colorName,
  sortOrder,
  ownerScope = 'library',
}: UploadAndBindOptions): UploadAndBindHook {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<Error | null>(null);

  const uploadAndBind = React.useCallback(
    async (file: File): Promise<UploadAndBindResult> => {
      setUploading(true);
      setError(null);
      setProgress(0);
      try {
        // 1) init — only project owner_scope passes a project_id; product
        // bindings still upload to the library scope first.
        const projectIdForOwner =
          target.kind === 'project' && ownerScope === 'project'
            ? target.projectId
            : undefined;
        const init = await rexerApi.media.initUpload({
          filename: file.name,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          owner_scope: ownerScope,
          media_type: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
              ? 'video'
              : 'file',
          project_id: projectIdForOwner,
        });
        setProgress(20);

        // 2) raw upload — PUT bytes to presigned URL when BE returns one,
        // otherwise fall back to the proxied endpoint.
        // BUG-01 (BE leaking `localhost:9090`) was closed 2026-04-27 — BE
        // now returns S3 URLs directly, so the localhost guard is gone.
        if (init.presigned_url) {
          const res = await fetch(init.presigned_url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });
          if (!res.ok) {
            throw new Error(`Storage upload failed: ${res.status}`);
          }
        } else {
          await rexerApi.media.uploadRaw(init.upload_id, file);
        }
        setProgress(70);

        // 3) complete
        const completed = await rexerApi.media.completeUpload({
          upload_id: init.upload_id,
        });
        setProgress(90);

        // 4) bind — to project or product
        let binding: AnyBinding | undefined;
        if (target.kind === 'project') {
          const item: BindMediaItem = {
            field_key: fieldKey,
            media_id: completed.media_asset.id,
            slot_key: slotKey,
          };
          const bind = await rexerApi.media.bindToProject(target.projectId, {
            items: [item],
          });
          binding = bind.bindings[0];
        } else {
          const item: BindProductMediaItem = {
            field_key: fieldKey,
            media_id: completed.media_asset.id,
            slot_key: slotKey,
            ...(colorName ? { color_name: colorName } : {}),
            ...(typeof sortOrder === 'number' ? { sort_order: sortOrder } : {}),
          };
          const bind = await rexerApi.products.bindMedia(target.productId, {
            items: [item],
          });
          binding = bind.bindings[0];
        }
        setProgress(100);

        if (!binding) {
          throw new Error('Bind succeeded but no binding returned');
        }
        return { asset: completed.media_asset, binding };
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setUploading(false);
      }
    },
    [target, fieldKey, slotKey, colorName, sortOrder, ownerScope]
  );

  return { uploadAndBind, uploading, progress, error };
}
