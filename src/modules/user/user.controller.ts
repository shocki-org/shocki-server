import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
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

import { FavoriteProductDTO } from './dto/favorite.user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('favorite')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '좋아요 목록 불러오기' })
  @ApiOkResponse({ description: 'Favorite products', type: [FavoriteProductDTO] })
  @ApiNotFoundResponse({ description: 'Favorite products not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getFavoriteProducts(@CurrentUser() { id }: JwtPayload) {
    return this.userService.getFavoriteProducts(id);
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
}
