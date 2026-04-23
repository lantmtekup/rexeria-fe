/**
 * BFF JSON contract for `src/app/api/**` Route Handlers.
 * External REST calls use `fetchInstance` + `NEXT_PUBLIC_API_URL`.
 */
import 'server-only';
import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

import { HttpException, ErrorCode } from './errors';
import { HttpStatus } from '@/settings/enums';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginationMeta,
} from '@/types/api';

export type { ApiErrorResponse, ApiSuccessResponse, PaginationMeta };

export const sendSuccess = <T>(
  data: T,
  message?: string,
  options?: {
    status?: HttpStatus;
    pagination?: PaginationMeta;
  }
): NextResponse<ApiSuccessResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      ...(options?.pagination && { pagination: options.pagination }),
    },
    { status: options?.status || HttpStatus.OK }
  );
};

export const sendError = (error: unknown): NextResponse<ApiErrorResponse> => {
  // eslint-disable-next-line no-console
  console.error('[API Error]', error);

  if (error instanceof HttpException) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      success: false,
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  );
};

export const sendZodError = (
  zodError: ZodError
): NextResponse<ApiErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      details: zodError.flatten(),
    },
    { status: HttpStatus.BAD_REQUEST }
  );
};

export const sendValidationError = (
  details: unknown
): NextResponse<ApiErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      details,
    },
    { status: HttpStatus.BAD_REQUEST }
  );
};
