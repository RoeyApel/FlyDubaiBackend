import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { BusesModule } from './buses/buses.module.js';
import { CitiesModule } from './cities/cities.module.js';
import { createLoggerParams } from './common/logging/logger.config.js';
import { AppConfigModule } from './config/app-config.module.js';
import type { EnvironmentVariables } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { RidesModule } from './rides/rides.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        createLoggerParams(config.get('LOG_LEVEL', { infer: true })),
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CitiesModule,
    BusesModule,
    RidesModule,
    PaymentsModule,
    BookingsModule,
  ],
})
export class AppModule {}
