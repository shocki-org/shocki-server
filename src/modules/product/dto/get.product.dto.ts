import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';

import { ProductDTO, ProductGraphDTO, ProductQnADTO } from './product.dto';

export class GetProductDTO extends ProductDTO {
  @ApiProperty({ description: '그래프', type: [ProductGraphDTO] })
  graph: ProductGraphDTO[];

  @ApiProperty({ description: '상품 QnA', type: [ProductQnADTO] })
  productQnA: ProductQnADTO[];

  @ApiProperty({ description: '카테고리', type: [String] })
  categories: string[];

  @ApiProperty({
    description: '찜',
    type: Boolean,
  })
  userFavorite: boolean;

  @ApiProperty({
    description: '상세 이미지 리스트',
    type: [String],
  })
  detailImages: string[];

  @ApiProperty({
    description: '구매 가능 여부',
    type: Boolean,
  })
  purchaseIsDisabled: boolean;

  @ApiProperty({
    description: '판매 가능 여부',
    type: Boolean,
  })
  saleIsDisabled: boolean;
}

export class GetProductsDTO extends PickType(ProductDTO, ['id', 'name', 'image', 'currentAmount']) {
  @ApiProperty({ description: '카테고리 ID' })
  categoryId: string;
}
