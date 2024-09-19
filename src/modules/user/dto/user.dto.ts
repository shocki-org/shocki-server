import { User } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class UserDTO implements Partial<User> {
  @ApiProperty({ description: '유저 ID' })
  id: string;
}

export class UserAccountDTO {
  @ApiProperty({ description: '유저 계정 ID' })
  id: string;

  @ApiProperty({ description: '보유 크레딧' })
  credit: number;
}
