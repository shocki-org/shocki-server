import { IsDate, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { MyPageProductDTO } from './product.user.dto';

export class SettlementProductDTO extends MyPageProductDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '정산 금액',
  })
  settlementAmount: number;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: '정산 일자',
  })
  settlementDate: Date;
}

export class GetSettlementUserDto {
  @IsNumber()
  @ApiProperty({
    description: '총 정산 금액',
  })
  totalSettlementAmount: number;

  @IsObject()
  @ApiProperty({
    description: '정산 상품 목록',
    type: [SettlementProductDTO],
  })
  settlementProducts: SettlementProductDTO[];
}
