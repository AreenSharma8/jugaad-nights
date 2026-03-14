import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email, deleted_at: IsNull() },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByOutlet(outlet_id: string): Promise<User[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['roles'],
    });
  }

  async findAllActive(): Promise<User[]> {
    return this.find({
      where: { is_active: true, deleted_at: IsNull() },
      relations: ['roles'],
    });
  }
}
