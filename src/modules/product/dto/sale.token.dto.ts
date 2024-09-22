import { ApiProperty } from '@nestjs/swagger';

export class SaleProductTokenResponse {
  @ApiProperty({ description: '판매한 토큰 양' })
  token: number;

  @ApiProperty({ description: '반환된 크레딧' })
  credit: number;
}
