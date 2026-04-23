import 'server-only';

import { NextRequest } from 'next/server';

import { verifyJwtFromRequest } from '@/server/auth/session';
import { HttpException } from '@/server/errors';
import { sendError, sendSuccess, sendZodError } from '@/server/response';
import { seoConfigService } from '@/server/services/seoConfig.service';
import { siteSettingsPutSchema } from '@/server/validation/siteSettings';
import { ErrorCode } from '@/settings/enums';

export const siteSettingsController = {
  async get(req: NextRequest) {
    try {
      const locale =
        req.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'vi';
      const data = await seoConfigService.getPublicSiteSettings(locale);
      return sendSuccess(data);
    } catch (err) {
      return sendError(err);
    }
  },

  async put(req: NextRequest) {
    try {
      const payload = await verifyJwtFromRequest(req);
      if (!payload?.sub) {
        throw HttpException.unauthorized(ErrorCode.UNAUTHORIZED);
      }

      const raw = await req.json();
      const parsed = siteSettingsPutSchema.safeParse(raw);
      if (!parsed.success) {
        return sendZodError(parsed.error);
      }

      await seoConfigService.upsertSiteBranding(parsed.data);
      return sendSuccess(null, 'Đã lưu cài đặt');
    } catch (err) {
      return sendError(err);
    }
  },
};
