import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Outlet } from '../../outlets/entities/outlet.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  order_type: string;

  @Column({ type: 'varchar', nullable: true })
  payment_type: string;

  @Column({ type: 'integer', nullable: true })
  order_number: number;

  @Column({ type: 'date', nullable: true })
  order_date: string;

  @Column({ type: 'json', nullable: true })
  customer_info: Record<string, any>;

  @OneToMany(() => OrderItem, (item) => item.order, { eager: true, cascade: ['insert', 'update'] })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order, { eager: true })
  payments: Payment[];

  @ManyToOne(() => Outlet, { eager: true })
  outlet: Outlet;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
