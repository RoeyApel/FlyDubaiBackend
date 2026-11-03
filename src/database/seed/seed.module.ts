import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../config/app-config.module.js';
import { Booking } from '../../entities/booking.entity.js';
import { BusCompany } from '../../entities/bus-company.entity.js';
import { Bus } from '../../entities/bus.entity.js';
import { City } from '../../entities/city.entity.js';
import { Payment } from '../../entities/payment.entity.js';
import { Ride } from '../../entities/ride.entity.js';
import { User } from '../../entities/user.entity.js';
import { DatabaseModule } from '../database.module.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([
      User,
      City,
      BusCompany,
      Bus,
      Ride,
      Payment,
      Booking,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
