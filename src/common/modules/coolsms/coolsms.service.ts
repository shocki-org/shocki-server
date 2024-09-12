import CoolsmsMessageService, { Message } from 'coolsms-node-sdk';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoolsmsService {
  private readonly sms: CoolsmsMessageService;

  constructor(
    private readonly configService: ConfigService<
      {
        COOLSMS_API_KEY: string;
        COOLSMS_API_SECRET: string;
        COOLSMS_SENDER: string;
      },
      true
    >,
  ) {
    this.sms = new CoolsmsMessageService(
      this.configService.get('COOLSMS_API_KEY'),
      this.configService.get('COOLSMS_API_SECRET'),
    );
  }

  async sendSMS(to: string, text: string) {
    const message: Message = {
      to,
      from: this.configService.get('COOLSMS_SENDER'),
      text,
      type: 'SMS',
      autoTypeDetect: false,
    };

    return this.sms.sendOne(message);
  }
}
