import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controller/user.controller';
import { UserService } from '../service/user.service';
import { User } from '../entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { DatabaseModule } from '../../../global/database/module/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, UserRepository])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}