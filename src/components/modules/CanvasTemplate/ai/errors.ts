/**
 * Helpers to parse AI Template error envelopes (`docs/be-ai-template-questions.md`).
 *
 * BE has shipped patches Q2 + Q3 — `ERR_AI_TEMPLATE_MISSING_REQUIRED` now
 * carries `details.missing_fields[]` (raw field_key list) and
 * `ERR_AI_TEMPLATE_REGEN_LIMIT` carries `details.{used, limit}`. We still
 * tolerate the absence of these fields so legacy / replayed responses don't
 * crash the UI, but the populated path is now the BE contract.
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
