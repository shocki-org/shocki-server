import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
