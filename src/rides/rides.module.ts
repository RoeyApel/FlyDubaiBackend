import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from '../bookings/bookings.module.js';
import { CitiesModule } from '../cities/cities.module.js';
import { Ride } from '../entities/ride.entity.js';
import { RidesController } from './rides.controller.js';
import { RidesService } from './rides.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ride]), CitiesModule, BookingsModule],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}
