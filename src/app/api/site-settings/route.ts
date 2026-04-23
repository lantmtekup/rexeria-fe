import { NextRequest } from 'next/server';

import { siteSettingsController } from '@/server/controllers/siteSettings.controller';

export const runtime = 'nodejs';

export const GET = (req: NextRequest) => siteSettingsController.get(req);
