import { HttpException } from '@nestjs/common';
import { ErrorCode, getHttpStatus } from './error-code';

export class CommonException extends HttpException {
  constructor(private readonly errorCode: ErrorCode) {
    super(errorCode, getHttpStatus(errorCode));
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}
