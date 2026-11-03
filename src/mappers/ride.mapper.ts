import { toBusResponse } from './bus.mapper.js';
import { toCityResponse } from './city.mapper.js';
import type { Ride } from '../entities/ride.entity.js';
import { MS_PER_MINUTE } from '../types/common/types.js';
import type { RideResponse } from '../types/rides/types.js';

export function toRideResponse(ride: Ride): RideResponse {
  return {
    id: ride.id,
    origin: toCityResponse(ride.originCity),
    destination: toCityResponse(ride.destinationCity),
    departureAt: ride.departureAt,
    arrivalAt: ride.arrivalAt,
    durationMinutes: Math.round(
      (ride.arrivalAt.getTime() - ride.departureAt.getTime()) / MS_PER_MINUTE,
    ),
    price: ride.price,
    bus: toBusResponse(ride.bus),
  };
}
