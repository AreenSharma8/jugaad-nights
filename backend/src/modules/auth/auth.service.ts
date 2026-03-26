import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto, CustomerSignupDto, StaffSignupDto, AdminSignupDto, UserType } from './dto/signup.dto';
import { jwtService } from '../../common/utils/jwt.service';
import { passwordService } from '../../common/utils/password.service';
import { UserRepository } from '../users/repositories/user.repository';
import { User } from '../users/entities/user.entity';

export interface LoginResponse {
  user: Partial<User>;
  token: string;
  refreshToken?: string;
}

/**
 * Authentication Service
 * 
 * Handles user authentication, JWT token generation, and user signup/registration
 * with bcrypt password hashing and role-based access control.
 */

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * User login
   * Validates email and password, returns JWT token
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User not found: ${email}`);
    }

    // Verify password
    const isPasswordValid = await passwordService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    if (!user.is_active) {
      throw new BadRequestException('User account is inactive');
    }

    // Get role names for JWT
    const roleNames = user.roles?.map((r) => r.name) || [];

    // Generate JWT token
    const token = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: roleNames[0] || 'customer', // Primary role
      roles: roleNames,
      outlet_id: user.outlet_id,
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Customer signup - Public registration
   */
  async signupCustomer(signupDto: CustomerSignupDto): Promise<LoginResponse> {
    return this.signup(signupDto, UserType.CUSTOMER);
  }

  /**
   * Staff signup - Controlled by admin
   */
  async signupStaff(signupDto: StaffSignupDto, adminId: string): Promise<LoginResponse> {
    // Verify admin has permission to create staff
    const admin = await this.userRepository.findByIdWithRelations(adminId);
    if (!admin || !admin.roles?.some((r) => r.name === 'admin')) {
      throw new BadRequestException('Only admins can create staff accounts');
    }

    return this.signup(signupDto, UserType.STAFF, adminId);
  }

  /**
   * Admin signup - System initialization only
   */
  async signupAdmin(signupDto: AdminSignupDto, createdBy: string): Promise<LoginResponse> {
    return this.signup(signupDto, UserType.ADMIN, createdBy);
  }

  /**
   * Internal signup implementation
   */
  private async signup(
    signupDto: SignupDto,
    userType: UserType,
    createdBy?: string,
  ): Promise<LoginResponse> {
    const { email, password, name, phone, gender, age } = signupDto;

    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Hash password
    const hashedPassword = await passwordService.hashPassword(password);

    // Create new user
    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.name = name;
    newUser.phone = phone || null;
    newUser.gender = gender || null;
    newUser.age = age || null;
    newUser.user_type = userType;
    newUser.is_active = true;
    newUser.outlet_id = '550e8400-e29b-41d4-a716-446655440101'; // Default outlet - can be customized
    newUser.created_by = createdBy || newUser.id;

    // Save user to database
    const savedUser = await this.userRepository.save(newUser);

    // Fetch user with relations
    const userWithRelations = await this.userRepository.findByIdWithRelations(savedUser.id);

    if (!userWithRelations) {
      throw new Error('Failed to retrieve created user');
    }

    // Get role names
    const roleNames = userWithRelations.roles?.map((r) => r.name) || [];

    // Generate JWT token
    const token = jwtService.sign({
      sub: userWithRelations.id,
      email: userWithRelations.email,
      role: roleNames[0] || userType,
      roles: roleNames,
      outlet_id: userWithRelations.outlet_id,
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userWithRelations as any;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Verify token validity
   */
  async verifyToken(token: string) {
    return jwtService.verify(token);
  }

  /**
   * Refresh token (optional - for enhanced security)
   */
  async refreshToken(token: string): Promise<{ token: string }> {
    try {
      const payload = jwtService.verify(token);
      
      // Generate new token with same payload
      const newToken = jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        roles: payload.roles,
        outlet_id: payload.outlet_id,
      });

      return { token: newToken };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}

