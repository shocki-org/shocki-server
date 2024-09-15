import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
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
  async getProduct(@Param('id') id: string) {
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
}
