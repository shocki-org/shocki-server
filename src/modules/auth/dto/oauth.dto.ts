import { Provider } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class OAuthDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  provider: Provider;

  @IsString()
  @ApiProperty()
  accessToken?: string;

  @IsString()
  @ApiProperty()
  phone?: string;

  @IsString()
  @ApiProperty()
  password?: string;
}
