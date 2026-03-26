import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Outlet, OutletConfig } from './entities';
import { CreateOutletDto, UpdateOutletDto } from './dto/outlet.dto';
import { OutletRepository } from './repositories/outlet.repository';

@Injectable()
export class OutletsService {
  private readonly logger = new Logger(OutletsService.name);
  private readonly outletRepository: OutletRepository;

  constructor(private dataSource: DataSource) {
    this.outletRepository = new OutletRepository(dataSource);
  }

  async create(createOutletDto: CreateOutletDto, created_by: string): Promise<Outlet> {
    const outlet = this.outletRepository.create({
      name: createOutletDto.name,
      address: createOutletDto.address,
      phone: createOutletDto.phone,
      email: createOutletDto.email,
      created_by,
      updated_by: created_by,
    });

    const savedOutlet = await this.outletRepository.save(outlet);

    // Create outlet config if provided
    if (createOutletDto.config) {
      const configRepo = this.dataSource.getRepository(OutletConfig);
      const config = configRepo.create({
        outlet_id: savedOutlet.id,
        ...createOutletDto.config,
        created_by,
        updated_by: created_by,
      });
      await configRepo.save(config);
    }

    return this.findById(savedOutlet.id);
  }

  async findAll(): Promise<Outlet[]> {
    return this.outletRepository.findAll();
  }

  async findById(id: string): Promise<Outlet> {
    const outlet = await this.outletRepository.findByIdWithConfig(id);
    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }
    return outlet;
  }

  async update(
    id: string,
    updateOutletDto: UpdateOutletDto,
    updated_by: string,
  ): Promise<Outlet> {
    const outlet = await this.findById(id);

    Object.assign(outlet, {
      name: updateOutletDto.name ?? outlet.name,
      address: updateOutletDto.address ?? outlet.address,
      phone: updateOutletDto.phone ?? outlet.phone,
      email: updateOutletDto.email ?? outlet.email,
      is_active: updateOutletDto.is_active ?? outlet.is_active,
      updated_by,
      updated_at: new Date(),
    });

    const updatedOutlet = await this.outletRepository.save(outlet);

    // Update config if provided
    if (updateOutletDto.config) {
      const configRepo = this.dataSource.getRepository(OutletConfig);
      let config = await configRepo.findOne({
        where: { outlet_id: id },
      });

      if (!config) {
        config = configRepo.create({
          outlet_id: id,
          ...updateOutletDto.config,
          created_by: updated_by,
          updated_by,
        });
      } else {
        Object.assign(config, updateOutletDto.config, { updated_by });
      }

      await configRepo.save(config);
    }

    return this.findById(updatedOutlet.id);
  }

  async remove(id: string, updated_by: string): Promise<void> {
    const outlet = await this.findById(id);
    outlet.deleted_at = new Date();
    outlet.updated_by = updated_by;
    await this.outletRepository.save(outlet);
  }
}
