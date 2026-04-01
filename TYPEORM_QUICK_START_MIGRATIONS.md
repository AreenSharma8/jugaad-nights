# Quick Start: Running TypeORM Migrations

**Step-by-step guide to verify and run database migrations**

---

## ⚡ Quick Verification (5 minutes)

### Step 1: Ensure Backend is Built
```bash
cd backend
npm install
npm run build
```

**Expected Output:**
```
✓ Compiled successfully - Application starting...
```

### Step 2: Check Migration Files Exist
```bash
ls -la dist/migrations/

# Should show:
# 1704067200000-CreateBaseSchema.js
```

### Step 3: Show Pending Migrations
```bash
npm run migration:show

# Output will show:
# Migration: CreateBaseSchema1704067200000
#  Status: ✓ (executed) or ✗ (pending)
```

---

## 🐳 With Docker Compose

### Full Setup (10 minutes)

```bash
# 1. Start all services
cd c:\Users\AREEN PIHU SHARMA\OneDrive\Desktop\jugaad-nights
./start.sh

# 2. Wait for PostgreSQL health check
# Check with:
docker-compose ps
# Look for: postgres (healthy)

# 3. Build backend migrations in Docker
docker-compose exec backend npm run build

# 4. Run migrations inside Docker
docker-compose exec backend npm run migration:run

# 5. Verify migrations executed
docker-compose exec backend npm run migration:show
```

### View Applied Migrations in Database
```bash
# Open PostgreSQL shell inside Docker
docker-compose exec postgres psql -U postgres -d jugaad_nights

# Then run:
SELECT * FROM typeorm_metadata WHERE type = 'MIGRATION' ORDER BY timestamp DESC;

# Exit:
\q
```

**Expected Output:**
```
                             name                             |           timestamp
────────────────────────────────────────────────────────────────┼────────────────────────────────
 CreateBaseSchema1704067200000                                 | 1704067200000
```

---

## 🔄 Creating New Migrations

### Example: Add New Column to User Entity

#### 1. Modify Entity
```typescript
// backend/src/modules/users/entities/user.entity.ts

import { Column, Entity, ... } from 'typeorm';

@Entity('users')
export class User {
  @Column({ type: 'varchar' })
  email: string;

  // Add this new field:
  @Column({ type: 'varchar', nullable: true })
  business_registration_number: string;  // ← NEW
}
```

#### 2. Build Project
```bash
cd backend
npm run build
```

#### 3. Generate Migration
```bash
npm run migration:generate -- -n AddBusinessRegNumberToUser

# Output:
# Migration 1704067300000-AddBusinessRegNumberToUser.ts has been generated
```

#### 4. Review Generated File
```bash
cat src/migrations/1704067300000-AddBusinessRegNumberToUser.ts

# Should contain:
# export class AddBusinessRegNumberToUser1704067300000 implements MigrationInterface {
#   public async up(queryRunner: QueryRunner): Promise<void> {
#     await queryRunner.addColumn('users', new TableColumn({
#       name: 'business_registration_number',
#       type: 'varchar',
#       isNullable: true,
#       default: null,
#     }));
#   }
#
#   public async down(queryRunner: QueryRunner): Promise<void> {
#     await queryRunner.dropColumn('users', 'business_registration_number');
#   }
# }
```

#### 5. Run Migration
```bash
npm run migration:run

# Output:
# Migration AddBusinessRegNumberToUser1704067300000 has been executed successfully.
```

#### 6. Verify in Database
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d jugaad_nights

# Check new column exists:
\d users

# Should show:
# Column Name           │ Type     │ Nullable
# ──────────────────────┼──────────┼────────
# business_reg_number   │ varchar  │ YES
```

#### 7. Commit to Git
```bash
git add backend/src/migrations/1704067300000-AddBusinessRegNumberToUser.ts
git commit -m "feat: add business registration number to user entity"
```

---

## 📋 Common Scenarios

### Scenario 1: Create New Table for Inventory Batches

```bash
# Step 1: Create entity
cat > backend/src/modules/inventory/entities/inventory-batch.entity.ts << 'EOF'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  outlet_id: string;

  @Column({ type: 'varchar' })
  batch_number: string;

  @Column({ type: 'date' })
  expiry_date: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
EOF

# Step 2: Build and generate migration
npm run build
npm run migration:generate -- -n CreateInventoryBatches

# Step 3: Review and run
npm run migration:run
```

### Scenario 2: Add Composite Index for Performance

```bash
# Edit migration to add index:
npm run migration:generate -- -n AddCompositeIndexToOrders
```

Then manually edit the generated file:
```typescript
export class AddCompositeIndexToOrders1704067400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_outlet_created',
        columnNames: ['outlet_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('orders', 'IDX_orders_outlet_created');
  }
}
```

Then run:
```bash
npm run migration:run
```

### Scenario 3: Rollback Migration

```bash
# Revert last migration
npm run migration:revert

# Output:
# Migration AddBusinessRegNumberToUser1704067300000 has been reverted successfully.

# Verify rollback
npm run migration:show
# Should show AddBusinessRegNumberToUser1704067300000 as ✗ (not executed)
```

---

## 🚨 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Problem:** PostgreSQL not running

**Solution:**
```bash
# Start PostgreSQL container
docker-compose up postgres

# Check health
docker-compose ps postgres
# Look for (healthy) status
```

### Error: "Cannot find dist/migrations"
**Problem:** TypeScript not compiled

**Solution:**
```bash
npm run build
npm run migration:show  # Try again
```

### Error: "FATAL: database 'jugaad_nights' does not exist"
**Problem:** Database not initialized

**Solution:**
```bash
# PostgreSQL auto-creates database if DB_NAME env var is set
# Restart services:
docker-compose down
docker-compose up postgres

# Wait for container to be healthy
# Then try:
npm run migration:run
```

### Error: "Migration already exists with name"
**Problem:** Duplicate migration name

**Solution:**
```bash
# TypeORM uses timestamps, impossible to have duplicate
# If you see this, you may have manually renamed files
# Solution: Delete the duplicate and regenerate:

rm src/migrations/1704067300000-AddNewField.ts
npm run migration:generate -- -n AddNewField
```

---

## ✅ Success Checklist

After running migrations, verify:

- [ ] `npm run migration:show` shows all migrations as executed
- [ ] Database tables exist: `docker-compose exec postgres psql -U postgres -d jugaad_nights -c "\dt"`
- [ ] All 5 tables created:
  - [ ] `permissions`
  - [ ] `roles`
  - [ ] `outlets`
  - [ ] `outlet_configs`
  - [ ] `users`
  - [ ] `user_roles`
- [ ] Columns in `users` table: `\d users`
- [ ] Indices created: `\di`
- [ ] No migration errors in backend logs: `docker-compose logs backend`

---

## 📊 Database Schema After Initial Migration

```sql
-- Check schema
\dt users
\dt outlets
\dt roles
\di+

-- View column details
\d+ users
\d+ outlets

-- View indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- View migrations applied
SELECT * FROM typeorm_metadata WHERE type = 'MIGRATION';
```

---

## 📞 Support

If migrations fail:

1. **Check logs:** `docker-compose logs backend`
2. **Verify DB connection:** `npm run migration:show`
3. **Check entity syntax:** Compare with [sample entity](#entity-structure)
4. **Ensure build:** `npm run build` was successful

---

**Ready to run migrations!**
