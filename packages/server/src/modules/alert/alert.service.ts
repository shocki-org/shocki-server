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
    return this.prisma.alert
      .create({
        data: {
          ...alert,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })
      .then(() => this.prisma.user.findUnique({ where: { id: userId } }))
      .then((user) => user?.fcmToken || '')
      .then((fcmToken) =>
        this.firebase.sendNotificationByToken({
          token: fcmToken,
          title: alert.title,
          body: alert.content,
        }),
      )
      .catch(() => {
        throw new InternalServerErrorException('알림 생성에 실패했거나, 전송에 실패했습니다.');
      });
  }
}
