import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { FindOperator, Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingsService } from '../../src/bookings/bookings.service.js';
import type { CitiesService } from '../../src/cities/cities.service.js';
import type { Ride } from '../../src/entities/ride.entity.js';
import { toRideResponse } from '../../src/mappers/ride.mapper.js';
import { RidesService } from '../../src/rides/rides.service.js';
import { BusType } from '../../src/types/buses/enums.js';
import { SearchRidesQueryDto } from '../../src/types/rides/types.js';
import { buildBooking, buildCity, buildRide } from '../fixtures/entities.js';
import { validateDto } from '../fixtures/validation.js';

const NOW = new Date('2026-11-12T10:30:00.000Z');

describe('RidesService', () => {
  const ridesRepository = { find: vi.fn(), findOne: vi.fn() };
  const citiesService = { getById: vi.fn() };
  const bookingsService = { findByRide: vi.fn() };
  const service = new RidesService(
    ridesRepository as unknown as Repository<Ride>,
    citiesService as unknown as CitiesService,
    bookingsService as unknown as BookingsService,
  );

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('search', () => {
    const searchRidesQueryDto = {
      originCityId: 1,
      destinationCityId: 2,
      date: '2026-11-12',
    };

    beforeEach(() => {
      citiesService.getById.mockImplementation((id: number) =>
        Promise.resolve(
          buildCity({ id, name: id === 1 ? 'Tel Aviv' : 'Jerusalem' }),
        ),
      );
    });

    it('rejects identical origin and destination', async () => {
      await expect(
        service.search({ ...searchRidesQueryDto, destinationCityId: 1 }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(citiesService.getById).not.toHaveBeenCalled();
    });

    it('propagates an unknown city', async () => {
      citiesService.getById.mockRejectedValue(new NotFoundException());

      await expect(service.search(searchRidesQueryDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns rides of that UTC day that have not departed yet', async () => {
      ridesRepository.find.mockResolvedValue([buildRide()]);

      const response = await service.search(searchRidesQueryDto);

      const { where, order } = ridesRepository.find.mock.calls[0][0];
      const bounds = (where.departureAt as FindOperator<FindOperator<Date>[]>)
        .value;
      expect(bounds.map((bound) => [bound.type, bound.value])).toEqual([
        ['moreThanOrEqual', new Date('2026-11-12T00:00:00.000Z')],
        ['moreThan', NOW],
        ['lessThan', new Date('2026-11-13T00:00:00.000Z')],
      ]);
      expect(where).toMatchObject({ originCityId: 1, destinationCityId: 2 });
      expect(order).toEqual({ departureAt: 'ASC' });
      expect(response).toMatchObject({
        origin: { id: 1, name: 'Tel Aviv' },
        destination: { id: 2, name: 'Jerusalem' },
        date: '2026-11-12',
        rides: [{ id: 7, durationMinutes: 210 }],
      });
    });
  });

  describe('findById', () => {
    it('throws when the ride does not exist', async () => {
      ridesRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(7)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getSeatMap', () => {
    it('returns the layout and marks the caller’s own seats', async () => {
      ridesRepository.findOne.mockResolvedValue(buildRide());
      bookingsService.findByRide.mockResolvedValue([
        buildBooking({ userId: 1, seatRow: 5, seatColumn: 3 }),
        buildBooking({ userId: 2, seatRow: 1, seatColumn: 1 }),
      ]);

      await expect(service.getSeatMap(7, 1)).resolves.toEqual({
        rows: 8,
        columns: 4,
        busType: BusType.AC_SLEEPER_2_2,
        taken: [
          { row: 5, column: 3, isMine: true },
          { row: 1, column: 1, isMine: false },
        ],
      });
    });

    it('throws when the ride does not exist', async () => {
      ridesRepository.findOne.mockResolvedValue(null);

      await expect(service.getSeatMap(7, 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});

describe('toRideResponse', () => {
  it('maps a ride with its cities, bus and computed duration', () => {
    expect(toRideResponse(buildRide())).toEqual({
      id: 7,
      origin: { id: 1, name: 'Tel Aviv' },
      destination: { id: 2, name: 'Jerusalem' },
      departureAt: new Date('2026-11-12T09:00:00.000Z'),
      arrivalAt: new Date('2026-11-12T12:30:00.000Z'),
      durationMinutes: 210,
      price: '600.00',
      bus: {
        id: 3,
        type: BusType.AC_SLEEPER_2_2,
        company: { id: 1, name: 'Egged' },
      },
    });
  });
});

describe('SearchRidesQueryDto', () => {
  const valid = {
    originCityId: '1',
    destinationCityId: '2',
    date: '2026-11-12',
  };

  it('converts query-string ids to numbers', async () => {
    const { dto: searchRidesQueryDto, errors } = await validateDto(
      SearchRidesQueryDto,
      valid,
    );

    expect(errors).toEqual([]);
    expect(searchRidesQueryDto.originCityId).toBe(1);
    expect(searchRidesQueryDto.destinationCityId).toBe(2);
  });

  it.each([
    ['a missing origin', { originCityId: undefined }, 'originCityId'],
    [
      'a non-numeric destination',
      { destinationCityId: 'abc' },
      'destinationCityId',
    ],
    ['an impossible date', { date: '2026-02-30' }, 'date'],
    ['a date with a time', { date: '2026-11-12T10:00' }, 'date'],
    ['a non-ISO date', { date: '12/11/2026' }, 'date'],
  ])('rejects %s', async (_case, override, field) => {
    const { errors } = await validateDto(SearchRidesQueryDto, {
      ...valid,
      ...override,
    });

    expect(new Set(errors)).toEqual(new Set([field]));
  });
});
