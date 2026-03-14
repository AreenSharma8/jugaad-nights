import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  outlet_id: string;

  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckOutDto {
  @IsUUID()
  attendance_id: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
