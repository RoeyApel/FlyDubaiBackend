import type { City } from '../entities/city.entity.js';
import type { CityResponse } from '../types/cities/types.js';

export function toCityResponse(city: City): CityResponse {
  return { id: city.id, name: city.name };
}
