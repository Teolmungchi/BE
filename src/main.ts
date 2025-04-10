import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './global/exception/filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use((req, res, next) => {
    if (req.originalUrl === '/' || req.path === '/') {
      return res.redirect('/api');
    }
    next();
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('셜록냥즈 API')
    .setDescription('셜록냥즈 Documentation')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    // .addServer('/api')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });


  await app.listen(3000);
}
bootstrap();
