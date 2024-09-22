import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UploadProductDetailImageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'base64 이미지' })
  base64Image: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsNotEmpty()
  @ApiProperty({ description: '이미지 인덱스 (0부터 시작)', example: 0 })
  index: number;
}
