import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsArray, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartyOrderItemDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unit_price: number;
}

export class CreatePartyOrderDto {
  @IsUUID()
  outlet_id: string;

  @IsUUID()
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  customer_name: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsNotEmpty()
  event_date: Date;

  @IsOptional()
  @IsString()
  event_type?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePartyOrderItemDto)
  items: CreatePartyOrderItemDto[];
}
