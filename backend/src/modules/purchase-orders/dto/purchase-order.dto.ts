import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  @IsNotEmpty()
  outlet_id: string;

  @IsString()
  @IsNotEmpty()
  po_number: string;

  @IsString()
  @IsNotEmpty()
  supplier_name: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  order_date: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  delivery_date: Date;

  @IsNumber()
  @IsNotEmpty()
  total_amount: number;

  @IsEnum(['Pending', 'Confirmed', 'Delivered'])
  @IsOptional()
  status?: 'Pending' | 'Confirmed' | 'Delivered';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  po_number?: string;

  @IsString()
  @IsOptional()
  supplier_name?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  order_date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  delivery_date?: Date;

  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @IsEnum(['Pending', 'Confirmed', 'Delivered'])
  @IsOptional()
  status?: 'Pending' | 'Confirmed' | 'Delivered';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  @IsOptional()
  items?: CreatePurchaseOrderItemDto[];
}
