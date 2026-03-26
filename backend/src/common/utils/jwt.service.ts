/**
 * JWT Utility Service
 * Handles JWT token creation and verification using Node.js crypto
 */

import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  roles: string[];
  outlet_id: string;
  iat: number; // issued at
  exp: number; // expiration
}

export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private readonly expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds

  /**
   * Create JWT token
   */
  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.expiresIn,
    };

    // Create JWT: header.payload.signature
    const header = this.base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = this.base64UrlEncode(JSON.stringify(jwtPayload));
    const signature = this.sign256(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode JWT token
   */
  verify(token: string): JwtPayload {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [header, body, signature] = parts;
      const expectedSignature = this.sign256(`${header}.${body}`);

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const payload: JwtPayload = JSON.parse(this.base64UrlDecode(body));

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decode(token: string): JwtPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      return JSON.parse(this.base64UrlDecode(parts[1]));
    } catch (error) {
      throw new Error(`JWT decode failed: ${error.message}`);
    }
  }

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    try {
      const payload = this.decode(token);
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  /**
   * Private: Sign using HMAC SHA256
   */
  private sign256(message: string): string {
    return this.base64UrlEncode(
      crypto.createHmac('sha256', this.secret).update(message).digest()
    );
  }

  /**
   * Private: Base64 URL encode
   */
  private base64UrlEncode(data: string | Buffer): string {
    return Buffer.from(data)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Private: Base64 URL decode
   */
  private base64UrlDecode(data: string): string {
    const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }
}

export const jwtService = new JwtService();
