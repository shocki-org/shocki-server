import { UserAccount } from '@prisma/client';

export class GetCreditBalanceDTO implements Partial<UserAccount> {
  credit: number;
}
