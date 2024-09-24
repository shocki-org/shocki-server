import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { FirebaseService } from 'src/common/modules/firebase/firebase.service';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { AlertDTO } from './dto/get.alert.dto';

@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

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
    const createdAlert = await this.prisma.alert.create({
      data: {
        ...alert,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        fcmToken: true,
      },
    });

    if (!user) throw new InternalServerErrorException('User not found');
    if (!user.fcmToken) return;

    this.firebase.sendNotificationByToken({
      token: user.fcmToken,
      title: createdAlert.title,
      body: createdAlert.content,
    });
  }
}
