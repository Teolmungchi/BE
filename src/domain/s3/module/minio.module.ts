import { Module } from '@nestjs/common';
import { MinioService } from '../service/minio.service';
import { MinioController } from '../controller/minio.controller';

@Module({
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}