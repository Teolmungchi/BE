// import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, UnauthorizedException } from '@nestjs/common';
// import { instanceToPlain } from 'class-transformer';
//
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//
//     let responseDto: ResponseDto<null>;
//
//     if(exception instanceof CommonException){ // 직접 정의한 예외
//       Logger.error('ExceptionFilter catch CommonException : ' + exception.message);
//     } else if(exception instanceof ValidationException) { // 유효성 검사 예외
//       Logger.error("ExceptionFilter catch ValidationException : '" + exception.message);
//     } else if (exception instanceof UnauthorizedException) { //인증 예외
//       Logger.error("ExceptionFilter catch UnauthorizedException : '" + exception.message);
//     } else {
//       Logger.error("ExceptionFilter catch Exception : '" + exception.message);
//       responseDto = ResponseDto.httpFail(exception);
//     }
//     response.status(responseDto.httpStatus).json(instanceToPlain(responseDto));
//   }
// }