import { User } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class FCMUserDTO implements Partial<User> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'fcmToken',
    description: 'FCM 토큰',
  })
  fcmToken: string;
}
