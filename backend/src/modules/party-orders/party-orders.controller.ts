import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartyOrdersService } from './party-orders.service';
import { CreatePartyOrderDto } from './dto/party-order.dto';

@ApiTags('Party Orders')
@ApiBearerAuth()
@Controller('party-orders')
export class PartyOrdersController {
  constructor(private readonly partyOrdersService: PartyOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create party order' })
  async create(@Body() createDto: CreatePartyOrderDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.partyOrdersService.createOrder(createDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get party orders by outlet' })
  async getByOutlet(@Query('outlet_id') outlet_id: string) {
    return this.partyOrdersService.getByOutlet(outlet_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get party order by ID' })
  async getById(@Param('id') id: string) {
    return this.partyOrdersService.getById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update party order status' })
  async updateStatus(@Param('id') id: string, @Body() { status }: { status: string }) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.partyOrdersService.updateStatus(id, status, updated_by);
  }
}
