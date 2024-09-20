import { MarketPurchaseStatus } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { MyPageProductDTO } from './product.user.dto';

export class GetDeliveryStatusDTO extends MyPageProductDTO {
  @ApiProperty({
    description: '구매 ID',
  })
  purchaseId: string;

  @ApiProperty({
    description: '배송 상태',
    enum: MarketPurchaseStatus,
  })
  status: MarketPurchaseStatus;
}
