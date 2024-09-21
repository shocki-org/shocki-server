import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';
import { CurrentUser } from 'src/common';

import { DeclarationService } from './declaration.service';
import { ReportDTO } from './dto/report.dto';

@Controller('declaration')
@ApiTags('Declaration')
export class DeclarationController {
  constructor(private readonly declarationService: DeclarationService) {}

  @Post('report')
  @ApiBody({ type: ReportDTO })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '배송 신고하기' })
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse({ description: '이미 신고한 내역이 있습니다.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async report(@CurrentUser() { id }: JwtPayload, @Body() dto: ReportDTO) {
    return this.declarationService.report(id, dto);
  }

  @Get('declarations')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '신고 내역 가져오기' })
  @ApiOkResponse({ description: 'Declaration list' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getDeclarations(@Query('productId') id: string) {
    return this.declarationService.getDeclarations(id);
  }
}
