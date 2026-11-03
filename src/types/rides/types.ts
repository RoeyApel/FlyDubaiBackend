import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, Matches, Min } from 'class-validator';
import type { FindOptionsRelations } from 'typeorm';
import type { Ride } from '../../entities/ride.entity.js';
import { BusType } from '../buses/enums.js';
import { BusResponse } from '../buses/types.js';
import { CityResponse } from '../cities/types.js';

export const RIDE_RELATIONS: FindOptionsRelations<Ride> = {
  originCity: true,
  destinationCity: true,
  bus: { company: true },
};

export class SearchRidesQueryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  originCityId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationCityId: number;

  @ApiProperty({ example: '2026-11-12', description: 'YYYY-MM-DD (UTC day)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  date: string;
}

export class RideResponse {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ type: () => CityResponse })
  origin: CityResponse;

  @ApiProperty({ type: () => CityResponse })
  destination: CityResponse;

  @ApiProperty()
  departureAt: Date;

  @ApiProperty()
  arrivalAt: Date;

  @ApiProperty({ example: 210 })
  durationMinutes: number;

  @ApiProperty({ example: '600.00' })
  price: string;

  @ApiProperty({ type: () => BusResponse })
  bus: BusResponse;
}

export class RideSearchResponse {
  @ApiProperty({ type: () => CityResponse })
  origin: CityResponse;

  @ApiProperty({ type: () => CityResponse })
  destination: CityResponse;

  @ApiProperty({ example: '2026-11-12' })
  date: string;

  @ApiProperty({ type: () => [RideResponse] })
  rides: RideResponse[];
}

export class TakenSeatResponse {
  @ApiProperty({ example: 5 })
  row: number;

  @ApiProperty({ example: 3 })
  column: number;

  @ApiProperty()
  isMine: boolean;
}

export class SeatMapResponse {
  @ApiProperty({ example: 8 })
  rows: number;

  @ApiProperty({ example: 4 })
  columns: number;

  @ApiProperty({ enum: BusType, enumName: 'BusType' })
  busType: BusType;

  @ApiProperty({ type: () => [TakenSeatResponse] })
  taken: TakenSeatResponse[];
}
