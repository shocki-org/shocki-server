import { PickType } from '@nestjs/swagger';

import { ProductDTO } from 'src/modules/product/dto/product.dto';

export class GetProductsByCategoryDTO extends PickType(ProductDTO, [
  'id',
  'name',
  'image',
  'currentAmount',
]) {}
