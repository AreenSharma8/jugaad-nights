/**
 * Petpooja Webhook Events Controller
 * Handles real-time order data from Petpooja POS
 */

import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { PetpoojaEventsService } from '../services/petpooja-events.service';
import { PetpoojaWebhookPayload, PetpoojaWebhookResponse } from '../dto/petpooja.dto';

@ApiTags('Integrations - Petpooja')
@Controller('integrations/petpooja')
export class PetpoojaWebhookController {
  private readonly logger = new Logger(PetpoojaWebhookController.name);

  constructor(private readonly petpoojaEventsService: PetpoojaEventsService) {}

  /**
   * PUBLIC endpoint for Petpooja webhook
   * Receives real-time order data from Petpooja POS
   * 
   * Endpoint: POST /integrations/petpooja/webhook
   * Authentication: Optional token validation (can be non-authenticated)
   * 
   * Payload structure:
   * {
   *   "event": "orderdetails",
   *   "Restaurant": { "name": "...", "restID": "..." },
   *   "Customer": { "name": "...", "phone": "..." },
   *   "Order": { "order_id": "...", "order_type": "...", ... },
   *   "OrderItem": [...],
   *   "Tax": [...],
   *   "Discount": [...]
   * }
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @ApiOperation({ 
    summary: 'Petpooja webhook endpoint for real-time order data',
    description: 'Receives order details from Petpooja POS when a bill is printed'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order processed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid payload' 
  })
  async handleWebhook(@Body() payload: PetpoojaWebhookPayload): Promise<PetpoojaWebhookResponse> {
    try {
      this.logger.log(`Received Petpooja webhook for order: ${payload.Order?.order_id}`);

      // Validate payload
      if (!payload.event || payload.event !== 'orderdetails') {
        throw new Error('Invalid event type. Expected: orderdetails');
      }

      if (!payload.Restaurant || !payload.Order || !payload.Customer) {
        throw new Error('Missing required payload fields: Restaurant, Order, or Customer');
      }

      // Process the webhook
      const result = await this.petpoojaEventsService.processOrderDetailsEvent(payload);

      return {
        status: 'success',
        message: 'Order data received and processed',
        order_id: result.order_id,
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);

      return {
        status: 'error',
        message: `Failed to process webhook: ${error.message}`,
      };
    }
  }

  /**
   * Health check endpoint for Petpooja integration
   */
  @Post('health')
  @Public()
  @ApiOperation({ summary: 'Petpooja integration health check' })
  async healthCheck(): Promise<{ status: 'healthy' }> {
    return { status: 'healthy' };
  }
}

export default PetpoojaWebhookController;
