import { IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { MyPageProductDTO } from './product.user.dto';

export class TokenBalanceDTO extends MyPageProductDTO {
  @IsNumber()
  @ApiProperty({
    description: '토큰 수량',
  })
  tokenAmount: number;
}
