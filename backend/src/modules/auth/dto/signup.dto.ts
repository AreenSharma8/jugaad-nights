import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum UserType {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

/**
 * Base signup DTO for all user types
 */
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  age?: number;
}

/**
 * Admin signup DTO
 * Controlled by system administrator
 */
export class AdminSignupDto extends SignupDto {
  @IsEnum(UserType)
  user_type: UserType.ADMIN = UserType.ADMIN;
}

/**
 * Staff signup DTO
 * Created by Admin - not publicly accessible
 */
export class StaffSignupDto extends SignupDto {
  @IsEnum(UserType)
  user_type: UserType.STAFF = UserType.STAFF;

  @IsOptional()
  @IsString()
  department?: string;

  // For admin to assign role
  @IsOptional()
  role_id?: string;
}

/**
 * Customer signup DTO
 * Public registration endpoint
 */
export class CustomerSignupDto extends SignupDto {
  @IsEnum(UserType)
  user_type: UserType.CUSTOMER = UserType.CUSTOMER;
}

/**
 * Verify signup request DTO
 */
export class VerifySignupDto {
  @IsEmail()
  email: string;

  @IsString()
  verificationCode: string;
}
