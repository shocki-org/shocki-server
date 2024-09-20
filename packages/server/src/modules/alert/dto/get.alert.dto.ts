import { Alert, AlertType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AlertDTO implements Partial<Alert> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '제목' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '내용' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '타입', type: 'enum', enum: AlertType })
  type: AlertType;
}
