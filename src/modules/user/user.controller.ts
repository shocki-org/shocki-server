import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

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
    return this.userService.getUser(id).then((user) => {
      return {
        ...user,
        settlementAmount: 0, // 실제 정산 예정 금액으로 변경
      };
    });
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
  @ApiOperation({ summary: '크레딧 충전' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Payment confirmation failed' })
  async pay(@CurrentUser() { id }: JwtPayload, @Body() dto: PayDTO) {
    await this.userService.pay(id, dto);
  }
}
