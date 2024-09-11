import { SNS } from 'aws-sdk';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SnsService {
  private sns: SNS;

  constructor(private readonly configService: ConfigService) {
    this.sns = new SNS({
      region: this.configService.get('AWS_SNS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    });
  }

  sendSMS(phoneNumber: string, message: string) {
    const params: SNS.PublishInput = {
      Message: message,
      PhoneNumber: phoneNumber,
    };
    return this.sns.publish(params).promise();
  }
}
