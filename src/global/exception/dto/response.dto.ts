import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExceptionDto } from './exception.dto';

export class ResponseDto<T> {
  @ApiPropertyOptional({ description: 'HTTP 상태 코드', enum: HttpStatus })
  httpStatus?: HttpStatus;

  @ApiProperty({ description: 'API 호출 성공 여부' })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({ description: 'API 호출 성공 시 응답 데이터' })
  @IsOptional()
  data?: T;

  @ApiPropertyOptional({ description: 'API 호출 실패 시 응답 에러' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExceptionDto)
  error?: ExceptionDto;

  constructor(
    httpStatus: HttpStatus,
    success: boolean,
    data?: T,
    error?: ExceptionDto,
  ) {
    this.httpStatus = httpStatus;
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static ok<T>(data?: T): ResponseDto<T> {
    return new ResponseDto(HttpStatus.OK, true, data);
  }

  static created<T>(data?: T): ResponseDto<T> {
    return new ResponseDto(HttpStatus.CREATED, true, data);
  }

  static fail(error: HttpException): ResponseDto<null> {
    return new ResponseDto(
      error.getStatus(),
      false,
      null,
      new ExceptionDto(
        error.getResponse()['error'],
        error.getResponse()['message'],
      ),
    );
  }
}
