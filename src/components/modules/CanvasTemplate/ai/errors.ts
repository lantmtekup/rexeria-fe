/**
 * Helpers to parse AI Template error envelopes (`docs/be-ai-template-questions.md`).
 *
 * BE currently surfaces business codes via `RxApiError.code` only. Per the
 * agreed P0 patches (Q2 + Q3), BE will add `details.missing_fields[]` to
 * `ERR_AI_TEMPLATE_MISSING_REQUIRED` and `details.{used,limit}` to
 * `ERR_AI_TEMPLATE_REGEN_LIMIT`. The helpers below are forward-compatible:
 * they read those fields when present and return `undefined` otherwise so
 * the UI can fall back to plain messages without breaking.
 */

import { RxApiError } from '@/services/rexer/client';

export interface ParsedMissingRequired {
  code: 'ERR_AI_TEMPLATE_MISSING_REQUIRED';
  message: string;
  missing_fields?: string[];
}

export interface ParsedRegenLimit {
  code: 'ERR_AI_TEMPLATE_REGEN_LIMIT';
  message: string;
  used?: number;
  limit?: number;
}

export interface ParsedGeneric {
  code: string;
  message: string;
}

export type ParsedAITemplateError =
  | ParsedMissingRequired
  | ParsedRegenLimit
  | ParsedGeneric;

export function parseAITemplateError(err: unknown): ParsedAITemplateError {
  if (!(err instanceof RxApiError)) {
    return {
      code: 'UNKNOWN',
      message: err instanceof Error ? err.message : String(err ?? 'Unknown'),
    };
  }
  const details = (err.details ?? {}) as Record<string, unknown>;

  if (err.code === 'ERR_AI_TEMPLATE_MISSING_REQUIRED') {
    const raw = details.missing_fields;
    const missing_fields = Array.isArray(raw)
      ? raw.filter((x): x is string => typeof x === 'string')
      : undefined;
    return {
      code: 'ERR_AI_TEMPLATE_MISSING_REQUIRED',
      message: err.message || err.code,
      missing_fields,
    };
  }
  if (err.code === 'ERR_AI_TEMPLATE_REGEN_LIMIT') {
    const used = typeof details.used === 'number' ? details.used : undefined;
    const limit = typeof details.limit === 'number' ? details.limit : undefined;
    return {
      code: 'ERR_AI_TEMPLATE_REGEN_LIMIT',
      message: err.message || err.code,
      used,
      limit,
    };
  }
  return { code: err.code, message: err.message || err.code };
}
