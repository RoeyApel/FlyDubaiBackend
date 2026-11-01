import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createLoggerParams } from './common/logging/logger.config.js';
import {
  type EnvironmentVariables,
  validateEnv,
} from './config/env.validation.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { BusesModule } from './buses/buses.module.js';
import { CitiesModule } from './cities/cities.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { RidesModule } from './rides/rides.module.js';
import { UsersModule } from './users/users.module.js';

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
    DatabaseModule,
    HealthModule,
    UsersModule,
    CitiesModule,
    BusesModule,
    RidesModule,
    PaymentsModule,
    BookingsModule,
  ],
})
export class AppModule {}
