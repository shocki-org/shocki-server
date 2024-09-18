import { IsNotEmpty, IsNumber, IsString, Length, MaxLength } from 'class-validator';

export class PayDTO {
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  paymentKey: string;

  @IsString()
  @Length(6, 64)
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
