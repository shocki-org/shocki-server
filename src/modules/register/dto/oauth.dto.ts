import { Provider } from '@prisma/client';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class OAuthDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  provider: Provider;

  @IsString()
  @ApiProperty({ required: false, nullable: true })
  accessToken?: string;

  @IsString()
  @Matches('^+8210d{8}$', 'g', { message: 'Invalid phone number' })
  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @IsString()
  @ApiProperty({ required: false, nullable: true })
  password?: string;
}

export class OAuthResponseDTO {
  @ApiProperty()
  accessToken: string;
}
