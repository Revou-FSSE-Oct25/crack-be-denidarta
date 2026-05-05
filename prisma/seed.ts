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
      role: 'admin',
      passwordHash: await hashPassword('superadmin123'),
      status: 'active',
    },
  });
  console.log('Seeded: superadmin@rapor-biru.dev (ADMIN)');
}

async function seedUsers(role: 'student' | 'instructor', count: number) {
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
        passwordHash: password,
        status: 'active',
      },
    });
    console.log(`Seeded: ${email} (${role})`);
  }
}

async function seedProfiles() {
  const users = await prisma.user.findMany({ where: { deletedAt: null } });

  for (const user of users) {
    const existing = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (existing) continue;

    await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: faker.person.fullName(),
        phoneNumber: faker.phone.number().slice(0, 20),
        gender: faker.helpers.arrayElement([
          'male',
          'female',
          'other',
          'prefer_not_to_say',
        ]),
        city: faker.location.city(),
        province: faker.location.state(),
        country: 'Indonesia',
        shortBio: faker.lorem.sentence(),
        instagram: faker.internet.username().toLowerCase(),
        github: faker.internet.username().toLowerCase(),
      },
    });
    console.log(`Seeded profile for: ${user.email}`);
  }
}

async function seedStudentProfiles() {
  const students = await prisma.user.findMany({
    where: { role: 'student', deletedAt: null },
  });

  for (const student of students) {
    const existing = await prisma.studentProfile.findUnique({
      where: { userId: student.id },
    });
    if (existing) continue;

    const nim = `NIM${student.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    await prisma.studentProfile.create({
      data: {
        userId: student.id,
        nim,
        enrollmentYear: faker.helpers.arrayElement([2021, 2022, 2023, 2024]),
        major: faker.helpers.arrayElement([
          'Computer Science',
          'Information Systems',
          'Data Science',
          'Software Engineering',
        ]),
        faculty: faker.helpers.arrayElement([
          'Faculty of Computer Science',
          'Faculty of Engineering',
          'Faculty of Technology',
        ]),
        currentSemester: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7, 8]),
        gpa: parseFloat(
          faker.number
            .float({ min: 2.5, max: 4.0, fractionDigits: 2 })
            .toFixed(2),
        ),
        academicStatus: 'active',
      },
    });
    console.log(`Seeded student profile: ${student.email} (${nim})`);
  }
}

async function seedInstructorProfiles() {
  const instructors = await prisma.user.findMany({
    where: { role: 'instructor', deletedAt: null },
  });

  for (const instructor of instructors) {
    const existing = await prisma.instructorProfile.findUnique({
      where: { userId: instructor.id },
    });
    if (existing) continue;

    const employeeId = `EMP${instructor.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

    await prisma.instructorProfile.create({
      data: {
        userId: instructor.id,
        employeeId,
        specialization: faker.helpers.arrayElement([
          'Web Development',
          'Machine Learning',
          'Data Engineering',
          'Mobile Development',
          'DevOps',
          'Cybersecurity',
        ]),
        department: faker.helpers.arrayElement([
          'Computer Science',
          'Information Technology',
          'Software Engineering',
        ]),
        highestEducation: faker.helpers.arrayElement([
          'bachelor',
          'master',
          'doctorate',
        ]),
        educationMajor: faker.helpers.arrayElement([
          'Computer Science',
          'Information Systems',
          'Software Engineering',
        ]),
        company: faker.company.name(),
        currentOccupation: faker.person.jobTitle(),
        yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
      },
    });
    console.log(
      `Seeded instructor profile: ${instructor.email} (${employeeId})`,
    );
  }
}

async function seedPrograms() {
  const existingCount = await prisma.program.count();
  if (existingCount > 0) {
    console.log('Programs already seeded, skipping...');
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) throw new Error('No admin user found. Run user seed first.');

  const programNames = [
    'Full Stack Web Development',
    'Data Science & Machine Learning',
    'Mobile App Development',
    'Cloud & DevOps Engineering',
    'Cybersecurity Fundamentals',
  ];

  for (const name of programNames) {
    await prisma.program.create({
      data: { name, createdBy: admin.id },
    });
    console.log(`Seeded program: ${name}`);
  }
}

async function seedCourses() {
  const existingCount = await prisma.course.count();
  if (existingCount > 0) {
    console.log('Courses already seeded, skipping...');
    return;
  }

  const instructors = await prisma.user.findMany({
    where: { role: 'instructor', deletedAt: null },
  });
  const programs = await prisma.program.findMany();

  if (instructors.length === 0)
    throw new Error('No instructors found. Run user seed first.');

  const courseTemplates = [
    {
      name: 'Introduction to HTML & CSS',
      description: 'Learn the basics of web markup and styling.',
    },
    {
      name: 'JavaScript Fundamentals',
      description: 'Core concepts of JavaScript programming.',
    },
    {
      name: 'React.js for Beginners',
      description: 'Build interactive UIs with React.',
    },
    {
      name: 'Node.js & Express API',
      description: 'Create RESTful APIs with Node.js.',
    },
    {
      name: 'Python for Data Analysis',
      description: 'Data manipulation using Python and Pandas.',
    },
    {
      name: 'Machine Learning Basics',
      description: 'Introduction to ML algorithms and concepts.',
    },
    {
      name: 'SQL & Database Design',
      description: 'Relational databases and query optimization.',
    },
    {
      name: 'Git & Version Control',
      description: 'Collaborative development with Git.',
    },
    {
      name: 'Docker & Containers',
      description: 'Containerization with Docker.',
    },
    {
      name: 'TypeScript Essentials',
      description: 'Typed JavaScript for large-scale apps.',
    },
  ];

  for (let i = 0; i < courseTemplates.length; i++) {
    const template = courseTemplates[i];
    const instructor = instructors[i % instructors.length];
    const program = programs.length > 0 ? programs[i % programs.length] : null;

    await prisma.course.create({
      data: {
        name: template.name,
        description: template.description,
        instructorId: instructor.id,
        programId: program?.id ?? null,
        status: faker.helpers.weightedArrayElement([
          { value: 'active', weight: 3 },
          { value: 'draft', weight: 1 },
          { value: 'completed', weight: 1 },
        ]),
        startedAt: faker.date.between({
          from: '2025-01-01',
          to: '2026-06-01',
        }),
      },
    });
    console.log(`Seeded course: ${template.name}`);
  }
}

async function main() {
  await seedAdmin();
  await seedUsers('instructor', 25);
  await seedUsers('student', 25);
  await seedProfiles();
  await seedStudentProfiles();
  await seedInstructorProfiles();
  await seedPrograms();
  await seedCourses();

  console.log(
    '\nSeed success! Total: 1 admin, 25 instructors, 25 students, profiles, 5 programs, 10 courses.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
