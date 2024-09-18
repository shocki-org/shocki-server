import { IsNotEmpty, IsString } from 'class-validator';

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
