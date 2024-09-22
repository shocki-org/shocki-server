import { DeclarationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ReportDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '배송 엔드포인트에서 제공되는 purchaseId',
  })
  purchaseId: string;

  @IsEnum(Object.values(DeclarationType))
  @IsNotEmpty()
  @ApiProperty({
    description: '신고 타입',
    enum: DeclarationType,
  })
  type: DeclarationType;
}
