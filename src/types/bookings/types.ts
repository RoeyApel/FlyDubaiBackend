import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsObject, Min, ValidateNested } from 'class-validator';
import type { FindOptionsRelations } from 'typeorm';
import type { Booking } from '../../entities/booking.entity.js';
import { CardDto, PaymentResponse } from '../payments/types.js';
import { RIDE_RELATIONS, RideResponse } from '../rides/types.js';

export const BOOKING_SEAT_UNIQUE_CONSTRAINT = 'UQ_bookings_ride_seat';

export const BOOKING_RELATIONS: FindOptionsRelations<Booking> = {
  ride: RIDE_RELATIONS,
  payment: true,
};

export class CreateBookingDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  rideId: number;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  seatRow: number;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  seatColumn: number;

  @ApiProperty({ type: () => CardDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

export class SeatResponse {
  @ApiProperty({ example: 5 })
  row: number;

  @ApiProperty({ example: 3 })
  column: number;
}

export class BookingResponse {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ type: () => SeatResponse })
  seat: SeatResponse;

  @ApiProperty({ type: () => RideResponse })
  ride: RideResponse;

  @ApiProperty({ type: () => PaymentResponse })
  payment: PaymentResponse;

  @ApiProperty()
  createdAt: Date;
}
