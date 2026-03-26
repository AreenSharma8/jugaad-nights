import { IsEmail, IsNotEmpty, IsUUID, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  outlet_id: string;

  @IsUUID('4', { each: true })
  role_ids: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsUUID('4', { each: true })
  role_ids?: string[];
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  outlet_id: string;
  is_active: boolean;
  roles: any[];
  created_at: Date;
  updated_at: Date;
}
