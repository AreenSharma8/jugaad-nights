import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Outlet } from '../../outlets/entities/outlet.entity';

export type ReportType = 'pdf' | 'excel' | 'summary';
export type ReportStatus = 'pending' | 'completed' | 'failed';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @ManyToOne(() => Outlet)
  @JoinColumn({ name: 'outlet_id' })
  outlet: Outlet;

  @Column('varchar', { length: 20 })
  report_type: ReportType;

  @Column('varchar', { length: 100 })
  report_name: string;

  @Column('varchar', { length: 255, nullable: true })
  filename: string;

  @Column('varchar', { length: 500, nullable: true })
  file_path: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status: ReportStatus;

  @Column('text', { nullable: true })
  error_message: string;

  @Column('int', { nullable: true })
  file_size_bytes: number;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column('uuid')
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
