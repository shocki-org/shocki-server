import { redisStore } from 'cache-manager-redis-yet';

import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

const options: CacheModuleAsyncOptions = {
  imports: [ConfigModule],
  isGlobal: true,
  useFactory: async (config: ConfigService) => ({
    store: await redisStore({
      socket: {
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
      },
    }),
  }),
  inject: [ConfigService],
};

@Module({
  imports: [CacheModule.registerAsync(options)],
})
export class ShockiCacheModule {}
