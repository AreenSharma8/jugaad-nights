import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findByName(name: string, outlet_id: string): Promise<Role | null> {
    return this.findOne({
      where: { name, outlet_id, deleted_at: IsNull() },
      relations: ['permissions'],
    });
  }

  async findByIdWithPermissions(id: string): Promise<Role | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['permissions'],
    });
  }

  async findByOutlet(outlet_id: string): Promise<Role[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['permissions'],
    });
  }
}
