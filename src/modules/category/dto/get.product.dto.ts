import { Product } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class GetProductsByCategoryDTO implements Partial<Product> {
  @ApiProperty({ description: '상품 ID' })
  id: string;

  @ApiProperty({ description: '상품 이름' })
  name: string;

  @ApiProperty({ description: '상품 이미지' })
  image: string;

  @ApiProperty({ description: '상품 현재가' })
  currentAmount: number;
}
