import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { CreateProductDTO } from './dto/create.product.dto';
import { GetProductDTO } from './dto/get.product.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOkResponse({ description: 'Product', type: GetProductDTO })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProduct(@Query('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Put('')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
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
  @ApiOkResponse({ description: 'Product list', type: [GetProductDTO] })
  @ApiNotFoundResponse({ description: 'Products not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProductList(@CurrentUser() { id }: JwtPayload) {
    return this.productService.getProducts(id);
  }

  @Put('favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
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
