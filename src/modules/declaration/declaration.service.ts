import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { ReportDTO } from './dto/report.dto';

@Injectable()
export class DeclarationService {
  constructor(private readonly prisma: PrismaService) {}

  async report(userId: string, dto: ReportDTO) {
    const isExist = await this.prisma.declaration.findFirst({
      where: {
        AND: [
          {
            purchaseId: dto.purchaseId,
          },
          {
            userId,
          },
          { type: dto.type },
        ],
      },
    });
    if (isExist) {
      throw new BadRequestException('이미 신고한 내역이 있습니다.');
    }

    return await this.prisma.declaration.create({
      data: {
        type: dto.type,
        user: {
          connect: {
            id: userId,
          },
        },
        purchase: {
          connect: {
            id: dto.purchaseId,
          },
        },
      },
    });
  }

  async getDeclarations(productId: string) {
    return await this.prisma.declaration.findMany({
      select: {
        id: true,
        purchaseId: true,
        type: true,
        user: {
          select: {
            id: true,
          },
        },
      },
      where: {
        purchase: {
          product: {
            id: productId,
          },
        },
      },
    });
  }
}
