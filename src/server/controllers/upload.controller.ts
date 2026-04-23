import 'server-only';

import type { NextRequest } from 'next/server';

import { sendError, sendSuccess } from '@/server/response';
import { uploadService } from '@/server/services/upload.service';

export const uploadController = {
  async post(request: NextRequest) {
    try {
      const data = await uploadService.processMultipartUpload(request);
      return sendSuccess(data);
    } catch (err) {
      return sendError(err);
    }
  },
};
