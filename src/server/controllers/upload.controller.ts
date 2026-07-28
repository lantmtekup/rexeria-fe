import 'server-only';

import type { NextRequest } from 'next/server';

import { verifyJwtFromRequest } from '@/server/auth/session';
import { HttpException } from '@/server/errors';
import { sendError, sendSuccess } from '@/server/response';
import { uploadService } from '@/server/services/upload.service';
import { ErrorCode } from '@/settings/enums';

// `/api/*` nằm ngoài middleware matcher → route này phải tự authorize.
// Chấp nhận: session cookie hợp lệ (uploader trong app) HOẶC header
// `x-upload-secret` khớp secret (machine caller). Secret rỗng = KHÔNG bypass.
const isAuthorized = async (request: NextRequest): Promise<boolean> => {
  const payload = await verifyJwtFromRequest(request);
  if (payload?.sub) return true;
  const secret = process.env.UPLOAD_API_SECRET?.trim();
  return Boolean(secret) && request.headers.get('x-upload-secret') === secret;
};

export const uploadController = {
  async post(request: NextRequest) {
    try {
      if (!(await isAuthorized(request))) {
        throw HttpException.unauthorized(ErrorCode.UPLOAD_UNAUTHORIZED);
      }
      const data = await uploadService.processMultipartUpload(request);
      return sendSuccess(data);
    } catch (err) {
      return sendError(err);
    }
  },
};
