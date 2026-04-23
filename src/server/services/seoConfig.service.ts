import 'server-only';

import { connectDB } from '@/lib/mongodb';
import { SeoConfigModel, type SeoConfigDoc } from '@/models/SeoConfig';

export type PublicSiteSettings = {
  title: string | null;
  description: string | null;
  logoUrl: string | null;
};

export const seoConfigService = {
  async getSeoConfig(): Promise<SeoConfigDoc | null> {
    await connectDB();
    const doc = await SeoConfigModel.findOne({
      isDeleted: { $ne: true },
    }).lean();
    return doc as SeoConfigDoc | null;
  },

  async getPublicSiteSettings(
    locale: 'vi' | 'en'
  ): Promise<PublicSiteSettings> {
    await connectDB();
    const doc = await SeoConfigModel.findOne({
      isDeleted: { $ne: true },
    }).lean();
    if (!doc) {
      return { title: null, description: null, logoUrl: null };
    }
    const d = doc as SeoConfigDoc;
    return {
      title: d.title[locale] ?? null,
      description: d.description[locale] ?? null,
      logoUrl: d.logoUrl ?? null,
    };
  },

  async upsertSiteBranding(input: {
    appName: string;
    description: string;
    logoUrl?: string;
  }): Promise<void> {
    await connectDB();
    const appName = input.appName.trim();
    const description = input.description.trim();

    const existing = await SeoConfigModel.findOne({
      isDeleted: { $ne: true },
    });

    if (!existing) {
      await SeoConfigModel.create({
        title: { vi: appName, en: appName },
        description: { vi: description, en: description },
        keywords: '',
        logoUrl:
          input.logoUrl !== undefined && input.logoUrl.trim() !== ''
            ? input.logoUrl.trim()
            : undefined,
      });
      return;
    }

    existing.title = { vi: appName, en: appName };
    existing.description = { vi: description, en: description };
    if (input.logoUrl !== undefined) {
      existing.logoUrl = input.logoUrl.trim() || undefined;
    }
    await existing.save();
  },
};
