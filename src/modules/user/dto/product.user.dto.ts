import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MyPageProductDTO {
  @IsString()
  @ApiProperty({
    description: '상품 ID',
  })
  productId: string;

  @IsString()
  @ApiProperty({
    description: '상품 이름',
  })
  productName: string;

  @IsString()
  @ApiProperty({
    description: '상품 이미지 URL',
  })
  productImage: string;
}
