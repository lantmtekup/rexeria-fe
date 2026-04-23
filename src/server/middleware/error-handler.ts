import 'server-only';
import { NextRequest } from 'next/server';

import { sendError } from '@/server/response';
import { HttpException } from '@/server/errors';
import { ErrorCode } from '@/settings/enums';

interface MongoError {
  code?: number;
  name?: string;
  message?: string;
}

type NextRequestHandler = (
  request: NextRequest,
  ...args: string[]
) => Promise<Response>;

export function withErrorHandler(
  handler: NextRequestHandler
): NextRequestHandler {
  return async (request: NextRequest, ...args: string[]) => {
    try {
      return await handler(request, ...args);
    } catch (error: unknown) {
      const mongoError = error as MongoError;

      if (mongoError.code === 11000) {
        return sendError(
          HttpException.conflict(ErrorCode.DUPLICATE_ENTRY, {
            logMessage: mongoError.message,
          })
        );
      }

      if (mongoError.name === 'CastError') {
        return sendError(
          HttpException.invalidId({
            logMessage: mongoError.message,
          })
        );
      }

      if (mongoError.name === 'ValidationError') {
        return sendError(
          HttpException.validationError({
            logMessage: mongoError.message,
          })
        );
      }

      if (error instanceof HttpException) {
        return sendError(error);
      }

      return sendError(HttpException.internal());
    }
  };
}
