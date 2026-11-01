import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Payment } from './payment.entity.js';
import { Ride } from './ride.entity.js';
import { User } from './user.entity.js';

@Entity('bookings')
@Unique(['rideId', 'seatRow', 'seatColumn'])
@Index(['userId'])
@Check('"seat_row" >= 1')
@Check('"seat_column" >= 1')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'ride_id' })
  rideId: number;

  @ManyToOne(() => Ride, { nullable: false })
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column({ name: 'payment_id' })
  paymentId: number;

  @OneToOne(() => Payment, { nullable: false })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'seat_row', type: 'int' })
  seatRow: number;

  @Column({ name: 'seat_column', type: 'int' })
  seatColumn: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
