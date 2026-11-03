import { describe, expect, it } from 'vitest';
import { validateDto } from '../../../test/fixtures/validation.js';
import { CreateBookingDto } from './types.js';

const validCard = {
  number: '4242424242424242',
  holderName: 'Roey Apel',
  expiryMonth: 12,
  expiryYear: 2028,
  cvv: '123',
};

const valid = { rideId: 7, seatRow: 5, seatColumn: 3, card: validCard };

describe('CreateBookingDto', () => {
  it('accepts a valid booking', async () => {
    const { errors } = await validateDto(CreateBookingDto, valid);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a seat row below 1', { seatRow: 0 }, 'seatRow'],
    ['a fractional column', { seatColumn: 1.5 }, 'seatColumn'],
    ['a missing card', { card: undefined }, 'card'],
  ])('rejects %s', async (_case, override, field) => {
    const { errors } = await validateDto(CreateBookingDto, {
      ...valid,
      ...override,
    });

    expect(errors).toEqual([field]);
  });

  it.each([
    [
      'a number failing the Luhn check',
      { number: '4242424242424241' },
      'number',
    ],
    ['a number that is too short', { number: '424242424242' }, 'number'],
    ['a number with spaces', { number: '4242 4242 4242 4242' }, 'number'],
    ['a blank holder name', { holderName: '  ' }, 'holderName'],
    ['month 13', { expiryMonth: 13 }, 'expiryMonth'],
    ['a 2-digit cvv', { cvv: '12' }, 'cvv'],
    ['a 5-digit cvv', { cvv: '12345' }, 'cvv'],
  ])('rejects a card with %s', async (_case, override, field) => {
    const { errors } = await validateDto(CreateBookingDto, {
      ...valid,
      card: { ...validCard, ...override },
    });

    expect(errors).toEqual([`card.${field}`]);
  });
});
