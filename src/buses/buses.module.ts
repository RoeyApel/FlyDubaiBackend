import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusCompany } from '../entities/bus-company.entity.js';
import { Bus } from '../entities/bus.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([BusCompany, Bus])],
  exports: [TypeOrmModule],
})
export class BusesModule {}
