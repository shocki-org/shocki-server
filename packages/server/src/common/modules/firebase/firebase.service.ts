import * as admin from 'firebase-admin';
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { DateTime } from 'luxon';
import * as serverAccount from 'secret/firebase.json';

import { Injectable } from '@nestjs/common';

import { FCMTokenMessageModel } from './models/token-data.model';

@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serverAccount as admin.ServiceAccount),
    });
  }

  async tokenMessageGenerator({
    token,
    title,
    body,
    data,
  }: FCMTokenMessageModel): Promise<TokenMessage> {
    const message: TokenMessage = {
      notification: {
        title,
        body,
      },
      token,
      data: data as unknown as { [key: string]: string },
      android: {
        priority: 'high',
        ttl: 60 * 1000 * 30, // 30 minutes
        notification: {
          priority: 'high',
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-expiration': (60 * 30).toString(), // 30 minutes
        },
        payload: {
          aps: {
            badge: 0,
            sound: 'default',
          },
        },
      },
    };

    return message;
  }

  async sendNotificationByToken(notificationData: FCMTokenMessageModel): Promise<boolean> {
    try {
      await admin
        .messaging()
        .send(await this.tokenMessageGenerator(notificationData))
        .then((response) => {
          console.log(
            DateTime.now().toISO({ includeOffset: true }),
            notificationData.token,
            notificationData.body,
            response,
          );
        });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);

      return false;
    }
  }
}
