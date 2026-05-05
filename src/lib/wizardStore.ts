'use client';

/**
 * AI-Agents wizard state — persisted in sessionStorage so navigating between
 * the 4 steps (Product → Template → Marketing → Campaign) doesn't lose data
 * already entered. Scoped per `productId` so multiple agents don't collide.
 *
 * BE has no first-class "wizard run" or "marketing" entity yet, so on Launch
 * we serialize this state into `campaign.notes` as JSON metadata. Campaign
 * detail page reads it back to restore the picked template + brief.
 */

export type TemplateKind = 'canvas' | 'legacy';

export interface WizardState {
  /** Picked at step 02. Either a canvas_template.id or templates.id. */
  template_id?: string;
  template_kind?: TemplateKind;
  /** Display label for the picked template — used to render in campaign detail
   *  without re-fetching. */
  template_name?: string;
  /** Goal text the user typed into AI scoring at step 02. */
  template_goal?: string;
  /** Step 03 marketing brief — free text. */
  marketing_brief?: string;
  updated_at?: string;
}

const KEY_PREFIX = 'rexer:wizard:';

function key(productId: string) {
  return KEY_PREFIX + productId;
}

export function readWizardState(productId: string): WizardState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(key(productId));
    if (!raw) return {};
    return JSON.parse(raw) as WizardState;
  } catch {
    return {};
  }
}

export function writeWizardState(
  productId: string,
  patch: Partial<WizardState>
): WizardState {
  if (typeof window === 'undefined') return patch;
  const prev = readWizardState(productId);
  const next: WizardState = {
    ...prev,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(key(productId), JSON.stringify(next));
  } catch {
    // Quota or disabled storage — fail silently, wizard still works in-memory
  }
  return next;
}

export function clearWizardState(productId: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key(productId));
  } catch {
    // ignore
  }
}

const NOTES_PREFIX = '@@rexer-wizard:';

/**
 * Embed wizard metadata into `campaign.notes` as a tagged JSON line so the
 * detail page can recover it. User-typed notes are preserved on a separate
 * line below the metadata header.
 */
export function packNotes(meta: WizardState, userNotes?: string): string {
  const json = JSON.stringify(meta);
  const header = `${NOTES_PREFIX}${json}`;
  const body = (userNotes ?? '').trim();
  return body ? `${header}\n\n${body}` : header;
}

export function unpackNotes(notes?: string): {
  meta: WizardState;
  userNotes: string;
} {
  const text = notes ?? '';
  if (!text.startsWith(NOTES_PREFIX)) return { meta: {}, userNotes: text };
  const newline = text.indexOf('\n');
  const headerEnd = newline === -1 ? text.length : newline;
  const headerJson = text.slice(NOTES_PREFIX.length, headerEnd);
  let meta: WizardState = {};
  try {
    meta = JSON.parse(headerJson) as WizardState;
  } catch {
    return { meta: {}, userNotes: text };
  }
  const userNotes = newline === -1 ? '' : text.slice(newline + 1).trimStart();
  return { meta, userNotes };
}
