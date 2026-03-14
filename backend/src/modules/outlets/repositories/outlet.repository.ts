import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Outlet } from '../entities/outlet.entity';

@Injectable()
export class OutletRepository extends Repository<Outlet> {
  constructor(private dataSource: DataSource) {
    super(Outlet, dataSource.createEntityManager());
  }

  async findByIdWithConfig(id: string): Promise<Outlet | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['config'],
    });
  }

  async findAllActive(): Promise<Outlet[]> {
    return this.find({
      where: { is_active: true, deleted_at: IsNull() },
      relations: ['config'],
    });
  }

  async findAll(): Promise<Outlet[]> {
    return this.find({
      where: { deleted_at: IsNull() },
      relations: ['config'],
    });
  }
}
