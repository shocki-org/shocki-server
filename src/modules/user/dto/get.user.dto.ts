import { UserAccount } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { UserAccountDTO, UserDTO } from './user.dto';

export class GetUserDTO extends UserDTO {
  @ApiProperty({ description: '유저 계정', type: UserAccountDTO })
  userAccount: UserAccount;
}
