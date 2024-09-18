import { UserAccount } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class GetCreditBalanceDTO implements Partial<UserAccount> {
  @ApiProperty({ description: '크레딧 잔액' })
  credit: number;
}
