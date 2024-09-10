import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login() {
    // return this.authService.login();
  }

  @Post('register')
  async register() {
    // return this.authService.register();
  }

  @Post('kakao')
  async kakao() {
    // return this.authService.kakao();
  }

  @Post('google')
  async google() {
    // return this.authService.google();
  }
}
