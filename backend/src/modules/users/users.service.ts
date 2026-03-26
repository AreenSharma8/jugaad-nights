import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;

  constructor(private dataSource: DataSource) {
    this.userRepository = new UserRepository(dataSource);
    this.roleRepository = new RoleRepository(dataSource);
  }

  async create(createUserDto: CreateUserDto, created_by: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Verify roles exist
    const roles = await this.roleRepository.find({
      where: {
        id: createUserDto.role_ids as any,
        outlet_id: createUserDto.outlet_id,
      },
    });

    if (roles.length !== createUserDto.role_ids.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      roles,
      created_by,
      updated_by: created_by,
    });

    return this.userRepository.save(user);
  }

  async findAll(outlet_id?: string): Promise<User[]> {
    if (outlet_id) {
      return this.userRepository.findByOutlet(outlet_id);
    }
    return this.userRepository.find({
      where: { deleted_at: null as any },
      relations: ['roles'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithRelations(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updated_by: string,
  ): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.role_ids) {
      const roles = await this.roleRepository.find({
        where: { id: updateUserDto.role_ids as any },
      });

      if (roles.length !== updateUserDto.role_ids.length) {
        throw new BadRequestException('One or more roles do not exist');
      }

      user.roles = roles;
    }

    Object.assign(user, updateUserDto, { updated_by, updated_at: new Date() });
    return this.userRepository.save(user);
  }

  async remove(id: string, updated_by: string): Promise<void> {
    const user = await this.findById(id);
    user.deleted_at = new Date();
    user.updated_by = updated_by;
    await this.userRepository.save(user);
  }

  async assignRoles(
    userId: string,
    roleIds: string[],
    updated_by: string,
  ): Promise<User> {
    const user = await this.findById(userId);
    const roles = await this.roleRepository.find({
      where: { id: roleIds as any },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    user.roles = roles;
    user.updated_by = updated_by;
    return this.userRepository.save(user);
  }
}
