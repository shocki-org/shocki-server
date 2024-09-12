import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PhoneRegisterFirstDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '+821012345678',
  })
  phone: string;
}

export class PhoneRegisterSecondDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '+821012345678',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '000000',
  })
  otp: string;
}

export class PhoneRegisterSecondResponseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
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
