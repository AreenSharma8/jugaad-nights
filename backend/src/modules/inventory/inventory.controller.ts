import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, StockTransactionDto } from './dto/inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  async create(@Body() createDto: CreateInventoryItemDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.inventoryService.createItem(createDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get inventory by outlet' })
  async getByOutlet(@Query('outlet_id') outlet_id: string) {
    return this.inventoryService.getByOutlet(outlet_id);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  async getLowStock(@Query('outlet_id') outlet_id: string) {
    return this.inventoryService.getLowStockItems(outlet_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateInventoryItemDto) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.inventoryService.updateQuantity(id, updateDto, updated_by);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Record stock transaction' })
  async recordTransaction(@Body() transactionDto: StockTransactionDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.inventoryService.recordTransaction(transactionDto, created_by);
  }
}
