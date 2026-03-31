import { Controller, Get, Post, Body, Param, Request, HttpException, HttpStatus } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

/**
 * Staff Dashboard Controller
 * 
 * Handles staff panel routes with staff role requirements
 * Staff can access dashboard, inventory, and wastage management
 */

@Controller('staff')
@Roles('staff', 'admin')
export class StaffController {
  /**
   * Staff dashboard
   * Shows operational metrics relevant to staff
   */
  @Get('dashboard')
  async getDashboard(@Request() req: any): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        message: 'Staff Dashboard',
        user: req.user,
        metrics: {
          orders_today: 0,
          items_prepared: 0,
          wastage_today: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * View inventory
   * Staff can view real-time inventory levels
   */
  @Get('inventory')
  async getInventory(): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        inventory: [],
        total_items: 0,
        low_stock_count: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update inventory item quantity
   */
  @Post('inventory/:id/update')
  async updateInventory(
    @Param('id') id: string,
    @Body() body: { quantity: number; reason?: string },
  ): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        message: 'Inventory updated',
        item_id: id,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * View wastage records
   * Staff can view and report wastage
   */
  @Get('wastage')
  async getWastage(): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        wastage: [],
        total_wastage: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record wastage item
   */
  @Post('wastage')
  async reportWastage(
    @Body() body: { item_id: string; quantity: number; reason: string },
  ): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        message: 'Wastage recorded',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * View orders
   * Staff can view orders to prepare
   */
  @Get('orders')
  async getOrders(): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        orders: [],
        pending: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update order status
   * Staff can mark orders as prepared, ready, etc.
   */
  @Post('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        message: 'Order status updated',
        order_id: id,
        new_status: body.status,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
