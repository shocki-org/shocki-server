import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';

import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
  imports: [PrismaModule],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
