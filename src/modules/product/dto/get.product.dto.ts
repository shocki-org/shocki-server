import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';

import { FundingLogDTO, ProductCategoryDTO, ProductDTO, ProductQnADTO } from './product.dto';

export class GetProductDTO extends ProductDTO {
  @ApiProperty({ description: '펀딩 로그', type: [FundingLogDTO] })
  fundingLog: FundingLogDTO[];

  @ApiProperty({ description: '상품 QnA', type: [ProductQnADTO] })
  productQnA: ProductQnADTO[];

  @ApiProperty({ description: '카테고리', type: [ProductCategoryDTO] })
  categories: ProductCategoryDTO[];

  @ApiProperty({
    description: '찜',
    type: Boolean,
  })
  userFavorite: boolean;
}

export class GetProductsDTO extends PickType(ProductDTO, [
  'id',
  'name',
  'image',
  'currentAmount',
]) {}
