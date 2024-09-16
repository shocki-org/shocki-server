import { Category } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class GetCategoriesDTO implements Partial<Category> {
  @ApiProperty({ description: '카테고리 ID' })
  id: string;

  @ApiProperty({ description: '카테고리 이름' })
  name: string;
}
