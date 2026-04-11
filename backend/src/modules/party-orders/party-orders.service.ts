import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PartyOrder, PartyOrderItem } from './entities';
import { CreatePartyOrderDto } from './dto/party-order.dto';
import { PartyOrderRepository } from './repositories/party-order.repository';

@Injectable()
export class PartyOrdersService {
  private readonly partyOrderRepository: PartyOrderRepository;

  constructor(private dataSource: DataSource) {
    this.partyOrderRepository = new PartyOrderRepository(dataSource);
  }

  async createOrder(createDto: CreatePartyOrderDto, created_by: string): Promise<PartyOrder> {
    const itemsRepo = this.dataSource.getRepository(PartyOrderItem);
    
    // Handle items if provided, otherwise create empty items array
    const items = (createDto.items && createDto.items.length > 0)
      ? createDto.items.map((item) =>
          itemsRepo.create({
            ...item,
            total_price: item.quantity * item.unit_price,
            created_by,
          }),
        )
      : [];

    // Calculate total amount from items or use provided total_amount
    const totalAmount = createDto.total_amount || 
      (items.length > 0 
        ? items.reduce((sum, item) => sum + parseFloat(item.total_price as any), 0)
        : 0);

    // Use client_name or customer_name, client_phone or customer_phone
    const customerName = createDto.client_name || createDto.customer_name || 'N/A';
    const customerPhone = createDto.client_phone || createDto.customer_phone;
    const customerId = createDto.customer_id || undefined;

    const order = this.partyOrderRepository.create({
      outlet_id: createDto.outlet_id,
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: customerPhone,
      event_date: createDto.event_date,
      event_type: createDto.event_type,
      total_amount: totalAmount as any,
      status: createDto.status || 'pending',
      items,
      created_by,
      updated_by: created_by,
    });

    return this.partyOrderRepository.save(order);
  }

  async getByOutlet(outlet_id: string): Promise<PartyOrder[]> {
    return this.partyOrderRepository.findByOutlet(outlet_id);
  }

  async getById(id: string): Promise<PartyOrder> {
    const order = await this.partyOrderRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string, updated_by: string): Promise<PartyOrder> {
    const order = await this.getById(id);
    order.status = status;
    order.updated_by = updated_by;
    return this.partyOrderRepository.save(order);
  }
}
