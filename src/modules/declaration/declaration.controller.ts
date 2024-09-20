import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async report(@CurrentUser() { id }: JwtPayload, @Body() dto: ReportDTO) {
    return this.declarationService.report(id, dto);
  }
}
