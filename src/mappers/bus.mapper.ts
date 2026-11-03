import type { Bus } from '../entities/bus.entity.js';
import type { BusResponse } from '../types/buses/types.js';

export function toBusResponse(bus: Bus): BusResponse {
  return {
    id: bus.id,
    type: bus.type,
    company: { id: bus.company.id, name: bus.company.name },
  };
}
