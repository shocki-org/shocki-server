import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('privacy')
  @Redirect('https://dukyoung-h.goeyi.kr/dukyoung-h/iv/indvdlView/selectIndvdlView.do', 302)
  getPrivacy() {
    return { url: 'https://dukyoung-h.goeyi.kr/dukyoung-h/iv/indvdlView/selectIndvdlView.do' };
  }
}
