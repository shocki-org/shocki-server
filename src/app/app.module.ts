import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import importToArray from 'import-to-array';

import * as commonModules from 'src/common/modules';
import * as providers from 'src/common/providers';
import * as modules from 'src/modules';

@Module({
  imports: [
    ...importToArray(commonModules),
    ...importToArray(providers),
    ...importToArray(modules),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
