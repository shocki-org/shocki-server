import { UserFavorite } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

export class FavoriteProductDTO implements Partial<UserFavorite> {
  @ApiProperty()
  productId: string;
}
