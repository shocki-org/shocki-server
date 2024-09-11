import { Provider } from '@prisma/client';
import { compare, hash } from 'bcrypt';
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
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { SnsService } from 'src/common/modules/aws/sns/sns.service';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { OAuthDTO } from './dto/oauth.dto';
import {
  PhoneRegisterFinalDTO,
  PhoneRegisterFirstDTO,
  PhoneRegisterJWTPayload,
  PhoneRegisterSecondDTO,
} from './dto/phone.register.dto';
import { KakaoUser } from './model/kakao.user.model';
import { OauthUser } from './model/oauth.user.model';
import { JwtPayload } from './model/payload.jwt.model';

@Injectable()
export class AuthService {
  private readonly oAuth2Client: OAuth2Client;
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly snsService: SnsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.oAuth2Client = new OAuth2Client();
  }

  async findUserByProvider(provider: Provider, providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });
  }

  async createUser(provider: Provider, providerId: string, password?: string) {
    return this.prisma.user.create({
      data: {
        provider,
        providerId,
        password: password ? await hash(password, 10) : null,
      },
    });
  }

  async createTokens(userId: string) {
    const payload: JwtPayload = { id: userId, type: 'access' };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXP'),
    });
  }

  async phoneRegisterFirst(dto: PhoneRegisterFirstDTO) {
    const user = await this.findUserByProvider(Provider.PHONE, dto.phone);
    if (user) throw new ConflictException('Phone number already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(dto.phone, otp, 180000); // 3 minutes
    await this.snsService.sendSMS(dto.phone, `[Shocki] 인증번호 [${otp}]를 입력해주세요.`);
  }

  async phoneRegisterSecond(dto: PhoneRegisterSecondDTO) {
    const otp = await this.cacheManager.get<string>(dto.phone);

    if (!otp) throw new UnauthorizedException('OTP expired');
    if (otp !== dto.otp) throw new UnauthorizedException('OTP is incorrect');

    await this.cacheManager.del(dto.phone);

    const payload: PhoneRegisterJWTPayload = { phone: dto.phone, type: 'phone' };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXP'),
    });
  }

  async phoneRegisterFinal(dto: PhoneRegisterFinalDTO) {
    let payload: PhoneRegisterJWTPayload;
    try {
      payload = await this.jwtService.verifyAsync<PhoneRegisterJWTPayload>(dto.token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (e: any) {
      if (e instanceof TokenExpiredError) throw new UnauthorizedException('Token expired');
      throw new UnauthorizedException('Token is invalid');
    }

    const user = await this.findUserByProvider(Provider.PHONE, payload.phone);
    if (user) throw new ConflictException('Phone number already exists');

    return this.createUser(Provider.PHONE, payload.phone, dto.password).then((registeredUser) =>
      this.createTokens(registeredUser.id),
    );
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

    const user = await this.findUserByProvider(oauthUser.provider, oauthUser.providerId);

    if (Provider.PHONE === dto.provider) {
      if (!user) throw new NotFoundException('User not found');
      if (!user.password) throw new InternalServerErrorException('Password is not set');
      if (!dto.password) throw new UnauthorizedException('Password is required');

      return compare(dto.password, user.password).then((isMatch) => {
        if (!isMatch) throw new UnauthorizedException('Password is incorrect');
        return this.createTokens(user.id);
      });
    } else if (!user) {
      return this.createUser(oauthUser.provider, oauthUser.providerId).then((registeredUser) =>
        this.createTokens(registeredUser.id),
      );
    }

    return this.createTokens(user.id);
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
