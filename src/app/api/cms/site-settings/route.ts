import { NextRequest } from 'next/server';

import { siteSettingsController } from '@/server/controllers/siteSettings.controller';

export const runtime = 'nodejs';

export const PUT = (req: NextRequest) => siteSettingsController.put(req);
