import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bus } from './bus.entity.js';
import { City } from './city.entity.js';

@Entity('rides')
@Index(['originCityId', 'destinationCityId', 'departureAt'])
@Check('"origin_city_id" <> "destination_city_id"')
@Check('"arrival_at" > "departure_at"')
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'origin_city_id' })
  originCityId: number;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'origin_city_id' })
  originCity: City;

  @Column({ name: 'destination_city_id' })
  destinationCityId: number;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'destination_city_id' })
  destinationCity: City;

  @Column({ name: 'bus_id' })
  busId: number;

  @ManyToOne(() => Bus, { nullable: false })
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @Column({ name: 'departure_at', type: 'timestamptz' })
  departureAt: Date;

  @Column({ name: 'arrival_at', type: 'timestamptz' })
  arrivalAt: Date;

  /** pg returns `numeric` as a string to avoid float rounding. */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
