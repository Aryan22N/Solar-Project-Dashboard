import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    {
      name: 'Super Admin',
      phone: '8888888888',
      dob: '1990-01-01',
      role: 'SUPER_ADMIN',
    },
    {
      name: 'Project Manager',
      phone: '7777777777',
      dob: '1990-01-01',
      role: 'PROJECT_MANAGER',
    },
    {
      name: 'Supervisor',
      phone: '6666666666',
      dob: '1990-01-01',
      role: 'SUPERVISOR',
    },
  ];

  console.log('Seeding users with hashed DOBs...');

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.dob, 10);
    
    const upsertedUser = await prisma.user.upsert({
      where: { phone: user.phone },
      update: {
        name: user.name,
        dob: hashedPassword,
        role: user.role,
      },
      create: {
        ...user,
        dob: hashedPassword,
      },
    });
    console.log(`- ${upsertedUser.role} (${upsertedUser.phone}) seeded.`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
