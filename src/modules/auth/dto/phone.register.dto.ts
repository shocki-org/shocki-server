import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PhoneRegisterFirstDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;
}

export class PhoneRegisterSecondDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}

export class PhoneRegisterSecondResponseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}

export interface PhoneRegisterJWTPayload {
  phone: string;
  type: 'phone';
}

export class PhoneRegisterFinalDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
