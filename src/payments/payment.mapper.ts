import type { Payment } from '../entities/payment.entity.js';
import type { PaymentResponse } from '../types/payments/types.js';

export function toPaymentResponse(payment: Payment): PaymentResponse {
  return {
    transactionNumber: payment.transactionNumber,
    amount: payment.amount,
    cardLast4: payment.cardLast4,
    paidAt: payment.paidAt,
  };
}
