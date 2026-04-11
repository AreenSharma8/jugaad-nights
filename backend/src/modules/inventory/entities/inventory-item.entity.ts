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
import { StockTransaction } from './stock-transaction.entity';
import { Outlet } from '../../outlets/entities/outlet.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @Column({ type: 'varchar' })
  item_name: string;

  @Column({ type: 'varchar' })
  item_code: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  current_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  reorder_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  min_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  max_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost: number;

  @OneToMany(() => StockTransaction, (transaction) => transaction.item)
  transactions: StockTransaction[];

  @ManyToOne(() => Outlet, { eager: true })
  outlet: Outlet;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
