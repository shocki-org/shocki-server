import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { GetUserDTO } from './dto/get.user.dto';
import { UpdateCreditDTO, UpdateWalletDTO } from './dto/update.user.dto';
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

  @Put('credit')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 크레딧 변경' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: '응답 참조' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateCredit(@CurrentUser() { id }: JwtPayload, @Body() body: UpdateCreditDTO) {
    await this.userService.updateCredit(id, body.credit);
  }
}
