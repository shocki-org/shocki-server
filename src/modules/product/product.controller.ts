import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { CreateProductDTO } from './dto/create.product.dto';
import { GetProductDTO } from './dto/get.product.dto';
import { SearchProductDTO } from './dto/search.product.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품 가져오기' })
  @ApiOkResponse({ description: 'Product', type: GetProductDTO })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProduct(@CurrentUser() { id }: JwtPayload, @Query('id') productId: string) {
    return this.productService.getProduct(id, productId);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품 만들기' })
  @ApiBody({
    type: CreateProductDTO,
    description: 'Create product',
  })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createProduct(@CurrentUser() { id }: JwtPayload, @Body() dto: CreateProductDTO) {
    const res = await this.productService.createProduct(id, dto);

    return { productId: res.id };
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품들 가져오기' })
  @ApiOkResponse({ description: 'Product list', type: [GetProductDTO] })
  @ApiNotFoundResponse({ description: 'Products not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProductList(@CurrentUser() { id }: JwtPayload) {
    return this.productService.getProducts(id);
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품 검색하기' })
  @ApiOkResponse({ description: 'Product list', type: [SearchProductDTO] })
  @ApiNotFoundResponse({ description: 'Products not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async searchProduct(@Query('keyword') keyword: string) {
    return this.productService.searchProducts(keyword);
  }

  @Put('favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '좋아요 누르기' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Already favorited' })
  async favoriteProduct(@CurrentUser() { id }: JwtPayload, @Query('productId') productId: string) {
    await this.productService.favoriteProduct(id, productId);

    return { success: true };
  }

  @Put('unfavorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '좋아요 취소하기' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Already unfavorited' })
  async unfavoriteProduct(
    @CurrentUser() { id }: JwtPayload,
    @Query('productId') productId: string,
  ) {
    await this.productService.unfavoriteProduct(id, productId);

    return { success: true };
  }
}
