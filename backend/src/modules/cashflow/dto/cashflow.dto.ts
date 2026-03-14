import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCashFlowEntryDto {
  @IsUUID()
  outlet_id: string;

  @IsNotEmpty()
  @IsString()
  entry_type: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference_id?: string;

  @IsOptional()
  details?: Record<string, any>;
}
