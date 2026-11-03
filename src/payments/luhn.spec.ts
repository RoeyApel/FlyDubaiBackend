import { describe, expect, it } from 'vitest';
import { passesLuhnCheck } from './luhn.js';

describe('passesLuhnCheck', () => {
  it.each(['4242424242424242', '5555555555554444', '79927398713'])(
    'accepts %s',
    (cardNumber) => {
      expect(passesLuhnCheck(cardNumber)).toBe(true);
    },
  );

  it.each(['4242424242424241', '1234567812345678', '79927398710'])(
    'rejects %s',
    (cardNumber) => {
      expect(passesLuhnCheck(cardNumber)).toBe(false);
    },
  );
});
