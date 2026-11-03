import { BadRequestException, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Payment } from '../entities/payment.entity.js';
import type { ChargeData } from '../types/payments/types.js';
import { generateTransactionNumber, isCardExpired } from './card.utils.js';

/** Mock gateway: validates the card and records the payment, charges nothing. */
@Injectable()
export class PaymentsService {
  async charge(manager: EntityManager, data: ChargeData): Promise<Payment> {
    const now = new Date();

    if (isCardExpired(data.card.expiryMonth, data.card.expiryYear, now)) {
      throw new BadRequestException('The card has expired');
    }

    return manager.save(
      manager.create(Payment, {
        userId: data.userId,
        transactionNumber: generateTransactionNumber(),
        amount: data.amount,
        cardLast4: data.card.number.slice(-4),
        cardHolderName: data.card.holderName,
        paidAt: now,
      }),
    );
  }
}
