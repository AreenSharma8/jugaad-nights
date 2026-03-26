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
    const items = createDto.items.map((item) =>
      itemsRepo.create({
        ...item,
        total_price: item.quantity * item.unit_price,
        created_by,
      }),
    );

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_price as any), 0);

    const order = this.partyOrderRepository.create({
      outlet_id: createDto.outlet_id,
      customer_id: createDto.customer_id,
      customer_name: createDto.customer_name,
      customer_phone: createDto.customer_phone,
      event_date: createDto.event_date,
      event_type: createDto.event_type,
      total_amount: totalAmount as any,
      status: 'pending',
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
