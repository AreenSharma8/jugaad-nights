import { Test, TestingModule } from '@nestjs/testing';
import { PetPoojaIntegrationService } from './petpooja.service';
import { WhatsAppIntegrationService } from './whatsapp.service';

describe('IntegrationsModule', () => {
  let petpooja: PetPoojaIntegrationService;
  let whatsapp: WhatsAppIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetPoojaIntegrationService, WhatsAppIntegrationService],
    }).compile();

    petpooja = module.get<PetPoojaIntegrationService>(PetPoojaIntegrationService);
    whatsapp = module.get<WhatsAppIntegrationService>(WhatsAppIntegrationService);
  });

  it('should be defined', () => {
    expect(petpooja).toBeDefined();
    expect(whatsapp).toBeDefined();
  });
});
