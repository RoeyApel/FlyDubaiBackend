import { describe, expect, it } from 'vitest';
import { SEED_DAYS, SEED_DEPARTURE_HOURS_UTC } from '../../types/seed/types.js';
import { distanceKm, fare, planRides, travelMinutes } from './ride-plan.js';

const telAviv = {
  id: 1,
  name: 'Tel Aviv',
  latitude: 32.0853,
  longitude: 34.7818,
};
const jerusalem = {
  id: 2,
  name: 'Jerusalem',
  latitude: 31.7683,
  longitude: 35.2137,
};
const haifa = { id: 3, name: 'Haifa', latitude: 32.794, longitude: 34.9896 };

describe('distanceKm', () => {
  it('computes the great-circle distance', () => {
    expect(distanceKm(telAviv, jerusalem)).toBeCloseTo(54, 0);
  });
});

describe('travelMinutes', () => {
  it('rounds to 5 minutes at 70 km/h', () => {
    expect(travelMinutes(70)).toBe(60);
    expect(travelMinutes(73)).toBe(65);
  });

  it('never returns zero', () => {
    expect(travelMinutes(0)).toBe(5);
  });
});

describe('fare', () => {
  it('rounds base fare plus distance to half a shekel', () => {
    expect(fare(100)).toBe('45.00');
    expect(fare(101)).toBe('45.50');
  });
});

describe('planRides', () => {
  const startDay = new Date('2026-11-03T00:00:00.000Z');
  const rides = planRides([telAviv, jerusalem, haifa], [10, 11], startDay);

  it('plans every ordered city pair at each departure hour, every day', () => {
    expect(rides).toHaveLength(SEED_DAYS * SEED_DEPARTURE_HOURS_UTC.length * 6);
    expect(
      rides.every((ride) => ride.originCityId !== ride.destinationCityId),
    ).toBe(true);
  });

  it('departs at the configured UTC hours and arrives later', () => {
    for (const ride of rides) {
      expect(SEED_DEPARTURE_HOURS_UTC).toContain(
        ride.departureAt.getUTCHours(),
      );
      expect(ride.arrivalAt.getTime()).toBeGreaterThan(
        ride.departureAt.getTime(),
      );
    }
  });

  it('spreads rides across the given buses', () => {
    expect(new Set(rides.map((ride) => ride.busId))).toEqual(new Set([10, 11]));
  });
});
