import { Module } from '@nestjs/common';

import { SnsService } from './sns.service';

@Module({
  providers: [SnsService],
})
export class SnsModule {}
