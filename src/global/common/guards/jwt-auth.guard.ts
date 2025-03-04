import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }
}
