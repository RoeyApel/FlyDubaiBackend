import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity.js';

/** Only the last 4 card digits are kept; the full number and CVV never are. */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'transaction_number', unique: true })
  transactionNumber: string;

  /** pg returns `numeric` as a string to avoid float rounding. */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'card_last4', type: 'char', length: 4 })
  cardLast4: string;

  @Column({ name: 'card_holder_name' })
  cardHolderName: string;

  @Column({ name: 'paid_at', type: 'timestamptz' })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
