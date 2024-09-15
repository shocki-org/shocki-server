import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
