import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateWalletDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '지갑 주소',
    description: '지갑 주소',
  })
  walletAddress: string;
}

export class UpdateCreditDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 100,
    description: '크레딧',
  })
  credit: number;
}
