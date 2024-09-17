import { $Enums, User } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class UserDTO implements Omit<User, 'password'> {
  @ApiProperty({ description: '유저 ID' })
  id: string;

  @ApiProperty({ description: '인증 유형', enum: $Enums.Provider })
  provider: $Enums.Provider;

  @ApiProperty({ description: 'OAuth ID' })
  providerId: string;
}

export class UserAccountDTO {
  @ApiProperty({ description: '유저 계정 ID' })
  id: string;

  @ApiProperty({ description: '지갑 주소' })
  walletAddress: string;

  @ApiProperty({ description: '보유 크레딧' })
  credit: number;
}
