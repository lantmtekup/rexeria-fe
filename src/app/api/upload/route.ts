import type { NextRequest } from 'next/server';

import { uploadController } from '@/server/controllers/upload.controller';

export const runtime = 'nodejs';

export const POST = (request: NextRequest) => uploadController.post(request);
