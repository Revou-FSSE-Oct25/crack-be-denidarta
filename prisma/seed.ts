import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function seedAdmin() {
  await prisma.user.upsert({
    where: { email: 'superadmin@rapor-biru.dev' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@rapor-biru.dev',
      role: 'ADMIN',
      password: await hashPassword('superadmin123'),
      status: 'ACTIVE',
    },
  });
  console.log('Seeded: superadmin@rapor-biru.dev (ADMIN)');
}

async function seedUsers(role: 'STUDENT' | 'INSTRUCTOR', count: number) {
  const password = await hashPassword('password123');

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase()
      .slice(0, 100);
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        username,
        email,
        role,
        password,
        status: 'ACTIVE',
      },
    });
    console.log(`Seeded: ${email} (${role})`);
  }
}

async function main() {
  await seedAdmin();
  await seedUsers('INSTRUCTOR', 25);
  await seedUsers('STUDENT', 25);

  console.log(
    '\nSeed success! with Total: 1 admin, 25 instructor, 25 student.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
