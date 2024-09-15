import { PickType } from '@nestjs/swagger';

import { ProductDTO } from './product.dto';

export class SearchProductDTO extends PickType(ProductDTO, [
  'id',
  'name',
  'image',
  'currentAmount',
]) {}
