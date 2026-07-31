import type { Device, Lang } from '@/components/modules/block-editor/types';

/**
 * Host ⇄ iframe contract for the LIVE canvas preview (`/embed/canvas`).
 *
 * The shopper-view shell renders every stage in an iframe sized to the device
 * viewport, so `100vh` inside the frame means the frame — and, crucially, so
 * sticky / pinned / scrubbed blocks keep working: the stage scales the frame
 * with `transform: scale()`, which breaks pinning when the blocks render in the
 * host document (see `DevicePreviewFrame`).
 *
 * The editor's canvas has no URL to point an iframe at — it is unsaved, live
 * state. So instead of a slug the host hands the blueprint over the wire:
 *
 *   iframe → host  `HELLO`    "mounted, send me a canvas"
 *   host   → iframe `PAYLOAD`  serialized blueprint + lang/device/transition
 *   iframe → host  `READY`     "parsed and painted, drop your overlay"
 *
 * Same-origin only — both sides check `event.origin` against their own origin.
 */

export const LIVE_CANVAS_EMBED_PATH = '/embed/canvas';

/** iframe → host: mounted and listening. */
export const LIVE_CANVAS_HELLO = 'rexer-live-canvas-hello';
/** host → iframe: here is the canvas to render. */
export const LIVE_CANVAS_PAYLOAD = 'rexer-live-canvas';
/** iframe → host: canvas parsed + painted. */
export const LIVE_CANVAS_READY = 'rexer-live-canvas-ready';

export type LiveCanvasPayload = {
  type: typeof LIVE_CANVAS_PAYLOAD;
  /** Echoed back with `READY` so a stale frame can't clear a fresh overlay. */
  token: string;
  /** `serializeCanvasPages(...)` output — parsed by `parseCanvas` in the frame. */
  blueprint: Record<string, unknown>;
  lang: Lang;
  device: Device;
  /** Template-level transition preset (`none`/`fade`/…). */
  transition?: string;
};

export type LiveCanvasHello = { type: typeof LIVE_CANVAS_HELLO };

export type LiveCanvasReady = {
  type: typeof LIVE_CANVAS_READY;
  token: string;
};
