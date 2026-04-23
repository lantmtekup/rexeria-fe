import { healthController } from '@/server/controllers/health.controller';

export const GET = () => healthController.get();
