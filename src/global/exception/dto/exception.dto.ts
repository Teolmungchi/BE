import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode, getHttpStatus } from '../error-code';

export class ExceptionDto {
  @ApiProperty({
    example: 'INVALID_PARAMETER_FORMAT',
    description: '에러 코드',
  })
  errorCode: HttpStatus;

  @ApiProperty({
    example: 'Invalid parameter format',
    description: '에러 메시지',
  })
  errorMessage: string;

  constructor(errorCode: HttpStatus, errorMessage: string) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  static of(errorCode: ErrorCode): ExceptionDto {
    return new ExceptionDto(getHttpStatus(errorCode), errorCode);
  }
}
