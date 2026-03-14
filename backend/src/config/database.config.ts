import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jugaad_nights',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*{.ts,.js}'],
  synchronize: true, // Enable synchronization for testing
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
  cache: true,
});

// TypeORM DataSource for CLI migrations
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jugaad_nights',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export const getRedisConfig = () => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    enableReadyCheck: false,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null,
  };
};
