import { Schema, type Types } from 'mongoose';

import { getOrCreateModel } from '@/models/registry';
import type { LocalizedText } from '@/types/common';

export interface SeoConfigDoc {
  _id: Types.ObjectId;
  title: LocalizedText;
  description: LocalizedText;
  keywords: string;
  ogImageUrl?: string;
  logoUrl?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const seoConfigSchema = new Schema<SeoConfigDoc>(
  {
    title: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    keywords: { type: String, default: '', trim: true },
    ogImageUrl: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const SeoConfigModel = getOrCreateModel<SeoConfigDoc>(
  'SeoConfig',
  seoConfigSchema
);
