import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from 'src/common';

import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
