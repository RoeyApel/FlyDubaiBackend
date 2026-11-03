import { BadRequestException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateTransactionNumber,
  isCardExpired,
} from '../../src/payments/card.utils.js';
import { passesLuhnCheck } from '../../src/payments/luhn.js';
import { PaymentsService } from '../../src/payments/payments.service.js';
import type { CardDto } from '../../src/types/payments/types.js';

const NOW = new Date('2026-11-03T12:00:00.000Z');

const cardDto: CardDto = {
  number: '4242424242424242',
  holderName: 'Roey Apel',
  expiryMonth: 12,
  expiryYear: 2028,
  cvv: '123',
};

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

describe('isCardExpired', () => {
  it('treats the current month as still valid', () => {
    expect(isCardExpired(11, 2026, NOW)).toBe(false);
  });

  it('accepts a future month or year', () => {
    expect(isCardExpired(12, 2026, NOW)).toBe(false);
    expect(isCardExpired(1, 2027, NOW)).toBe(false);
  });

  it('rejects a past month or year', () => {
    expect(isCardExpired(10, 2026, NOW)).toBe(true);
    expect(isCardExpired(12, 2025, NOW)).toBe(true);
  });
});

describe('generateTransactionNumber', () => {
  it('returns TXN- followed by 8 unambiguous characters', () => {
    expect(generateTransactionNumber()).toMatch(/^TXN-[A-HJ-NP-Z2-9]{8}$/);
  });

  it('returns a different number each call', () => {
    const numbers = new Set(
      Array.from({ length: 100 }, () => generateTransactionNumber()),
    );

    expect(numbers.size).toBe(100);
  });
});

describe('PaymentsService', () => {
  const manager = {
    create: vi.fn((_entity: unknown, data: object) => data),
    save: vi.fn((data: object) => Promise.resolve({ id: 20, ...data })),
  };
  const service = new PaymentsService();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records the payment with only the last 4 card digits', async () => {
    const payment = await service.charge(manager as unknown as EntityManager, {
      userId: 1,
      card: cardDto,
      amount: '600.00',
    });

    expect(payment).toEqual({
      id: 20,
      userId: 1,
      transactionNumber: expect.stringMatching(/^TXN-/),
      amount: '600.00',
      cardLast4: '4242',
      cardHolderName: 'Roey Apel',
      paidAt: NOW,
    });
  });

  it('rejects an expired card without saving anything', async () => {
    await expect(
      service.charge(manager as unknown as EntityManager, {
        userId: 1,
        card: { ...cardDto, expiryMonth: 10, expiryYear: 2026 },
        amount: '600.00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
