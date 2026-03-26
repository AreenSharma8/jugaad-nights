import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PartyOrderItem } from './party-order-item.entity';

@Entity('party_orders')
export class PartyOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'varchar' })
  customer_name: string;

  @Column({ type: 'varchar', nullable: true })
  customer_phone: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'varchar', nullable: true })
  event_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @OneToMany(() => PartyOrderItem, (item) => item.order, { eager: true })
  items: PartyOrderItem[];

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
