import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { GetCategoriesDTO } from './dto/get.category.dto';
import { GetProductsByCategoryDTO } from './dto/get.product.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '카테고리 리스트 가져오기' })
  @ApiOkResponse({ description: 'Category list', type: [GetCategoriesDTO] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get('products')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '카테고리 ID로 상품 리스트 가져오기' })
  @ApiOkResponse({ description: 'Product list', type: [GetProductsByCategoryDTO] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProductsByCategoryId(@Query('categoryId') categoryId: string) {
    return this.categoryService.getProductsByCategoryId(categoryId);
  }
}
