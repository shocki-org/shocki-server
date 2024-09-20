import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';

import { DeclarationController } from './declaration.controller';
import { DeclarationService } from './declaration.service';

@Module({
  imports: [PrismaModule],
  controllers: [DeclarationController],
  providers: [DeclarationService],
})
export class DeclarationModule {}
