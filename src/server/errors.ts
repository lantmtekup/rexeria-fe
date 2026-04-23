import 'server-only';

import { HttpStatus } from '@/settings/enums';
import { ErrorCode } from '@/settings/enums';

export { ErrorCode };

export type HttpExceptionOptions = {
  /** Log / `Error.message` only — not sent to client as primary i18n text. */
  logMessage?: string;
  /** Machine-readable extra context (field errors, limits, etc.). */
  details?: unknown;
};

export class HttpException extends Error {
  readonly status: HttpStatus;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    status: HttpStatus,
    code: ErrorCode,
    options?: HttpExceptionOptions
  ) {
    super(options?.logMessage ?? code);
    this.name = 'HttpException';
    this.status = status;
    this.code = code;
    this.details = options?.details;
  }

  static fail(
    status: HttpStatus,
    code: ErrorCode,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(status, code, options);
  }

  static badRequest(
    code: ErrorCode = ErrorCode.BAD_REQUEST,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.BAD_REQUEST, code, options);
  }

  static validationError(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      options
    );
  }

  static invalidId(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_ID,
      options
    );
  }

  static unauthorized(
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.UNAUTHORIZED, code, options);
  }

  static tokenExpired(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      options
    );
  }

  static tokenInvalid(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.TOKEN_INVALID,
      options
    );
  }

  static forbidden(
    code: ErrorCode = ErrorCode.FORBIDDEN,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.FORBIDDEN, code, options);
  }

  static notFound(
    code: ErrorCode = ErrorCode.NOT_FOUND,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.NOT_FOUND, code, options);
  }

  static alreadyExists(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.CONFLICT,
      ErrorCode.ALREADY_EXISTS,
      options
    );
  }

  static conflict(
    code: ErrorCode = ErrorCode.ALREADY_EXISTS,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.CONFLICT, code, options);
  }

  static tooManyRequests(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCode.TOO_MANY_REQUESTS,
      options
    );
  }

  static serviceUnavailable(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.SERVICE_UNAVAILABLE,
      options
    );
  }

  static badGateway(
    code: ErrorCode = ErrorCode.BAD_GATEWAY,
    options?: HttpExceptionOptions
  ) {
    return new HttpException(HttpStatus.BAD_GATEWAY, code, options);
  }

  static internal(options?: HttpExceptionOptions) {
    return new HttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      options
    );
  }
}
