import { IsNotEmpty, IsNumber, IsString, Length, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PayDTO {
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  @ApiProperty({
    description: '결제 키',
  })
  paymentKey: string;

  @IsString()
  @Length(6, 64)
  @IsNotEmpty()
  @ApiProperty({
    description: '주문 번호',
  })
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '충전 금액',
  })
  amount: number;
}
