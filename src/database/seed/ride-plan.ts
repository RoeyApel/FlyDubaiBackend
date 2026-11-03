import { MS_PER_DAY, MS_PER_MINUTE } from '../../types/common/types.js';
import {
  AVERAGE_SPEED_KMH,
  BASE_FARE,
  DURATION_ROUNDING_MINUTES,
  EARTH_RADIUS_KM,
  FARE_PER_KM,
  type PlannedRide,
  ROAD_DISTANCE_FACTOR,
  SEED_DAYS,
  SEED_DEPARTURE_HOURS_UTC,
  type SeedCity,
} from '../../types/seed/types.js';

const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export interface PlannableCity extends SeedCity {
  id: number;
}

export function distanceKm(from: SeedCity, to: SeedCity): number {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function travelMinutes(roadKm: number): number {
  const minutes = (roadKm / AVERAGE_SPEED_KMH) * 60;

  return (
    Math.max(1, Math.round(minutes / DURATION_ROUNDING_MINUTES)) *
    DURATION_ROUNDING_MINUTES
  );
}

export function fare(roadKm: number): string {
  const halfShekels = Math.round((BASE_FARE + roadKm * FARE_PER_KM) * 2);

  return (halfShekels / 2).toFixed(2);
}

/** Every ordered city pair, at each departure hour, for SEED_DAYS days. */
export function planRides(
  cities: PlannableCity[],
  busIds: number[],
  startDay: Date,
): PlannedRide[] {
  const rides: PlannedRide[] = [];

  for (let day = 0; day < SEED_DAYS; day++) {
    for (const hour of SEED_DEPARTURE_HOURS_UTC) {
      const departureMs =
        startDay.getTime() + day * MS_PER_DAY + hour * MS_PER_HOUR;

      for (const origin of cities) {
        for (const destination of cities) {
          if (origin.id === destination.id) {
            continue;
          }

          const roadKm = distanceKm(origin, destination) * ROAD_DISTANCE_FACTOR;

          rides.push({
            originCityId: origin.id,
            destinationCityId: destination.id,
            busId: busIds[rides.length % busIds.length],
            departureAt: new Date(departureMs),
            arrivalAt: new Date(
              departureMs + travelMinutes(roadKm) * MS_PER_MINUTE,
            ),
            price: fare(roadKm),
          });
        }
      }
    }
  }

  return rides;
}
