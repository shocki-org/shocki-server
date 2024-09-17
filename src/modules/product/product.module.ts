import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';

import { BlockchainModule } from '../blockchain';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, BlockchainModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
