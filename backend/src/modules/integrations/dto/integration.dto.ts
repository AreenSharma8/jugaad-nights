import { IsNotEmpty, IsEnum, IsUUID, IsOptional } from 'class-validator';

enum SyncType {
  ORDERS = 'orders',
  INVENTORY = 'inventory',
  MENU = 'menu',
  PAYMENTS = 'payments',
}

export class TriggerPetpoojaSyncDto {
  @IsUUID()
  outlet_id: string;

  @IsEnum(SyncType)
  sync_type: SyncType;
}

export class WhatsAppNotificationDto {
  @IsNotEmpty()
  phone_number: string;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  outlet_id?: string;
}
