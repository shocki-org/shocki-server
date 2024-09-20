import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { GetUserBalanceDTO } from './dto/balance.user.dto';
import { GetDeliveryStatusDTO } from './dto/delivery.user.dto';
import { GetUserFavoriteDTO } from './dto/favorite.user.dto';
import { FCMUserDTO } from './dto/fcm.user.dto';
import { GetUserDTO } from './dto/get.user.dto';
import { PayDTO } from './dto/pay.user.dto';
import { UpdateWalletDTO } from './dto/update.user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 정보 가져오기' })
  @ApiOkResponse({ description: 'User', type: GetUserDTO })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getUser(@CurrentUser() { id }: JwtPayload) {
    return this.userService.getUser(id);
  }

  @Get('balance')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 어카운트 정보 가져오기' })
  @ApiOkResponse({ description: 'Success', type: GetUserBalanceDTO })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getBalance(@CurrentUser() { id }: JwtPayload) {
    return this.userService.balance(id);
  }

  @Get('delivery')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 배송정보 가져오기' })
  @ApiOkResponse({ description: 'Success', type: GetDeliveryStatusDTO })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getDeliveryStatus(@CurrentUser() { id }: JwtPayload) {
    return this.userService.deliveryStatus(id);
  }

  @Get('favorite')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 좋아요 상품 가져오기' })
  @ApiOkResponse({ description: 'Success', type: [GetUserFavoriteDTO] })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getFavorite(@CurrentUser() { id }: JwtPayload) {
    return this.userService.favorite(id);
  }

  @Put('address')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 지갑 주소 변경' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: '응답 참조' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateWalletAddress(
    @CurrentUser() { id }: JwtPayload,
    @Body() { walletAddress }: UpdateWalletDTO,
  ) {
    await this.userService.updateWalletAddress(id, walletAddress);
  }

  @Delete('delete')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: '응답 참조' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteUser(@CurrentUser() { id }: JwtPayload) {
    await this.userService.deleteUser(id);
  }

  @Post('pay')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiBody({
    type: PayDTO,
  })
  @ApiOperation({ summary: '크레딧 충전' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Payment confirmation failed' })
  async pay(@CurrentUser() { id }: JwtPayload, @Body() dto: PayDTO) {
    await this.userService.pay(id, dto);
  }

  @Put('fcm')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiBody({
    type: FCMUserDTO,
  })
  @ApiOperation({ summary: 'FCM 토큰 저장' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateFCMToken(@CurrentUser() { id }: JwtPayload, @Body('fcmToken') fcmToken: string) {
    await this.userService.updateFCMToken(id, fcmToken);
  }
}
