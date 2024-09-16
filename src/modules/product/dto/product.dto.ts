import { $Enums, FundingLog, Product, ProductQnA } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class ProductDTO implements Product {
  @ApiProperty({ description: '상품 ID' })
  id: string;

  @ApiProperty({ description: '상품 소유자 ID' })
  ownerId: string;

  @ApiProperty({ description: '상품 이름' })
  name: string;

  @ApiProperty({ description: '상품 이미지 URL' })
  image: string;

  @ApiProperty({ description: '상세 이미지 URL' })
  detailImage: string;

  @ApiProperty({ enum: $Enums.ProductType })
  type: $Enums.ProductType;

  @ApiProperty({ description: '현재가' })
  currentAmount: number;

  @ApiProperty({ description: '목표가' })
  targetAmount: number;

  @ApiProperty({ description: '현재 모인금액' })
  collectedAmount: number;

  @ApiProperty({ description: '펀딩 종료일' })
  fundingEndDate: Date;
}

export class ProductQnADTO implements Partial<ProductQnA> {
  @ApiProperty({ enum: $Enums.ProductQnAAuthorType })
  authorType: $Enums.ProductQnAAuthorType;

  @ApiProperty({
    description: '작성자 ID',
    nullable: true,
    example: 'User ID',
    type: String || null,
  })
  authorId: string | null;

  @ApiProperty({ description: 'QnA 내용' })
  content: string;

  @ApiProperty({ description: '작성일' })
  createdAt: Date;
}

export class FundingLogDTO implements Partial<FundingLog> {
  @ApiProperty({ description: '펀딩 금액' })
  amount: number;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class ProductGraphDTO {
  @ApiProperty({ description: '인덱스' })
  x: number;

  @ApiProperty({ description: '펀딩 금액' })
  y: number;
}
