import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateInventoryItemDto {
  @IsUUID()
  outlet_id: string;

  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsString()
  item_code: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNotEmpty()
  @IsNumber()
  current_quantity: number;

  @IsNotEmpty()
  @IsNumber()
  reorder_level: number;

  @IsNotEmpty()
  @IsNumber()
  min_quantity: number;

  @IsNotEmpty()
  @IsNumber()
  max_quantity: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsNumber()
  current_quantity?: number;

  @IsOptional()
  @IsNumber()
  reorder_level?: number;

  @IsOptional()
  @IsNumber()
  min_quantity?: number;

  @IsOptional()
  @IsNumber()
  max_quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;
}

export class StockTransactionDto {
  @IsUUID()
  item_id: string;

  @IsNotEmpty()
  @IsString()
  transaction_type: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  reference_id?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
