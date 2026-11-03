import { BusType } from '../buses/enums.js';

export interface SeedCity {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SeedBus {
  company: string;
  type: BusType;
  rows: number;
  columns: number;
}

export interface PlannedRide {
  originCityId: number;
  destinationCityId: number;
  busId: number;
  departureAt: Date;
  arrivalAt: Date;
  price: string;
}

export const SEED_DAYS = 14;
export const SEED_DEPARTURE_HOURS_UTC = [5, 8, 11, 14, 17];
export const SEED_INSERT_CHUNK_SIZE = 1000;

export const EARTH_RADIUS_KM = 6371;
export const ROAD_DISTANCE_FACTOR = 1.25;
export const AVERAGE_SPEED_KMH = 70;
export const DURATION_ROUNDING_MINUTES = 5;
export const BASE_FARE = 10;
export const FARE_PER_KM = 0.35;

export const SEED_CITIES: SeedCity[] = [
  { name: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818 },
  { name: 'Jerusalem', latitude: 31.7683, longitude: 35.2137 },
  { name: 'Haifa', latitude: 32.794, longitude: 34.9896 },
  { name: "Be'er Sheva", latitude: 31.2518, longitude: 34.7913 },
  { name: 'Eilat', latitude: 29.5577, longitude: 34.9519 },
  { name: 'Tiberias', latitude: 32.7959, longitude: 35.531 },
  { name: 'Netanya', latitude: 32.3215, longitude: 34.8532 },
  { name: 'Ashdod', latitude: 31.8044, longitude: 34.6553 },
];

export const SEED_BUSES: SeedBus[] = [
  { company: 'Egged', type: BusType.AC_SEATER_2_2, rows: 12, columns: 4 },
  { company: 'Egged', type: BusType.AC_SLEEPER_2_2, rows: 8, columns: 4 },
  { company: 'Egged', type: BusType.AC_SEATER_2_2, rows: 12, columns: 4 },
  { company: 'Dan', type: BusType.AC_SEATER_2_2, rows: 10, columns: 4 },
  { company: 'Dan', type: BusType.NON_AC_SEATER_2_2, rows: 12, columns: 4 },
  { company: 'Kavim', type: BusType.AC_SLEEPER_2_2, rows: 8, columns: 4 },
  { company: 'Kavim', type: BusType.AC_SEATER_2_2, rows: 11, columns: 4 },
  { company: 'Metropoline', type: BusType.AC_SEATER_2_2, rows: 12, columns: 4 },
  {
    company: 'Metropoline',
    type: BusType.NON_AC_SEATER_2_2,
    rows: 10,
    columns: 4,
  },
];
