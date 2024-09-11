import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth';
import { SnsModule } from 'src/common';

import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

@Module({
  imports: [SnsModule, AuthModule],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}
