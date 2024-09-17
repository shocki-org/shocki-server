import { Prisma } from '@prisma/client';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        userAccount: true,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return user;
  }

  async updateWalletAddress(id: string, walletAddress: string) {
    await this.prisma.userAccount.update({
      where: {
        id,
      },
      data: {
        walletAddress,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const res = await this.prisma.user
      .delete({
        where: {
          id: userId,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            // Foreign key constraint failed
            const relationName = error.meta?.field_name as string; // 관계 이름 가져오기

            switch (relationName) {
              case 'Product_ownerId_fkey (index)':
                throw new BadRequestException(
                  '현재 사용자가 소유한 제품이 있습니다. 먼저 제품을 삭제해주세요.',
                );
            }
          }
          throw new InternalServerErrorException(
            '사용자를 삭제하는 중에 알 수 없는 오류가 발생했습니다.',
          );
        }
      });

    return res;
  }
}
