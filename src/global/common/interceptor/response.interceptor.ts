import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseDto} from '../../exception/dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((body) => {
        const response = context.switchToHttp().getResponse();
        if (body instanceof ResponseDto) {
          response.status(body.httpStatus);
        }
        return body;
      }),
    );
  }
}