import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class OutletConfigDto {
  @IsOptional()
  settings?: Record<string, any>;

  @IsOptional()
  @IsString()
  business_hours?: string;

  @IsOptional()
  @IsNumber()
  max_capacity?: number;
}

export class CreateOutletDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  config?: OutletConfigDto;
}

export class UpdateOutletDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  config?: OutletConfigDto;
}

export class OutletResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  config?: OutletConfigDto;
  created_at: Date;
  updated_at: Date;
}
