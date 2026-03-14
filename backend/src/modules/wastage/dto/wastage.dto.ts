import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateWastageEntryDto {
  @IsUUID()
  outlet_id: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  estimated_cost?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  notes?: Record<string, any>;
}
