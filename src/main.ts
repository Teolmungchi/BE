import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './global/exception/filter/http-exception.filter';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
