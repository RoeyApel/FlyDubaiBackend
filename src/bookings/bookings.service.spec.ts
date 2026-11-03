import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { DataSource, EntityManager, Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildBooking,
  buildPayment,
  buildRide,
  buildUniqueViolation,
} from '../../test/fixtures/entities.js';
import type { Booking } from '../entities/booking.entity.js';
import {
  BOOKING_SEAT_UNIQUE_CONSTRAINT,
  type CreateBookingDto,
} from '../types/bookings/types.js';
import { BookingsService } from './bookings.service.js';

const NOW = new Date('2026-11-03T12:00:00.000Z');

const dto: CreateBookingDto = {
  rideId: 7,
  seatRow: 5,
  seatColumn: 3,
  card: {
    number: '4242424242424242',
    holderName: 'Roey Apel',
    expiryMonth: 12,
    expiryYear: 2028,
    cvv: '123',
  },
};

describe('BookingsService', () => {
  const manager = {
    findOne: vi.fn(),
    create: vi.fn((_entity: unknown, data: object) => data),
    save: vi.fn((data: object) => Promise.resolve({ id: 12, ...data })),
  };
  const dataSource = {
    transaction: vi.fn(
      (work: (transactionManager: EntityManager) => Promise<unknown>) =>
        work(manager as unknown as EntityManager),
    ),
  };
  const bookingsRepository = { find: vi.fn(), findOneOrFail: vi.fn() };
  const paymentsService = { charge: vi.fn() };
  const service = new BookingsService(
    bookingsRepository as unknown as Repository<Booking>,
    dataSource as unknown as DataSource,
    paymentsService,
  );

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    manager.findOne.mockResolvedValue(buildRide());
    paymentsService.charge.mockResolvedValue(buildPayment());
    bookingsRepository.findOneOrFail.mockResolvedValue(buildBooking());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('charges the ride price and books the seat', async () => {
      const response = await service.create(1, dto);

      expect(paymentsService.charge).toHaveBeenCalledWith(manager, {
        userId: 1,
        card: dto.card,
        amount: '600.00',
      });
      expect(manager.save).toHaveBeenCalledWith({
        userId: 1,
        rideId: 7,
        paymentId: 20,
        seatRow: 5,
        seatColumn: 3,
      });
      expect(response).toMatchObject({
        id: 12,
        seat: { row: 5, column: 3 },
        ride: { id: 7 },
        payment: { transactionNumber: 'TXN-8F3K2Q9D', cardLast4: '4242' },
      });
    });

    it('throws when the ride does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.create(1, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(paymentsService.charge).not.toHaveBeenCalled();
    });

    it('rejects a ride that has already departed', async () => {
      manager.findOne.mockResolvedValue(
        buildRide({ departureAt: new Date('2026-11-03T11:00:00.000Z') }),
      );

      await expect(service.create(1, dto)).rejects.toThrow(
        new BadRequestException('This ride has already departed'),
      );
      expect(paymentsService.charge).not.toHaveBeenCalled();
    });

    it.each([
      ['row', { seatRow: 9 }],
      ['column', { seatColumn: 5 }],
    ])('rejects a %s outside the bus layout', async (_case, seat) => {
      await expect(
        service.create(1, { ...dto, ...seat }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(paymentsService.charge).not.toHaveBeenCalled();
    });

    it('turns a taken seat into a conflict', async () => {
      dataSource.transaction.mockRejectedValueOnce(
        buildUniqueViolation(BOOKING_SEAT_UNIQUE_CONSTRAINT),
      );

      await expect(service.create(1, dto)).rejects.toThrow(
        new ConflictException('This seat is already taken'),
      );
    });

    it('rethrows other errors', async () => {
      const error = new Error('connection lost');
      dataSource.transaction.mockRejectedValueOnce(error);

      await expect(service.create(1, dto)).rejects.toBe(error);
    });
  });

  describe('findByUser', () => {
    it('returns the user’s bookings newest first', async () => {
      bookingsRepository.find.mockResolvedValue([buildBooking()]);

      const bookings = await service.findByUser(1);

      expect(bookingsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          order: { createdAt: 'DESC', id: 'DESC' },
        }),
      );
      expect(bookings).toHaveLength(1);
      expect(bookings[0]).toMatchObject({ id: 12, ride: { id: 7 } });
    });
  });
});
