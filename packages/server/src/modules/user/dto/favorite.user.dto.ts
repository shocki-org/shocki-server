import { IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { MyPageProductDTO } from './product.user.dto';

export class GetUserFavoriteDTO extends MyPageProductDTO {
  @IsNumber()
  @ApiProperty({
    description: '상품 현재가',
  })
  productPrice: number;
}
