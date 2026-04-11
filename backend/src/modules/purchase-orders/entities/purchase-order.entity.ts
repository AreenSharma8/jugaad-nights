import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @Column()
  po_number: string;

  @Column()
  supplier_name: string;

  @Column('timestamp')
  order_date: Date;

  @Column('timestamp')
  delivery_date: Date;

  @Column('numeric', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ default: 'Pending' })
  status: 'Pending' | 'Confirmed' | 'Delivered';

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchase_order, {
    cascade: true,
  })
  items: PurchaseOrderItem[];

  @Column('uuid', { nullable: true })
  created_by: string;

  @Column('uuid', { nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
