import { Provider } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class OAuthDTO {
  @IsEnum(Object.values(Provider))
  @IsNotEmpty()
  @ApiProperty({
    description: 'OAuth Provider',
    enum: Provider,
  })
  provider: Provider;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  accessToken?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, nullable: true })
  password?: string;
}

export class OAuthResponseDTO {
  @ApiProperty()
  accessToken: string;
}
