import { Module } from '@nestjs/common';
import { UsersModule } from '../../../domain/users/module/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { AuthController } from '../controller/auth.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { AuthService } from '../service/auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
