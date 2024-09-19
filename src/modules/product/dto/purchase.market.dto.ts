import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PurchaseMarketProductDTO implements Partial<Prisma.UserMarketPurchaseCreateInput> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '상품 ID',
  })
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '구매 수량',
    example: 1,
  })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '구매자 전화번호 (양식 상관 X)',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '구매자 주소',
  })
  address: string;
}
