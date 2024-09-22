import { Prisma } from '@prisma/client';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDTO implements Partial<Prisma.ProductCreateInput> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '상품 이름',
    description: '상품 이름',
  })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10000,
    description: '현재가 (시작가)',
  })
  currentAmount: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 20000,
    description: '목표가',
  })
  targetAmount: number;

  @IsNotEmpty()
  @Matches('^(0(.\\d)?|1(.0)?)$', 'g', { message: 'Invalid distribution percent' })
  @ApiProperty({
    example: '0.5',
    description: '배분율',
    type: String,
  })
  distributionPercent: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-09-15T00:00:00.000Z',
    description: '펀딩 종료일 (ISO 8601)',
  })
  fundingEndDate: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-09-15T00:00:00.000Z',
    description: '펀딩 종료일 (ISO 8601)',
  })
  marketEndDate: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    example: ['카테고리1', '카테고리2'],
    description: '카테고리 (자동으로 검색 및 생성)',
  })
  category: string[];
}
