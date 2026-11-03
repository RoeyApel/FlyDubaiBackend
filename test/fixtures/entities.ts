import { QueryFailedError } from 'typeorm';
import { Booking } from '../../src/entities/booking.entity.js';
import { BusCompany } from '../../src/entities/bus-company.entity.js';
import { Bus } from '../../src/entities/bus.entity.js';
import { City } from '../../src/entities/city.entity.js';
import { Payment } from '../../src/entities/payment.entity.js';
import { Ride } from '../../src/entities/ride.entity.js';
import { User } from '../../src/entities/user.entity.js';
import { BusType } from '../../src/types/buses/enums.js';

const CREATED_AT = new Date('2026-11-01T10:00:00.000Z');

export function buildUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 1,
    email: 'roey@example.com',
    name: 'Roey Apel',
    passwordHash: 'hash',
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildCity(overrides: Partial<City> = {}): City {
  return Object.assign(new City(), {
    id: 1,
    name: 'Tel Aviv',
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildBus(overrides: Partial<Bus> = {}): Bus {
  const company = Object.assign(new BusCompany(), {
    id: 1,
    name: 'Egged',
    createdAt: CREATED_AT,
  });

  return Object.assign(new Bus(), {
    id: 3,
    companyId: company.id,
    company,
    type: BusType.AC_SLEEPER_2_2,
    rows: 8,
    columns: 4,
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildRide(overrides: Partial<Ride> = {}): Ride {
  const originCity = buildCity({ id: 1, name: 'Tel Aviv' });
  const destinationCity = buildCity({ id: 2, name: 'Jerusalem' });
  const bus = buildBus();

  return Object.assign(new Ride(), {
    id: 7,
    originCityId: originCity.id,
    originCity,
    destinationCityId: destinationCity.id,
    destinationCity,
    busId: bus.id,
    bus,
    departureAt: new Date('2026-11-12T09:00:00.000Z'),
    arrivalAt: new Date('2026-11-12T12:30:00.000Z'),
    price: '600.00',
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return Object.assign(new Payment(), {
    id: 20,
    userId: 1,
    transactionNumber: 'TXN-8F3K2Q9D',
    amount: '600.00',
    cardLast4: '4242',
    cardHolderName: 'Roey Apel',
    paidAt: CREATED_AT,
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const ride = buildRide();
  const payment = buildPayment();

  return Object.assign(new Booking(), {
    id: 12,
    userId: 1,
    rideId: ride.id,
    ride,
    paymentId: payment.id,
    payment,
    seatRow: 5,
    seatColumn: 3,
    createdAt: CREATED_AT,
    ...overrides,
  });
}

export function buildUniqueViolation(constraint: string): QueryFailedError {
  const driverError = Object.assign(new Error('duplicate key value'), {
    code: '23505',
    constraint,
  });

  return new QueryFailedError('INSERT', [], driverError);
}
