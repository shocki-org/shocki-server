import { Provider } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { CoolsmsService } from 'src/common/modules/coolsms/coolsms.service';

import { OAuthDTO } from './dto/oauth.dto';
import {
  PhoneRegisterFinalDTO,
  PhoneRegisterFirstDTO,
  PhoneRegisterSecondDTO,
} from './dto/phone.register.dto';
import { KakaoUser } from './model/kakao.user.model';
import { OauthUser } from './model/oauth.user.model';

@Injectable()
export class RegisterService {
  private readonly oAuth2Client: OAuth2Client;
  constructor(
    private readonly coolsmsService: CoolsmsService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.oAuth2Client = new OAuth2Client();
  }
  async phoneRegisterFirst(dto: PhoneRegisterFirstDTO) {
    const user = await this.authService.findUserByProvider(Provider.PHONE, dto.phone);
    if (user) throw new ConflictException('Phone number already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(dto.phone, otp, 180000); // 3 minutes
    await this.coolsmsService.sendSMS(dto.phone, `[Shocki] 인증번호 [${otp}]를 입력해주세요.`);
  }

  async phoneRegisterSecond(dto: PhoneRegisterSecondDTO) {
    const otp = await this.cacheManager.get<string>(dto.phone);

    if (!otp) throw new UnauthorizedException('OTP expired');
    if (otp !== dto.otp) throw new UnauthorizedException('OTP is incorrect');

    await this.cacheManager.del(dto.phone);

    return this.authService.createPhoneTmpToken(dto.phone);
  }

  async phoneRegisterFinal(dto: PhoneRegisterFinalDTO) {
    const phone = await this.authService.verifyPhoneTmpToken(dto.token);

    const user = await this.authService.findUserByProvider(Provider.PHONE, phone);
    if (user) throw new ConflictException('Phone number already exists');

    return this.authService
      .createUser(Provider.PHONE, phone, dto.password)
      .then((registeredUser) => this.authService.createTokens(registeredUser.id));
  }

  async login(dto: OAuthDTO) {
    let oauthUser: OauthUser;

    switch (dto.provider) {
      case Provider.KAKAO:
        if (!dto.accessToken) throw new UnauthorizedException('Kakao accessToken is required');
        const kakaoUser = await this.getKakaoUser(dto.accessToken);
        oauthUser = {
          provider: Provider.KAKAO,
          providerId: kakaoUser.id.toString(),
        };

        break;
      case Provider.GOOGLE:
        if (!dto.accessToken) throw new UnauthorizedException('Google accessToken is required');
        const googleUser = await this.getGoogleUser(dto.accessToken);
        oauthUser = {
          provider: Provider.GOOGLE,
          providerId: googleUser.sub.toString(),
        };

        break;
      case Provider.PHONE:
        if (!dto.phone || !dto.password)
          throw new UnauthorizedException('Phone and password are required');
        oauthUser = {
          provider: Provider.PHONE,
          providerId: dto.phone!,
        };

        break;
    }

    const user = await this.authService.findUserByProvider(
      oauthUser.provider,
      oauthUser.providerId,
    );

    if (Provider.PHONE === dto.provider) {
      if (!user) throw new NotFoundException('User not found');
      if (!user.password) throw new InternalServerErrorException('Password is not set');
      if (!dto.password) throw new UnauthorizedException('Password is required');

      return this.authService.passwordMatch(dto.password, user.password).then((isMatch) => {
        if (!isMatch) throw new UnauthorizedException('Password is incorrect');
        return this.authService.createTokens(user.id);
      });
    } else if (!user) {
      return this.authService
        .createUser(oauthUser.provider, oauthUser.providerId)
        .then((registeredUser) => this.authService.createTokens(registeredUser.id));
    }

    return this.authService.createTokens(user.id);
  }

  async getKakaoUser(accessToken: string) {
    const user: KakaoUser = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => (res.status === 200 ? res.json() : null));

    if (!user) {
      throw new UnauthorizedException('Kakao login failed');
    }

    return user;
  }

  async getGoogleUser(accessToken: string) {
    const ticket = await this.oAuth2Client.verifyIdToken({
      idToken: accessToken,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Google login failed');
    }

    return payload;
  }
}
