import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('festivals')
export class Festival {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @Column({ type: 'varchar' })
  festival_name: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  expected_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actual_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  actual_expenses: number;

  @Column({ type: 'varchar', default: 'planning', enum: ['planning', 'active', 'completed'] })
  status: 'planning' | 'active' | 'completed';

  @Column({ type: 'text', nullable: true })
  notes: string;

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
