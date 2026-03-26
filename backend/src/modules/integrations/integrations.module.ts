import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { PetpoojaIntegrationService } from './services/petpooja.service';
import { WhatsAppService } from './services/whatsapp.service';
import { PetpoojaEventsService } from './services/petpooja-events.service';
import { PetpoojaWebhookController } from './controllers/petpooja-webhook.controller';
import { PetpoojaSync } from './entities/petpooja-sync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetpoojaSync])],
  controllers: [IntegrationsController, PetpoojaWebhookController],
  providers: [PetpoojaIntegrationService, WhatsAppService, PetpoojaEventsService],
  exports: [PetpoojaIntegrationService, WhatsAppService, PetpoojaEventsService],
})
export class IntegrationsModule {}
