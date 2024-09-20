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

import { AlertService } from './alert.service';
import { AlertDTO } from './dto/get.alert.dto';

@Controller('alert')
@ApiTags('Alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('access'))
  @ApiOperation({ summary: '알림 리스트 가져오기' })
  @ApiOkResponse({ description: 'Success', type: [AlertDTO] })
  @ApiNotFoundResponse({ description: 'Alert not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAlerts(@CurrentUser() { id }: JwtPayload) {
    return this.alertService.getAlerts(id);
  }
}
