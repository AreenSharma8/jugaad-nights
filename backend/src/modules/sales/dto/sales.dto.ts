import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsArray, ValidateNested, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @Type(() => Number)
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
  @IsString()
  payment_type?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]*$/, { message: 'Customer name must contain only alphabetical characters' })
  customer_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  customer_phone?: string;

  @IsOptional()
  customer_info?: Record<string, any>;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @Type(() => Number)
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
