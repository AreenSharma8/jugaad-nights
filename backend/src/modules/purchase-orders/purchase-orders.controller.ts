import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  private readonly logger = new Logger(PurchaseOrdersController.name);

  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async create(@Body() createDto: CreatePurchaseOrderDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.purchaseOrdersService.create(createDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  async findAll(@Query('outlet_id') outlet_id?: string) {
    return this.purchaseOrdersService.findAll(outlet_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.purchaseOrdersService.update(id, updateDto, updated_by);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({ status: 200, description: 'Purchase order status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'Pending' | 'Confirmed' | 'Delivered' }) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.purchaseOrdersService.updateStatus(id, body.status, updated_by);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order approved' })
  async approve(@Param('id') id: string) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.purchaseOrdersService.updateStatus(id, 'Confirmed', updated_by);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order rejected' })
  async reject(@Param('id') id: string) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.purchaseOrdersService.updateStatus(id, 'Pending', updated_by);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted successfully' })
  async remove(@Param('id') id: string) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    await this.purchaseOrdersService.remove(id, updated_by);
    return { message: 'Purchase order deleted successfully' };
  }
}
