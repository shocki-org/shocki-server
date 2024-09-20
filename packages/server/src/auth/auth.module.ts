import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from 'src/common';

import { AuthService } from './auth.service';
import { AccessJwtStrategy } from './strategy/access.strategy';

@Module({
  imports: [JwtModule.register({}), PrismaModule, PassportModule],
  providers: [AuthService, AccessJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
