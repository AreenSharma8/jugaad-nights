import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Outlet } from './outlet.entity';

@Entity('outlet_config')
export class OutletConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @OneToOne(() => Outlet, (outlet) => outlet.config)
  @JoinColumn({ name: 'outlet_id' })
  outlet: Outlet;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  business_hours: string;

  @Column({ type: 'integer', nullable: true })
  max_capacity: number;

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
