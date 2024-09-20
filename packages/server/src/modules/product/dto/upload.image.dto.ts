import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDTO {
  @ApiProperty({ description: 'base64 이미지', type: 'string' })
  image: string;
}
