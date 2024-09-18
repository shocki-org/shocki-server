import { Provider } from '@prisma/client';
import { IsEmpty, IsNotEmpty, IsString, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class OAuthDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'OAuth Provider',
    enum: Provider,
  })
  provider: Provider;

  @IsString()
  @ApiProperty({ required: false, nullable: true })
  accessToken?: string;

  @IsString()
  @IsEmpty()
  @Matches('^[+]8210[0-9]{8}$', 'g', { message: 'Invalid phone number' })
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
