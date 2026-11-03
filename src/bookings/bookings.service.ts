import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/is-unique-violation.js';
import { Booking } from '../entities/booking.entity.js';
import type { Bus } from '../entities/bus.entity.js';
import { Ride } from '../entities/ride.entity.js';
import { PaymentsService } from '../payments/payments.service.js';
import {
  BOOKING_RELATIONS,
  BOOKING_SEAT_UNIQUE_CONSTRAINT,
  type BookingResponse,
  type CreateBookingDto,
} from '../types/bookings/types.js';
import { toBookingResponse } from './booking.mapper.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(
    userId: number,
    dto: CreateBookingDto,
  ): Promise<BookingResponse> {
    const bookingId = await this.purchaseSeat(userId, dto);
    const booking = await this.bookingsRepository.findOneOrFail({
      where: { id: bookingId },
      relations: BOOKING_RELATIONS,
    });

    return toBookingResponse(booking);
  }

  async findByUser(userId: number): Promise<BookingResponse[]> {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
      relations: BOOKING_RELATIONS,
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    return bookings.map(toBookingResponse);
  }

  findByRide(rideId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { rideId },
      select: { seatRow: true, seatColumn: true, userId: true },
    });
  }

  /** Payment and booking commit together; a taken seat rolls back both. */
  private async purchaseSeat(
    userId: number,
    dto: CreateBookingDto,
  ): Promise<number> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const ride = await this.getBookableRide(manager, dto.rideId);
        assertSeatInLayout(dto, ride.bus);

        const payment = await this.paymentsService.charge(manager, {
          userId,
          card: dto.card,
          amount: ride.price,
        });
        const booking = await manager.save(
          manager.create(Booking, {
            userId,
            rideId: ride.id,
            paymentId: payment.id,
            seatRow: dto.seatRow,
            seatColumn: dto.seatColumn,
          }),
        );

        return booking.id;
      });
    } catch (error) {
      if (isUniqueViolation(error, BOOKING_SEAT_UNIQUE_CONSTRAINT)) {
        throw new ConflictException('This seat is already taken');
      }
      throw error;
    }
  }

  private async getBookableRide(
    manager: EntityManager,
    rideId: number,
  ): Promise<Ride> {
    const ride = await manager.findOne(Ride, {
      where: { id: rideId },
      relations: { bus: true },
    });

    if (!ride) {
      throw new NotFoundException(`Ride ${rideId} not found`);
    }
    if (ride.departureAt <= new Date()) {
      throw new BadRequestException('This ride has already departed');
    }

    return ride;
  }
}

function assertSeatInLayout(dto: CreateBookingDto, bus: Bus): void {
  if (dto.seatRow > bus.rows || dto.seatColumn > bus.columns) {
    throw new BadRequestException(
      `Seat must be within ${bus.rows} rows and ${bus.columns} columns`,
    );
  }
}
