import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { getRedisConfig } from '../config/database.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis | null = null;
  private connected = false;

  async onModuleInit() {
    try {
      const config = getRedisConfig();
      this.redis = new Redis(config);
      
      this.redis.on('connect', () => {
        this.connected = true;
        this.logger.log('✅ Redis connected successfully');
      });
      
      this.redis.on('error', (err) => {
        this.connected = false;
        this.logger.warn('⚠️ Redis connection error:', err.message);
      });
      
      this.redis.on('reconnecting', () => {
        this.logger.log('🔄 Redis reconnecting...');
      });
      
      // Test connection
      await this.redis.ping();
      this.connected = true;
    } catch (err) {
      this.logger.warn('⚠️ Redis initialization failed (will use in-memory fallback):', (err as Error).message);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  isConnected(): boolean {
    return this.connected && this.redis !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (err) {
      this.logger.error('Redis get error:', err);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis) return;
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (err) {
      this.logger.warn('Redis set error:', err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn('Redis del error:', err);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (err) {
      this.logger.warn('Redis exists error:', err);
      return false;
    }
  }

  async flushAll(): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.flushall();
    } catch (err) {
      this.logger.warn('Redis flushAll error:', err);
    }
  }

  getClient(): Redis | null {
    return this.redis;
  }
}
