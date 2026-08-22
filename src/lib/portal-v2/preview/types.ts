/**
 * The shopper-view preview contract.
 *
 * `ExchangePreviewShell` and its rail were originally typed against
 * `ExchangeListingView`, but they only ever read six fields off it. Narrowing
 * to this shape lets any portal-v2 module drive the same preview without
 * synthesising a fake catalog listing (price, coverage, gradients and all).
 *
 * `ExchangeListingView` satisfies it structurally except for `kindLabel` and
 * `evidence`, which its call site supplies.
 */
export type PreviewItem = {
  id: string;
  name: string;
  /**
   * Which stage renders: `/p/{slug}`, `/embed/block/{blockId}`,
   * `/rexer/ads/{adFormatId}`, or — for `'live'` — a stage the host supplies
   * via `ExchangePreviewShell.renderStage`.
   * `'live'` exists for the canvas editor, whose content is unsaved state with
   * no URL to point an iframe at.
   */
  source: 'page' | 'block' | 'live' | 'ad';
  slug?: string;
  blockId?: string;
  /** Với `'ad'`: id định dạng, iframe vào `/rexer/ads/{id}`. */
  adFormatId?: string;
  /** Already-translated noun for the header sub-line ("Experiences"/"Blocks"). */
  kindLabel?: string;
  /** Drives the rail's Measured panel. Omit or null to hide it. */
  evidence?: PreviewEvidence | null;
};

export type PreviewEvidence = {
  sessions: number;
  /** Signed fraction — 0.18 renders as +18%. */
  lift: number;
};
