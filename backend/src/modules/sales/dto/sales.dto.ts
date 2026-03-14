import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unit_price: number;

  @IsOptional()
  item_details?: Record<string, any>;
}

export class CreateOrderDto {
  @IsUUID()
  outlet_id: string;

  @IsOptional()
  @IsString()
  order_type?: string;

  @IsOptional()
  customer_info?: Record<string, any>;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsNumber()
  discount_amount?: number;
}

export class CreatePaymentDto {
  @IsUUID()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  payment_details?: Record<string, any>;
}

export class SalesAnalyticsDto {
  @IsUUID()
  outlet_id: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  period?: string;
}
