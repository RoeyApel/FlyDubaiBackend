import { describe, expect, it } from 'vitest';
import { buildRide } from '../../test/fixtures/entities.js';
import { BusType } from '../types/buses/enums.js';
import { toRideResponse } from './ride.mapper.js';

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
