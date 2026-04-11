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

  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsNotEmpty()
  @IsString()
  client_name: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
  client_phone?: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsNotEmpty()
  @Type(() => Date)
  event_date: Date;

  @IsOptional()
  @IsString()
  event_type?: string;

  @IsOptional()
  @IsNumber()
  number_of_items?: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePartyOrderItemDto)
  items?: CreatePartyOrderItemDto[];
}
