import { Module } from '@nestjs/common';

import { CoolsmsService } from './coolsms.service';

@Module({
  providers: [CoolsmsService],
  exports: [CoolsmsService],
})
export class CoolsmsModule {}
