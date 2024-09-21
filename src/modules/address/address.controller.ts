import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AddressService } from './address.service';
import { AddressResponseDTO } from './dto/address-response.dto';

@Controller('address')
@ApiTags('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('search')
  @UseGuards(AuthGuard('access'))
  @ApiBearerAuth()
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiOperation({ summary: '주소 검색' })
  @ApiOkResponse({ description: '주소 검색 성공', type: AddressResponseDTO })
  async search(@Query('query') query: string): Promise<AddressResponseDTO> {
    const logger = new Logger('AddressController');

    logger.log(`search query: ${query}`);

    return await this.addressService.getSimilarAddress(query);
  }
}
