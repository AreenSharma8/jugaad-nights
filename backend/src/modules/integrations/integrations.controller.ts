import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PetpoojaIntegrationService } from './services/petpooja.service';
import { WhatsAppService } from './services/whatsapp.service';
import { TriggerPetpoojaSyncDto, WhatsAppNotificationDto } from './dto/integration.dto';

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly petpoojaService: PetpoojaIntegrationService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Post('petpooja/sync')
  @ApiOperation({ summary: 'Trigger PetPooja sync' })
  async triggerPetpoojaSync(@Body() dto: TriggerPetpoojaSyncDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.petpoojaService.triggerSync(
      dto.outlet_id,
      dto.sync_type,
      created_by,
    );
  }

  @Get('petpooja/history/:outlet_id')
  @ApiOperation({ summary: 'Get PetPooja sync history' })
  async getPetpoojaSyncHistory(@Param('outlet_id') outlet_id: string) {
    return this.petpoojaService.getSyncHistory(outlet_id);
  }

  @Post('whatsapp/send')
  @ApiOperation({ summary: 'Send WhatsApp notification' })
  async sendWhatsAppMessage(@Body() dto: WhatsAppNotificationDto) {
    return this.whatsappService.sendNotification(
      dto.phone_number,
      dto.message,
    );
  }

  @Post('whatsapp/inventory-alert')
  @ApiOperation({ summary: 'Send inventory alert via WhatsApp' })
  async sendInventoryAlert(
    @Body() body: { phone_number: string; item_name: string; quantity: number },
  ) {
    return this.whatsappService.sendInventoryAlert(
      body.phone_number,
      body.item_name,
      body.quantity,
    );
  }
}
