# ============================================================================
# DATABASE SETUP & MIGRATIONS GUIDE
# ============================================================================
# Complete guide for setting up PostgreSQL, running migrations, and managing
# the database schema for Jugaad Nights Backend.
# ============================================================================

## Overview

The Jugaad Nights backend uses:
- **TypeORM**: Object-Relational Mapping for database operations
- **PostgreSQL**: Relational database (primary)
- **Migrations**: Version-controlled database schema changes

Unlike Python's Alembic, NestJS uses TypeORM's built-in migration system which
provides the same functionality for managing database state.

---

## Prerequisites

### Before Starting:
1. Docker and Docker Compose installed
2. Node.js 20+ installed locally (for running migrations)
3. PostgreSQL client tools (optional, for manual queries)

---

## Database Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
./start.sh

# Or manually:
docker-compose up -d

# Verify PostgreSQL is running
docker ps | grep postgres
```

**What happens:**
1. PostgreSQL container starts with the configured image
2. Database `jugaad_nights` is created
3. Volumes are mounted for data persistence
4. Health checks verify the database is ready

### Option 2: Local PostgreSQL Installation

If running PostgreSQL locally (not in Docker):

```bash
# On Windows (using PostgreSQL installer)
# 1. Download PostgreSQL from https://www.postgresql.org/download/
# 2. Install with these settings:
#    - Port: 5432
#    - Username: postgres
#    - Password: postgres
# 3. Create database:
psql -U postgres -c "CREATE DATABASE jugaad_nights;"
```

### Option 3: Mac/Linux Local Installation

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb -U postgres jugaad_nights
```

---

## Environment Configuration

### Backend .env File

```
# Database Configuration
DB_TYPE=postgres
DB_HOST=postgres          # 'postgres' in Docker, 'localhost' locally
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights
DB_LOGGING=true

# Redis Configuration
REDIS_HOST=redis          # 'redis' in Docker, 'localhost' locally
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3000
```

---

## Running Migrations

### Build the Application First

Migrations require compiled JavaScript files:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Auto Schema Synchronization (Development Only)

The database configuration has `synchronize: true` for development:

```typescript
// src/config/database.config.ts
return {
  type: 'postgres',
  ...
  synchronize: true,  // ⚠️ Development only!
  ...
};
```

This automatically creates/updates tables based on entities (NO migration files needed).

**⚠️ WARNING**: Never use `synchronize: true` in production!

### Generate a New Migration (When Needed)

When you modify entity files, generate a migration:

```bash
# After editing entities, build first
npm run build

# Generate migration from entity changes
npm run migration:generate src/migrations/YourMigrationName

# Example: Add a new column to Sales entity
npm run migration:generate src/migrations/AddStatusToSales
```

This reads the current database schema and compares it to your entities,
then creates a migration file in `src/migrations/`.

### Run Pending Migrations

```bash
# First build
npm run build

# Then run migrations
npm run migration:run

# In Docker:
docker-compose exec backend npm run migration:run
```

### View Migration Status

```bash
npm run migration:show
```

Shows which migrations have been applied.

### Revert Last Migration

```bash
npm run migration:revert
```

**Be careful!** This removes the last applied migration and rolls back database changes.

---

## Understanding TypeORM vs Alembic

### Alembic (Python)
- Used in Flask/Django projects
- Separate migration tool
- More control over raw SQL
- Alembic init → alembic revision --autogenerate

### TypeORM (Node.js)
- Built into NestJS ecosystem
- Entity-first approach
- Automatic migration generation
- `npm run migration:generate`

**Key Difference:** With TypeORM in development, entities drive the schema.
In production, migrations drive the schema.

---

## Database Schema

### Tables Structure

All transactional tables include:

```typescript
Entity {
  id: UUID (primary key)
  outlet_id: UUID (foreign key - for multi-tenant isolation)
  created_at: DateTime (auto-set on insert)
  updated_at: DateTime (auto-set on update)
  created_by: UUID (user who created record)
  updated_by: UUID (user who last edited)
  deleted_at: DateTime (soft delete - for audit trail)
}
```

### Example Entity

```typescript
// src/modules/sales/entities/sales.entity.ts

import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sales')
export class Sales {
  // ID and Audit Fields
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('uuid')
  created_by: string;

  @Column('uuid')
  updated_by: string;

  @Column({ nullable: true })
  deleted_at: Date;

  // Business Fields
  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('varchar')
  payment_method: string;
}
```

---

## Common Migration Scenarios

### Scenario 1: Add a New Column

1. Edit the entity:
```typescript
@Column('varchar')
newField: string;
```

2. Generate migration:
```bash
npm run build
npm run migration:generate src/migrations/AddNewFieldToTable
```

3. Review the generated migration file
4. Run migration:
```bash
npm run migration:run
```

### Scenario 2: Rename a Column

1. Edit entity (rename property)
2. Manual migration (auto-generate may not detect renames):
```typescript
// src/migrations/1234567890123-RenameColumn.ts
export class RenameColumn1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('table_name', 'old_name', 'new_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('table_name', 'new_name', 'old_name');
  }
}
```

3. Run migration

### Scenario 3: Create a New Table with Foreign Keys

1. Create new entity with relationships:
```typescript
@Entity('new_table')
export class NewTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OtherTable)
  @JoinColumn({ name: 'other_table_id' })
  otherTable: OtherTable;

  @Column('uuid')
  other_table_id: string;
}
```

2. Generate migration
3. Run migration

---

## Docker-Specific Commands

### From Outside Container

```bash
# Run migration in Docker
docker-compose exec backend npm run migration:run

# Show migration status
docker-compose exec backend npm run migration:show

# Generate new migration
docker-compose exec backend npm run migration:generate src/migrations/YourName

# Revert last migration
docker-compose exec backend npm run migration:revert
```

### From Inside Container

```bash
# If already inside the container (via docker-compose exec bash)
npm run migration:run
npm run migration:show
```

---

## Troubleshooting

### Issue: "Migration failed to run"

**Solution:**
1. Check database is running: `docker-compose ps`
2. Check connection string in .env
3. Verify PostgreSQL is healthy: `docker-compose logs postgres`

### Issue: "Cannot find migrations" 

**Solution:**
```bash
# Migrations must be in dist/ folder (compiled)
npm run build  # This is required!
npm run migration:run
```

### Issue: "Entity doesn't exist" error

**Solution:**
```bash
# If using synchronize: true (dev only), restart backend:
docker-compose restart backend

# If production: ensure migrations have run
npm run migration:show
```

### Issue: Data loss on migration revert

**Solution:**
- Always test migration reverts in development first
- Keep database backups before major migrations
- Never revert on production without backup

---

## Best Practices

### ✅ DO:
- Always test migrations locally first
- Run `npm run build` before migrations
- Keep migrations small and focused
- Review generated migrations before running
- Use meaningful migration names
- Add comments to complex migrations
- Backup production database before migrations

### ❌ DON'T:
- Use `synchronize: true` in production
- Run migrations without backup
- Commit uncommitted migrations (build first!)
- Manually edit production database
- Ignore migration errors

---

## Seeding Database (Optional)

To populate database with initial data:

```bash
npm run seed
```

Edit `src/seeds/seed.ts` to customize initial data.

---

## Monitoring

### Check Database Health

```bash
# PostgreSQL container health
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Connect to database (if psql installed)
psql -h localhost -U postgres -d jugaad_nights
```

### View Tables and Migrations

```sql
-- In PostgreSQL client
\\dt  -- List all tables
SELECT * FROM migrations;  -- List applied migrations
```

---

## Production Considerations

### Before Deploying:

1. **Database Backup**
   ```bash
   pg_dump -h localhost -U postgres -d jugaad_nights > backup.sql
   ```

2. **Test Migrations Locally**
   - Create a copy of production database locally
   - Run migrations
   - Verify data integrity

3. **Disable Synchronization**
   ```typescript
   synchronize: false,  // Production only!
   ```

4. **Run Migrations in CI/CD**
   - Automated migration on deploy
   - Validation before promotion

5. **Monitor After Migration**
   - Check application logs
   - Monitor database performance
   - Watch for errors

---

## Additional Resources

- TypeORM Documentation: https://typeorm.io
- TypeORM Migrations: https://typeorm.io/migrations
- PostgreSQL Documentation: https://www.postgresql.org/docs

---

Last Updated: 2026-04-01
