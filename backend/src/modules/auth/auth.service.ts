import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

/**
 * ⚠️ DEVELOPMENT ONLY AUTH SERVICE
 * 
 * This is a temporary authentication service for development purposes ONLY.
 * In production, authentication should be handled by an external auth service.
 * 
 * DO NOT use this in production.
 */

@Injectable()
export class AuthService {
  // Mock users for development
  private readonly mockUsers = {
    'admin@jugaadnights.com': {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@jugaadnights.com',
      name: 'Admin User',
      phone: '+91-9876543210',
      outlet_id: '550e8400-e29b-41d4-a716-446655440101',
      role: 'admin',
      roles: ['admin', 'manager', 'staff'],
    },
    'manager@jugaadnights.com': {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'manager@jugaadnights.com',
      name: 'Manager User',
      phone: '+91-9876543211',
      outlet_id: '550e8400-e29b-41d4-a716-446655440102',
      role: 'manager',
      roles: ['manager', 'staff'],
    },
    'staff@jugaadnights.com': {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'staff@jugaadnights.com',
      name: 'Staff User',
      phone: '+91-9876543212',
      outlet_id: '550e8400-e29b-41d4-a716-446655440103',
      role: 'staff',
      roles: ['staff'],
    },
  };

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    let user: any;

    try {
      // Development only: validate email exists
      user = this.mockUsers[email];

      if (!user) {
        throw new Error(`User not found: ${email}`);
      }

      // Development only: accept any password
      if (!password) {
        throw new Error('Password is required');
      }
    } catch (error) {
      // Proper exception handling for password authentication
      throw new Error(error.message || 'Password authentication failed');
    }

    // Generate a fake JWT token (for development only)
    const token = this.generateMockToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Generates a mock JWT token for development
   * ⚠️ NOT SECURE - Do not use in production
   */
  private generateMockToken(user: any): string {
    // Simple base64 encoded JSON (not real JWT)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    };

    // In a real scenario, this would be a proper JWT signed with a secret
    return `dev.${Buffer.from(JSON.stringify(payload)).toString('base64')}.token`;
  }
}
