import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule, SnsModule } from 'src/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), PrismaModule, SnsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
