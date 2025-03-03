import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let error: {
      error: string;
      statusCode: number;
      message: string | string[];
    } = {
      error: 'Internal Server Error',
      statusCode: status,
      message: 'An unexpected error occurred',
    };

    if (typeof errorResponse === 'string') {
      error = {
        error: errorResponse,
        statusCode: status,
        message: errorResponse,
      };
    } else if (typeof errorResponse === 'object') {
      error = errorResponse as {
        error: string;
        statusCode: number;
        message: string | string[];
      };
    }

    response.status(status).json({
      success: false,
      ...error,
    });
  }
}
