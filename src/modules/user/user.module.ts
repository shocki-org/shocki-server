import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';

import { BlockchainModule } from '../blockchain';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
