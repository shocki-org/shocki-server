import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { AlertDTO } from './dto/get.alert.dto';

@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(userId: string): Promise<AlertDTO[]> {
    return this.prisma.alert.findMany({
      select: {
        title: true,
        content: true,
        type: true,
      },
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createAlert(alert: AlertDTO, userId: string) {
    return this.prisma.alert.create({
      data: {
        ...alert,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
