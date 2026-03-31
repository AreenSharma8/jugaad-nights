import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/entities/role.entity';
import { Permission } from '../modules/users/entities/permission.entity';
import { Outlet } from '../modules/outlets/entities/outlet.entity';
import { OutletConfig } from '../modules/outlets/entities/outlet-config.entity';
import { passwordService } from '../common/utils/password.service';

// Load environment variables
dotenv.config();

// Initialize data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jugaad_nights',
  entities: [User, Role, Permission, Outlet, OutletConfig],
  synchronize: false,
  logging: true,
});

/**
 * Seed demo users for testing
 * Creates: Admin, Manager (Store Manager), and Staff demo accounts
 */
async function seedDemoUsers() {
  try {
    console.log('🌱 Starting seed process...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);
    const outletRepository = AppDataSource.getRepository(Outlet);

    // Step 1: Create or find Navrangpura outlet
    let outlet = await outletRepository.findOne({ 
      where: { name: 'Navrangpura' } 
    });

    if (!outlet) {
      outlet = outletRepository.create({
        name: 'Navrangpura',
        address: 'Navrangpura, Ahmedabad',
        phone: '+91-79-XXXX-XXXX',
        email: 'navrangpura@jugaadnights.com',
        is_active: true,
        created_by: null,
      });
      outlet = await outletRepository.save(outlet);
      console.log('✅ Created Navrangpura outlet');
    } else {
      console.log('✅ Found existing Navrangpura outlet');
    }

    const outletId = outlet.id;

    // Truncate users table (remove existing demo users)
    const connection = AppDataSource;
    await connection.query('DELETE FROM user_roles');
    await connection.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
      'admin@jugaadnights.com',
      'manager@jugaadnights.com',
      'staff@jugaadnights.com',
    ]);

    // Step 2: Get or create roles
    let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    let managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
    let staffRole = await roleRepository.findOne({ where: { name: 'staff' } });

    if (!adminRole) {
      adminRole = roleRepository.create({ 
        name: 'admin', 
        description: 'Administrator with full access',
        outlet_id: outletId,
        created_by: null,
      });
      await roleRepository.save(adminRole);
      console.log('✅ Created admin role');
    }

    if (!managerRole) {
      managerRole = roleRepository.create({ 
        name: 'manager', 
        description: 'Manager role for outlet operations',
        outlet_id: outletId,
        created_by: null,
      });
      await roleRepository.save(managerRole);
      console.log('✅ Created manager role');
    }

    if (!staffRole) {
      staffRole = roleRepository.create({ 
        name: 'staff', 
        description: 'Staff role for daily operations',
        outlet_id: outletId,
        created_by: null,
      });
      await roleRepository.save(staffRole);
      console.log('✅ Created staff role');
    }

    const demoPassword = 'Demo@12345'; // Standard demo password

    // Hash password
    const hashedPassword = await passwordService.hashPassword(demoPassword);

    // Step 3: Create demo users
    const demoUsers = [
      {
        email: 'admin@jugaadnights.com',
        name: 'Admin User',
        password: hashedPassword,
        user_type: 'admin',
        role: adminRole,
        phone: '+91-9999-999-999',
        gender: 'Male',
        age: 30,
      },
      {
        email: 'manager@jugaadnights.com',
        name: 'Store Manager',
        password: hashedPassword,
        user_type: 'staff',
        role: managerRole,
        phone: '+91-9999-999-998',
        gender: 'Male',
        age: 28,
      },
      {
        email: 'staff@jugaadnights.com',
        name: 'Staff Member',
        password: hashedPassword,
        user_type: 'staff',
        role: staffRole,
        phone: '+91-9999-999-997',
        gender: 'Female',
        age: 25,
      },
    ];

    for (const demoUserData of demoUsers) {
      const { role, ...userData } = demoUserData;
      
      const user = userRepository.create({
        ...userData,
        outlet_id: outletId,
        is_active: true,
        created_by: null,
        roles: [role],
      });

      await userRepository.save(user);
      console.log(`✅ Created demo user: ${userData.email}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('────────────────────────────────────────');
    console.log(`Outlet: Navrangpura`);
    console.log(`Demo Password: ${demoPassword}`);
    console.log('\nAccounts:');
    console.log('  1. Admin:   admin@jugaadnights.com');
    console.log('  2. Manager: manager@jugaadnights.com');
    console.log('  3. Staff:   staff@jugaadnights.com');
    console.log('────────────────────────────────────────\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seeder
seedDemoUsers();
