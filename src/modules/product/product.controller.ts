import { ProductType } from '@prisma/client';

import { Body, Controller, Get, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { CreateProductDTO } from './dto/create.product.dto';
import { CreateProductQnADTO } from './dto/create.qna.dto';
import { GetProductDTO, GetProductsDTO } from './dto/get.product.dto';
import { UploadProductDetailImageDTO } from './dto/image.product.dto';
import { PurchaseMarketProductDTO } from './dto/purchase.market.dto';
import { SaleProductTokenResponse } from './dto/sale.token.dto';
import { SearchProductDTO } from './dto/search.product.dto';
import { UploadImageDTO } from './dto/upload.image.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Product ID' })
  @ApiOperation({ summary: '상품 가져오기' })
  @ApiOkResponse({ description: 'Product', type: GetProductDTO })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProduct(@CurrentUser() { id }: JwtPayload, @Query('id') productId: string) {
    return this.productService.getProduct(id, productId);
  }

  @Post()
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

  @Patch('type')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiQuery({ name: 'productId', required: true, type: String, description: 'Product ID' })
  @ApiOperation({ summary: '상품 타입 변경 (펀딩 -> 마켓, 펀딩 기간 종료 이후 수동 전환)' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: '이미 마켓 상품이거나, 펀딩 기간이 종료되지 않았습니다.' })
  async updateProductType(
    @CurrentUser() { id }: JwtPayload,
    @Query('productId') productId: string,
  ) {
    await this.productService.updateProductType(id, productId);

    return { success: true };
  }

  @Put('image')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiBody({
    type: UploadImageDTO,
    description: 'Upload product image',
  })
  @ApiQuery({ name: 'productId', required: true, type: String, description: 'Product ID' })
  @ApiOperation({ summary: '상품 이미지 업로드' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: '상품 소유자가 아님' })
  async uploadProductImage(
    @CurrentUser() { id }: JwtPayload,
    @Query('productId') productId: string,
    @Body() dto: UploadImageDTO,
  ) {
    await this.productService.uploadProductImage(id, productId, dto.image);

    return { success: true };
  }

  @Put('image/detail')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiBody({
    type: UploadProductDetailImageDTO,
    description: 'Upload product detail image',
  })
  @ApiOperation({ summary: '상품 상세 이미지 업로드' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: '상품 소유자가 아님' })
  async uploadProductDetailImage(
    @CurrentUser() { id }: JwtPayload,
    @Body() dto: UploadProductDetailImageDTO,
  ) {
    await this.productService.uploadProductDetailImage(id, dto);

    return { success: true };
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품들 가져오기' })
  @ApiQuery({
    name: 'type',
    description: 'Product type (설정하지 않으면 모두)',
    required: false,
    enum: ProductType,
    enumName: 'ProductType',
  })
  @ApiOkResponse({ description: 'Product list', type: [GetProductsDTO] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProductList(@Query('type') type: ProductType | undefined) {
    return this.productService.getProducts(type);
  }

  @Get('favorite')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '좋아요 목록 불러오기' })
  @ApiOkResponse({ description: 'Favorite products', type: [SearchProductDTO] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getFavoriteProducts(@CurrentUser() { id }: JwtPayload) {
    return this.productService.getFavoriteProducts(id);
  }

  @Get('search')
  @ApiBearerAuth()
  @ApiQuery({ name: 'keyword', required: true, type: String })
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '상품 검색하기' })
  @ApiOkResponse({ description: 'Product list (없으면 빈 배열)', type: [SearchProductDTO] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async searchProduct(@Query('keyword') keyword: string) {
    return this.productService.searchProducts(keyword);
  }

  @Put('favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiQuery({ name: 'productId', required: true, type: String })
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
  @ApiQuery({ name: 'productId', required: true, type: String })
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

  @Post('qna')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: 'QnA 작성하기' })
  @ApiBody({
    type: CreateProductQnADTO,
    description: 'Create product QnA',
  })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async createProductQnA(
    @CurrentUser() { id }: JwtPayload,
    @Body() dto: CreateProductQnADTO,
  ): Promise<{ success: boolean }> {
    await this.productService.createProductQnA(id, dto);

    return { success: true };
  }

  @Post('purchase/token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiQuery({ name: 'productId', required: true, type: String })
  @ApiQuery({ name: 'amount', required: true, type: Number, description: '구매할 토큰 수량' })
  @ApiOperation({ summary: '펀딩 상품 구매하기' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: '돈이 충분하지 않거나 제품에 남은 토큰이 없습니다.' })
  @ApiNotFoundResponse({ description: 'Product or User not found' })
  async purchaseProductToken(
    @CurrentUser() { id }: JwtPayload,
    @Query('productId') productId: string,
    @Query('amount') amount: number,
  ) {
    await this.productService.purchaseProductToken(id, productId, amount);

    return { success: true };
  }

  @Post('sale/token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiQuery({ name: 'productId', required: true, type: String })
  @ApiOperation({ summary: '토큰 판매하기' })
  @ApiOkResponse({ description: 'Success', type: SaleProductTokenResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: '판매할 토큰이 없습니다.' })
  @ApiNotFoundResponse({ description: 'Product or User not found' })
  async saleProductToken(@CurrentUser() { id }: JwtPayload, @Query('productId') productId: string) {
    return await this.productService.saleProductToken(id, productId);
  }

  @Post('purchase/market')
  @ApiBody({
    type: PurchaseMarketProductDTO,
    description: 'Purchase market product',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '마켓 상품 구매하기' })
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: '잔액 부족, 또는 펀딩 상품' })
  @ApiNotFoundResponse({ description: 'Product or User not found' })
  async purchaseMarketProduct(
    @CurrentUser() { id }: JwtPayload,
    @Body() dto: PurchaseMarketProductDTO,
  ) {
    await this.productService.purchaseMarketProduct(id, dto);

    return { success: true };
  }
}
