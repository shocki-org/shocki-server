import { Provider } from '@prisma/client';
import { compare, hash } from 'bcrypt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { JwtPayload, PhoneRegisterJWTPayload } from './model/payload.jwt.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<
      {
        JWT_SECRET: string;
        JWT_ACCESS_TOKEN_EXP: string;
      },
      true
    >,
  ) {}

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

  async passwordMatch(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }

  async createTokens(userId: string) {
    const payload: JwtPayload = { id: userId, type: 'access' };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXP'),
    });
  }

  async createPhoneTmpToken(phone: string) {
    const payload: PhoneRegisterJWTPayload = { phone: phone, type: 'phone' };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '10m',
    });
  }

  async verifyPhoneTmpToken(token: string) {
    let payload: PhoneRegisterJWTPayload;
    try {
      payload = await this.jwtService.verifyAsync<PhoneRegisterJWTPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (e: any) {
      if (e instanceof TokenExpiredError) throw new UnauthorizedException('Token expired');
      throw new UnauthorizedException('Token is invalid');
    }

    return payload.phone;
  }
}
