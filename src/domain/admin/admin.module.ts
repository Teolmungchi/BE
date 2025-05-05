import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './controller/admin.controller';
import { DatabaseModule } from '../../global/database/module/database.module';
import { UsersModule } from '../users/module/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule, UsersModule, ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
