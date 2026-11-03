import { BadRequestException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardDto } from '../types/payments/types.js';
import { PaymentsService } from './payments.service.js';

const NOW = new Date('2026-11-03T12:00:00.000Z');

const card: CardDto = {
  number: '4242424242424242',
  holderName: 'Roey Apel',
  expiryMonth: 12,
  expiryYear: 2028,
  cvv: '123',
};

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
      card,
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
        card: { ...card, expiryMonth: 10, expiryYear: 2026 },
        amount: '600.00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
