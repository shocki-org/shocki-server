import { IsNumber, IsObject } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { TokenBalanceDTO } from './token.user.dto';

export class GetUserBalanceDTO {
  @IsNumber()
  @ApiProperty({
    description: '보유 크레딧',
  })
  credit: number;

  @IsObject()
  @ApiProperty({
    description: '토큰 밸런스',
    type: [TokenBalanceDTO],
  })
  tokenBalances: TokenBalanceDTO[];

  @IsNumber()
  @ApiProperty({ description: '정산 예정 금액' })
  settlementAmount: number;
}
