import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './controller/admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
