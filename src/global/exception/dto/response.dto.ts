import { Exclude, Type } from 'class-transformer';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { isBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ValidationException } from 'aws-sdk/clients/bedrockruntime';

export class ResponseDto<T> {
  @Exclude()
  httpStatus?: HttpStatus;

  @ApiProperty({ description: 'API 호출 성공 여부' })
  @isBoolean()
  success: boolean;

  @ApiPropertyOptional({ description: 'API 호출 성공 시 응답 데이터'})
  @IsOptional()
  data?: T;

  @ApiPropertyOptional({ description: 'API 호출 실패 시 응답 에러' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExceptionDto)
  error?: ExceptionDto = null;

  constructor(
    httpStatus: HttpStatus,
    success: boolean,
    data?: T,
    error?: ExceptionDto,
  ) {
    this.httpStatus = httpStatus;
    this.success = success;
    this.data = data;
    this.error = error === undefined ? null : error;
  }

  static ok<T>(data?: T): ResponseDto<T> {
    return new ResponseDto(HttpStatus.OK, true, data);
  }

  static created<T>(data: T): ResponseDto<T> {
    return new ResponseDto(HttpStatus.CREATED, true, data);
  }

  static commonFail(error: CommonException): ResponseDto<null> {
    return new ResponseDto(
      error.getStatus(),
      false,
      null,
      ExceptionDto.of(error.errorCode),
    );
  }

  static validationFail(error: ValidationException): ResponseDto<null> {
    return new ResponseDto(
      error.getStatus(),
      false,
      null,
      ExceptionDto.of(error.errorCode),
    );
  }

  static unAuthorizationFail(error: UnauthorizedException): ResponseDto<null> {
    return new ResponseDto(
      error.getStatus(),
      false,
      null,
      ExceptionDto.of(error.errorCode),
    );
  }

  static httpFail(error: HttpException): ResponseDto<null> {
    return ResponseDto(
      error.getStatus(),
      false,
      null,
      ExceptionDto.of
    )
  }
}