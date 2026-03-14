import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateOrderDto, CreatePaymentDto, SalesAnalyticsDto } from './dto/sales.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  private readonly logger = new Logger(SalesController.name);

  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.salesService.createOrder(createOrderDto, created_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for a outlet' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(@Query('outlet_id') outlet_id: string) {
    return this.salesService.getOrdersBySales(outlet_id);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get sales trends and analytics' })
  @ApiResponse({ status: 200, description: 'Sales trends retrieved successfully' })
  async getTrends(@Query('outlet_id') outlet_id: string, @Query('date') date?: string) {
    return this.salesService.getSalesTrends({
      outlet_id,
      date,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrder(@Param('id') id: string) {
    return this.salesService.getOrderById(id);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Add payment to an order' })
  @ApiResponse({ status: 201, description: 'Payment added successfully' })
  async addPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.salesService.addPayment(createPaymentDto, created_by);
  }
}
