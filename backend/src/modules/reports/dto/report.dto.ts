import { IsString, IsUUID, IsEnum, IsOptional, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type ReportType = 'pdf' | 'excel' | 'summary';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export class CreateReportDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  outlet_id: string;

  @ApiProperty({ example: 'pdf', enum: ['pdf', 'excel', 'summary'] })
  @IsEnum(['pdf', 'excel', 'summary'])
  report_type: ReportType;

  @ApiProperty({ example: 'Sales Report - March 2024' })
  @IsString()
  report_name: string;

  @ApiPropertyOptional({ example: 'daily', enum: ['daily', 'weekly', 'monthly'] })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  period?: ReportPeriod;

  @ApiPropertyOptional({ example: 'sales' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2024-03-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional({ example: '2024-03-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;
}

export class ReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  outlet_id: string;

  @ApiProperty()
  report_type: ReportType;

  @ApiProperty()
  report_name: string;

  @ApiPropertyOptional()
  filename?: string;

  @ApiPropertyOptional()
  file_path?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  file_size_bytes?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  created_by: string;
}

export class GenerateReportDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  outlet_id: string;

  @ApiPropertyOptional({ example: '2024-03-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional({ example: '2024-03-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  include_outlet_summary?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  include_item_breakdown?: boolean;
}
