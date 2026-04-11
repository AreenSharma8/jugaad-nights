import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  purchase_order_id: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, {
    onDelete: 'CASCADE',
  })
  purchase_order: PurchaseOrder;

  @Column()
  item_name: string;

  @Column('numeric', { precision: 10, scale: 2 })
  quantity: number;

  @Column('numeric', { precision: 10, scale: 2 })
  unit_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
