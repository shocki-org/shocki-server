import { Module } from '@nestjs/common';

import { FirebaseModule, PrismaModule } from 'src/common';

import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
