import { Category } from '@prisma/client';

import { ApiProperty, PickType } from '@nestjs/swagger';

import { GetCategoriesDTO } from 'src/modules/category/dto/get.category.dto';

import { ProductDTO } from './product.dto';

export class SearchProductDTO extends PickType(ProductDTO, [
  'id',
  'name',
  'image',
  'currentAmount',
]) {
  @ApiProperty({ description: '카테고리', type: [GetCategoriesDTO] })
  categories: Category[];
}
