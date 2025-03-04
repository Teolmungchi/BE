import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../global/database/module/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repository/user.repository';
import { UsersController } from '../controller/users.controller';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, UserRepository],
  controllers: [UsersController],
  exports: [UserRepository],
})
export class UsersModule {}
