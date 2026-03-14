import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { PetpoojaIntegrationService } from './services/petpooja.service';
import { WhatsAppService } from './services/whatsapp.service';
import { PetpoojaSync } from './entities/petpooja-sync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetpoojaSync])],
  controllers: [IntegrationsController],
  providers: [PetpoojaIntegrationService, WhatsAppService],
  exports: [PetpoojaIntegrationService, WhatsAppService],
})
export class IntegrationsModule {}
