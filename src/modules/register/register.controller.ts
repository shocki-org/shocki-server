import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OAuthDTO, OAuthResponseDTO } from './dto/oauth.dto';
import {
  PhoneRegisterFinalDTO,
  PhoneRegisterFirstDTO,
  PhoneRegisterSecondDTO,
  PhoneRegisterSecondResponseDTO,
} from './dto/phone.register.dto';
import { RegisterService } from './register.service';

@Controller('register')
@ApiTags('Register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('login')
  @ApiBody({
    type: OAuthDTO,
  })
  @ApiOperation({ summary: 'Login (OAuth and Phone)' })
  @ApiOkResponse({ description: 'Success', type: OAuthResponseDTO })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiNotFoundResponse({ description: 'User not found (Phone)' })
  @ApiInternalServerErrorResponse({
    description: 'User password is not set (Phone) or Internal server error',
  })
  async login(@Body() dto: OAuthDTO) {
    const token = await this.registerService.login(dto);

    return { token };
  }

  @Post('phone/first')
  @ApiBody({
    type: PhoneRegisterFirstDTO,
  })
  @ApiOperation({ summary: 'Phone login first step' })
  @ApiOkResponse({ description: 'Success' })
  @ApiConflictResponse({ description: 'Phone number already exists' })
  async phoneRegisterFirst(@Body() dto: PhoneRegisterFirstDTO) {
    await this.registerService.phoneRegisterFirst(dto);

    return true;
  }

  @Post('phone/second')
  @ApiBody({
    type: PhoneRegisterSecondDTO,
  })
  @ApiOperation({ summary: 'Phone login second step' })
  @ApiOkResponse({ description: 'Success', type: PhoneRegisterSecondResponseDTO })
  @ApiUnauthorizedResponse({ description: 'OTP is invalid' })
  async phoneRegisterSecond(@Body() dto: PhoneRegisterSecondDTO) {
    const token = await this.registerService.phoneRegisterSecond(dto);

    return { token };
  }

  @Post('phone/final')
  @ApiBody({
    type: PhoneRegisterFinalDTO,
  })
  @ApiOperation({ summary: 'Phone login final step' })
  @ApiOkResponse({ description: 'Success', type: OAuthResponseDTO })
  @ApiUnauthorizedResponse({ description: 'OTP is invalid' })
  @ApiConflictResponse({ description: 'Phone number already exists' })
  async phoneRegisterFinal(@Body() dto: PhoneRegisterFinalDTO) {
    const token = await this.registerService.phoneRegisterFinal(dto);

    return { token };
  }
}
