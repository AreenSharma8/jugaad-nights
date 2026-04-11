import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PurchaseOrder, PurchaseOrderItem } from './entities';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    private readonly customPoRepository: PurchaseOrderRepository,
  ) {}

  async create(createDto: CreatePurchaseOrderDto, created_by: string) {
    const { items, ...poData } = createDto;

    const purchaseOrder = this.poRepository.create({
      ...poData,
      created_by,
      updated_by: created_by,
    });

    const savedPO = await this.poRepository.save(purchaseOrder);

    const poItems = items.map((item) =>
      this.poItemRepository.create({
        ...item,
        purchase_order_id: savedPO.id,
      }),
    );

    await this.poItemRepository.save(poItems);

    return this.customPoRepository.findByIdWithItems(savedPO.id);
  }

  async findAll(outlet_id?: string) {
    if (outlet_id) {
      return this.customPoRepository.findByOutlet(outlet_id);
    }

    return this.poRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string) {
    const purchaseOrder = await this.customPoRepository.findByIdWithItems(id);

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return purchaseOrder;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto, updated_by: string) {
    const purchaseOrder = await this.findById(id);

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    Object.assign(purchaseOrder, {
      ...updateDto,
      updated_by,
    });

    await this.poRepository.save(purchaseOrder);

    return this.customPoRepository.findByIdWithItems(id);
  }

  async updateStatus(id: string, status: 'Pending' | 'Confirmed' | 'Delivered', updated_by: string) {
    const purchaseOrder = await this.findById(id);

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    purchaseOrder.status = status;
    purchaseOrder.updated_by = updated_by;

    await this.poRepository.save(purchaseOrder);

    return this.customPoRepository.findByIdWithItems(id);
  }

  async remove(id: string, updated_by: string) {
    const purchaseOrder = await this.findById(id);

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    purchaseOrder.updated_by = updated_by;
    purchaseOrder.deleted_at = new Date();

    await this.poRepository.save(purchaseOrder);
  }
}
