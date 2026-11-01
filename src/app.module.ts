import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createLoggerParams } from './common/logging/logger.config.js';
import {
  type EnvironmentVariables,
  validateEnv,
} from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        createLoggerParams(config.get('LOG_LEVEL', { infer: true })),
    }),
    HealthModule,
  ],
})
export class AppModule {}
