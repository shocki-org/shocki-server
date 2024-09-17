import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common';
import { S3Module } from 'src/common/modules/s3/s3.module';

import { BlockchainModule } from '../blockchain';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, BlockchainModule, S3Module],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
