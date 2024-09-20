import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { ReportDTO } from './dto/report.dto';

@Injectable()
export class DeclarationService {
  constructor(private readonly prisma: PrismaService) {}

  async report(userId: string, dto: ReportDTO) {
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
}
