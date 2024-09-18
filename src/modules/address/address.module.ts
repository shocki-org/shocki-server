import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
    imports: [HttpModule],
    controllers: [AddressController],
    providers: [AddressService],
    exports: [AddressService],
})
export class AddressModule {}
