import 'server-only';

import { connectDB } from '@/lib/mongodb';
import { sendSuccess } from '@/server/response';
import type { HealthApiData } from '@/types/api';

export const healthController = {
  async get() {
    let database: 'ok' | 'error' = 'error';
    try {
      await connectDB();
      database = 'ok';
    } catch {
      database = 'error';
    }

    const data: HealthApiData = {
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      database,
    };
    return sendSuccess(data);
  },
};
