import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';

/**
 * Shown while the canvas route segment loads. Deliberately the same component
 * `CanvasEditor` renders while it resolves the target, so the boot bar carries
 * straight through instead of restarting when the segment hands over.
 */
export default function Loading() {
  return <PreviewStageLoading className='h-full' label='Đang mở canvas' />;
}
