import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { AccountService } from './account.service';
import { GetCreditBalanceDTO } from './dto/get.credit.dto';

@Controller('account')
@ApiTags('Account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('credit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '크레딧 잔액 가져오기' })
  @ApiOkResponse({ description: '크레딧 잔액', type: GetCreditBalanceDTO })
  @ApiNotFoundResponse({ description: '유저나 어카운트 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProduct(@CurrentUser() { id }: JwtPayload) {
    return this.accountService.getCreditBalance(id);
  }
}
