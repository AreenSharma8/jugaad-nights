import { IsString, IsDate, IsNumber, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFestivalDto {
  @IsUUID()
  outlet_id: string;

  @IsString()
  festival_name: string;

  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsNumber()
  @IsOptional()
  expected_sales?: number;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsEnum(['planning', 'active', 'completed'])
  @IsOptional()
  status?: 'planning' | 'active' | 'completed';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFestivalDto {
  @IsString()
  @IsOptional()
  festival_name?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  start_date?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  end_date?: Date;

  @IsNumber()
  @IsOptional()
  expected_sales?: number;

  @IsNumber()
  @IsOptional()
  actual_sales?: number;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsNumber()
  @IsOptional()
  actual_expenses?: number;

  @IsEnum(['planning', 'active', 'completed'])
  @IsOptional()
  status?: 'planning' | 'active' | 'completed';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class FestivalResponseDto {
  id: string;
  outlet_id: string;
  festival_name: string;
  start_date: Date;
  end_date: Date;
  expected_sales: number;
  actual_sales: number;
  budget: number;
  actual_expenses: number;
  status: 'planning' | 'active' | 'completed';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
