import { ProductQnA } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductQnADTO implements Partial<ProductQnA> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'QnA 내용' })
  content: string;
}
