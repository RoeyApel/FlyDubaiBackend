import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { trim } from '../../common/validation/transforms.js';
import { IsLuhnNumber } from '../../payments/is-luhn-number.decorator.js';

export const TRANSACTION_NUMBER_PREFIX = 'TXN-';
export const TRANSACTION_CODE_LENGTH = 8;
// 32 symbols (no 0/O/1/I) so `byte % 32` picks each one with equal odds.
export const TRANSACTION_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class CardDto {
  @ApiProperty({ example: '4242424242424242', description: '13-19 digits' })
  @Matches(/^\d{13,19}$/, { message: 'number must be 13-19 digits' })
  @IsLuhnNumber()
  number: string;

  @ApiProperty({ example: 'Roey Apel' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  holderName: string;

  @ApiProperty({ example: 12, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiProperty({ example: 2028 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  expiryYear: number;

  @ApiProperty({ example: '123', description: '3-4 digits, never stored' })
  @Matches(/^\d{3,4}$/, { message: 'cvv must be 3-4 digits' })
  cvv: string;
}

export interface ChargeData {
  userId: number;
  card: CardDto;
  amount: string;
}

export class PaymentResponse {
  @ApiProperty({ example: 'TXN-8F3K2Q9D' })
  transactionNumber: string;

  @ApiProperty({ example: '600.00' })
  amount: string;

  @ApiProperty({ example: '4242' })
  cardLast4: string;

  @ApiProperty()
  paidAt: Date;
}
