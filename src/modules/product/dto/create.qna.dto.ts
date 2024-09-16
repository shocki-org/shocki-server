import { ProductQnA } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductQnADTO implements Partial<ProductQnA> {
  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @ApiProperty({ description: 'QnA 내용' })
  content: string;
}
