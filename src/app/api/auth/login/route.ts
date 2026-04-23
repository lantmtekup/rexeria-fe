import { NextRequest } from 'next/server';

import { authController } from '@/server/controllers/auth.controller';

export const runtime = 'nodejs';

export const POST = (req: NextRequest) => authController.login(req);
