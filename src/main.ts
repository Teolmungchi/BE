import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './global/exception/filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('털뭉치 API')
    .setDescription('털뭉치 Documentation')
    .setVersion('1.0')
    .addBearerAuth() // JWT 토큰 인증 추가 (옵션)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 기본 URL: http://localhost:3000/api

  await app.listen(3000);
}
bootstrap();
