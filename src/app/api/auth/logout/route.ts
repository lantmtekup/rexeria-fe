import { authController } from '@/server/controllers/auth.controller';

export const runtime = 'nodejs';

export const POST = () => authController.logout();
