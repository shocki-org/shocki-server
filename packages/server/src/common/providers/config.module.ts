import { Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import { validate } from 'src/common';

const options: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: [`.env.${process.env.NODE_ENV}`, `../../.env`, `../../.env.${process.env.NODE_ENV}`],
  validate,
  validationOptions: {
    abortEarly: true,
  },
};

@Module({
  imports: [ConfigModule.forRoot(options)],
})
export class ShockiConfigModule {}
