import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getCreditBalance(userId: string) {
    return this.prisma.user
      .findUnique({
        where: {
          id: userId,
        },
        select: {
          userAccount: {
            select: {
              credit: true,
            },
          },
        },
      })
      .then((user) => {
        if (!user) throw new NotFoundException('User not found');
        if (!user.userAccount) throw new NotFoundException('Account not found');

        return { credit: user.userAccount.credit };
      });
  }
}
