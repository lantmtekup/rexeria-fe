export interface ClientApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[];
}

export interface LocalizedText {
  en: string;
  vi: string;
}

export const LocalizedTextSchema = {
  vi: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

export type ResolveLocalizedText<T> = T extends LocalizedText
  ? string
  : T extends Array<infer Item>
    ? Array<ResolveLocalizedText<Item>>
    : T extends object
      ? { [K in keyof T]: ResolveLocalizedText<T[K]> }
      : T;
