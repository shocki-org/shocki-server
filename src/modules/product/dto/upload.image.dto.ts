import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'base64 이미지', type: 'string' })
  image: string;
}
