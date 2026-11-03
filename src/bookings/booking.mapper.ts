import type { Booking } from '../entities/booking.entity.js';
import { toPaymentResponse } from '../payments/payment.mapper.js';
import { toRideResponse } from '../rides/ride.mapper.js';
import type { BookingResponse } from '../types/bookings/types.js';

export function toBookingResponse(booking: Booking): BookingResponse {
  return {
    id: booking.id,
    seat: { row: booking.seatRow, column: booking.seatColumn },
    ride: toRideResponse(booking.ride),
    payment: toPaymentResponse(booking.payment),
    createdAt: booking.createdAt,
  };
}
