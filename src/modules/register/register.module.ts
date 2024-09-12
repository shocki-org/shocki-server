import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth';
import { CoolsmsModule } from 'src/common';

import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

@Module({
  imports: [CoolsmsModule, AuthModule],
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}
