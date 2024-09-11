import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SnsService {
  private sns: SNSClient;

  constructor(
    private readonly configService: ConfigService<
      {
        AWS_SNS_REGION: string;
        AWS_ACCESS_ID: string;
        AWS_SECRET_KEY: string;
      },
      true
    >,
  ) {
    this.sns = new SNSClient({
      region: this.configService.get('AWS_SNS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async sendSMS(phoneNumber: string, message: string) {
    return this.sns
      .send(
        new PublishCommand({
          PhoneNumber: phoneNumber,
          Message: message,
        }),
      )
      .then((res) => res.MessageId);
  }
}
