import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';

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
        fullAddress: faker.location.streetAddress({ useFullAddress: true }),
        city: faker.location.city(),
        district: faker.location.county().slice(0, 100),
        subdistrict: faker.location.city().slice(0, 100),
        province: faker.location.state(),
        country: 'Indonesia',
        avatarUrl: faker.image.avatar(),
        shortBio: faker.lorem.sentence(),
        linkedinUrl: `https://linkedin.com/in/${faker.internet.username().toLowerCase()}`,
        instagram: faker.internet.username().toLowerCase(),
        githubUrl: faker.internet.username().toLowerCase(),
        personalWebsite: faker.helpers.maybe(() => faker.internet.url(), {
          probability: 0.4,
        }),
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
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) throw new Error('No admin user found. Run user seed first.');

  const instructors = await prisma.user.findMany({
    where: { role: 'instructor', deletedAt: null },
  });
  if (instructors.length === 0)
    throw new Error('No instructors found. Run user seed first.');

  const programNames = [
    'Full Stack Web Development',
    'Data Science & Machine Learning',
    'Mobile App Development',
    'Cloud & DevOps Engineering',
    'Cybersecurity Fundamentals',
  ];

  for (let i = 0; i < programNames.length; i++) {
    const name = programNames[i];
    const headOfProgram = instructors[i % instructors.length];

    const existing = await prisma.program.findFirst({
      where: { name, deletedAt: null },
    });

    if (existing) {
      // Update existing program with head of program
      await prisma.program.update({
        where: { id: existing.id },
        data: { headOfProgramId: headOfProgram.id },
      });
      console.log(
        `Updated program: ${name} (Head: ${headOfProgram.username || headOfProgram.email})`,
      );
    } else {
      // Create new program
      await prisma.program.create({
        data: {
          name,
          createdBy: admin.id,
          headOfProgramId: headOfProgram.id,
        },
      });
      console.log(
        `Seeded program: ${name} (Head: ${headOfProgram.username || headOfProgram.email})`,
      );
    }
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

async function seedEnrollments() {
  const students = await prisma.user.findMany({
    where: { role: 'student', deletedAt: null },
  });

  const programs = await prisma.program.findMany();

  if (students.length === 0)
    throw new Error('No students found. Run user seed first.');
  if (programs.length === 0)
    throw new Error('No programs found. Run program seed first.');

  for (const student of students) {
    // Randomly select 1-3 programs for this student
    const enrollmentCount = Math.floor(Math.random() * 3) + 1;
    const shuffledPrograms = programs.sort(() => Math.random() - 0.5);
    const selectedPrograms = shuffledPrograms.slice(0, enrollmentCount);

    for (const program of selectedPrograms) {
      // Check if enrollment already exists
      const existing = await prisma.programEnrollment.findUnique({
        where: {
          programId_userId: {
            programId: program.id,
            userId: student.id,
          },
        },
      });

      if (existing) continue;

      // Create enrollment with weighted-random status
      const status = faker.helpers.weightedArrayElement([
        { value: 'enrolled' as const, weight: 50 },
        { value: 'completed' as const, weight: 30 },
        { value: 'pending' as const, weight: 15 },
        { value: 'dropped' as const, weight: 5 },
      ]);

      await prisma.programEnrollment.create({
        data: {
          programId: program.id,
          userId: student.id,
          status,
        },
      });

      console.log(
        `Seeded enrollment: ${student.email} → ${program.name} (${status})`,
      );
    }
  }

  console.log('Seeded enrollments complete!');
}

async function seedLearningMaterials() {
  const existingCount = await prisma.learningMaterial.count();
  if (existingCount > 0) {
    console.log('Learning materials already seeded, skipping...');
    return;
  }

  const instructors = await prisma.user.findMany({
    where: { role: 'instructor', deletedAt: null },
  });

  if (instructors.length === 0)
    throw new Error('No instructors found. Run user seed first.');

  const materialTemplates = [
    {
      title: 'HTML Fundamentals Guide',
      materialType: 'article' as const,
      content: 'Complete guide to HTML5 elements and semantic markup.',
    },
    {
      title: 'CSS Grid Layout Tutorial',
      materialType: 'slides' as const,
      content: 'Learn modern CSS Grid for responsive layouts.',
    },
    {
      title: 'JavaScript ES6 Features',
      materialType: 'video' as const,
      content: 'Comprehensive video on ES6+ features and best practices.',
    },
    {
      title: 'React Hooks Deep Dive',
      materialType: 'pdf' as const,
      content: 'In-depth PDF guide on React hooks and state management.',
    },
    {
      title: 'Node.js Best Practices',
      materialType: 'article' as const,
      content: 'Production-ready Node.js development patterns.',
    },
    {
      title: 'Database Design Principles',
      materialType: 'slides' as const,
      content: 'Slide deck on normalization and database optimization.',
    },
    {
      title: 'API Security Essentials',
      materialType: 'video' as const,
      content: 'Video tutorial on securing REST APIs.',
    },
    {
      title: 'Python Data Structures',
      materialType: 'pdf' as const,
      content: 'PDF reference for Python data structures and algorithms.',
    },
    {
      title: 'Docker Cheat Sheet',
      materialType: 'article' as const,
      content: 'Quick reference for Docker commands and workflows.',
    },
    {
      title: 'TypeScript Type System',
      materialType: 'slides' as const,
      content: 'Complete guide to TypeScript types and generics.',
    },
    {
      title: 'Advanced CSS Animations',
      materialType: 'video' as const,
      content: 'Master CSS animations and transitions for modern web design.',
    },
    {
      title: 'Vue.js Composition API',
      materialType: 'article' as const,
      content: 'Deep dive into Vue 3 Composition API patterns.',
    },
    {
      title: 'GraphQL Query Language',
      materialType: 'slides' as const,
      content: 'Introduction to GraphQL and how to build efficient APIs.',
    },
    {
      title: 'MongoDB Atlas Tutorial',
      materialType: 'pdf' as const,
      content: 'Complete guide to cloud MongoDB and database design.',
    },
    {
      title: 'AWS Cloud Services',
      materialType: 'video' as const,
      content: 'Overview of AWS EC2, S3, Lambda and other key services.',
    },
    {
      title: 'Kubernetes Deployment Guide',
      materialType: 'article' as const,
      content: 'Step-by-step guide to deploying applications with Kubernetes.',
    },
    {
      title: 'Microservices Architecture',
      materialType: 'slides' as const,
      content: 'Design patterns and best practices for microservices.',
    },
    {
      title: 'Testing Best Practices',
      materialType: 'pdf' as const,
      content: 'Unit testing, integration testing, and E2E testing strategies.',
    },
    {
      title: 'Git Workflow Strategies',
      materialType: 'article' as const,
      content: 'GitFlow, trunk-based development, and CI/CD practices.',
    },
    {
      title: 'Performance Optimization',
      materialType: 'video' as const,
      content: 'Web performance metrics, caching, and optimization techniques.',
    },
    {
      title: 'REST API Design Principles',
      materialType: 'slides' as const,
      content: 'RESTful API design, versioning, and best practices.',
    },
    {
      title: 'Authentication & Authorization',
      materialType: 'pdf' as const,
      content: 'OAuth2, JWT, and session-based authentication mechanisms.',
    },
    {
      title: 'Web Accessibility (A11y)',
      materialType: 'article' as const,
      content: 'WCAG guidelines and making web content accessible to all.',
    },
    {
      title: 'Progressive Web Apps',
      materialType: 'video' as const,
      content: 'Building PWAs with service workers and offline support.',
    },
    {
      title: 'Mobile App Development',
      materialType: 'slides' as const,
      content: 'React Native and Flutter for cross-platform development.',
    },
  ];

  for (let i = 0; i < materialTemplates.length; i++) {
    const template = materialTemplates[i];
    const instructor = instructors[i % instructors.length];

    await prisma.learningMaterial.create({
      data: {
        title: template.title,
        materialType: template.materialType,
        content: template.content,
        uploadedBy: instructor.id,
        fileUrl: faker.system.filePath(),
      },
    });
    console.log(
      `Seeded learning material: ${template.title} (${template.materialType})`,
    );
  }
}

async function seedLearningMaterialCourseRelations() {
  const existingCount = await prisma.learningMaterialCourse.count();
  if (existingCount > 0) {
    console.log(
      'Learning material course relations already seeded, skipping...',
    );
    return;
  }

  const materials = await prisma.learningMaterial.findMany();
  const courses = await prisma.course.findMany();

  if (materials.length === 0)
    throw new Error('No learning materials found. Run material seed first.');
  if (courses.length === 0)
    throw new Error('No courses found. Run course seed first.');

  for (const course of courses) {
    // Randomly select 5-12 materials for this course
    const materialCount = Math.floor(Math.random() * 8) + 5;
    const shuffledMaterials = materials.sort(() => Math.random() - 0.5);
    const selectedMaterials = shuffledMaterials.slice(0, materialCount);

    for (let i = 0; i < selectedMaterials.length; i++) {
      const material = selectedMaterials[i];

      const existing = await prisma.learningMaterialCourse.findUnique({
        where: {
          learningMaterialId_courseId: {
            learningMaterialId: material.id,
            courseId: course.id,
          },
        },
      });

      if (existing) continue;

      await prisma.learningMaterialCourse.create({
        data: {
          learningMaterialId: material.id,
          courseId: course.id,
        },
      });

      console.log(
        `Seeded learning material course: ${material.title} → ${course.name}`,
      );
    }
  }

  console.log('Seeded learning material course relations complete!');
}

async function seedLearningMaterialProgramRelations() {
  const existingCount = await prisma.learningMaterialProgram.count();
  if (existingCount > 0) {
    console.log(
      'Learning material program relations already seeded, skipping...',
    );
    return;
  }

  const materials = await prisma.learningMaterial.findMany();
  const programs = await prisma.program.findMany();

  if (materials.length === 0)
    throw new Error('No learning materials found. Run material seed first.');
  if (programs.length === 0)
    throw new Error('No programs found. Run program seed first.');

  for (const program of programs) {
    // Randomly select 8-15 materials for this program
    const materialCount = Math.floor(Math.random() * 8) + 8;
    const shuffledMaterials = materials.sort(() => Math.random() - 0.5);
    const selectedMaterials = shuffledMaterials.slice(0, materialCount);

    for (let i = 0; i < selectedMaterials.length; i++) {
      const material = selectedMaterials[i];

      const existing = await prisma.learningMaterialProgram.findUnique({
        where: {
          learningMaterialId_programId: {
            learningMaterialId: material.id,
            programId: program.id,
          },
        },
      });

      if (existing) continue;

      await prisma.learningMaterialProgram.create({
        data: {
          learningMaterialId: material.id,
          programId: program.id,
        },
      });

      console.log(
        `Seeded learning material program: ${material.title} → ${program.name}`,
      );
    }
  }

  console.log('Seeded learning material program relations complete!');
}

async function seedClassSessions() {
  const existingCount = await prisma.classSession.count();
  if (existingCount > 0) {
    console.log('Class sessions already seeded, skipping...');
    return;
  }

  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
  });

  if (courses.length === 0)
    throw new Error('No courses found. Run course seed first.');

  const sessionTitles = [
    'Pengenalan & Overview',
    'Dasar-Dasar Konsep',
    'Praktik Pertama',
    'Studi Kasus & Diskusi',
    'Project Session',
    'Review & Evaluasi',
    'Advanced Topics',
    'Q&A dan Penutup',
  ];

  for (const course of courses) {
    const sessionCount = faker.number.int({ min: 4, max: 8 });
    const baseDate = faker.date.between({
      from: '2025-01-01',
      to: '2025-12-01',
    });

    for (let i = 0; i < sessionCount; i++) {
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(sessionDate.getDate() + i * 7);

      const startHour = faker.helpers.arrayElement([8, 9, 10, 13, 14, 15]);
      const startTime = new Date(sessionDate);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startHour + 2, 0, 0, 0);

      const status = faker.helpers.weightedArrayElement([
        { value: 'completed' as const, weight: 5 },
        { value: 'scheduled' as const, weight: 3 },
        { value: 'ongoing' as const, weight: 1 },
        { value: 'cancelled' as const, weight: 1 },
      ]);

      await prisma.classSession.create({
        data: {
          courseId: course.id,
          title: sessionTitles[i % sessionTitles.length],
          sessionDate,
          startTime,
          endTime,
          location: faker.helpers.maybe(
            () =>
              faker.helpers.arrayElement([
                'Ruang A101',
                'Ruang B202',
                'Lab Komputer 1',
                'Aula Utama',
              ]),
            { probability: 0.6 },
          ),
          meetingUrl: faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.5,
          }),
          status,
        },
      });
    }
    console.log(
      `Seeded ${sessionCount} class sessions for course: ${course.name}`,
    );
  }
}

async function seedClassAttendances() {
  const existingCount = await prisma.classAttendance.count();
  if (existingCount > 0) {
    console.log('Class attendances already seeded, skipping...');
    return;
  }

  const completedSessions = await prisma.classSession.findMany({
    where: { status: 'completed', deletedAt: null },
    include: { course: true },
  });

  if (completedSessions.length === 0) {
    console.log('No completed class sessions found, skipping attendance seed.');
    return;
  }

  const students = await prisma.user.findMany({
    where: { role: 'student', deletedAt: null },
  });

  if (students.length === 0) {
    console.log('No students found, skipping attendance seed.');
    return;
  }

  for (const session of completedSessions) {
    const attendeeCount = faker.number.int({
      min: Math.min(3, students.length),
      max: Math.min(15, students.length),
    });
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const attendees = shuffledStudents.slice(0, attendeeCount);

    for (const student of attendees) {
      const status = faker.helpers.weightedArrayElement([
        { value: 'present' as const, weight: 7 },
        { value: 'late' as const, weight: 1 },
        { value: 'absent' as const, weight: 1 },
        { value: 'excused' as const, weight: 1 },
      ]);

      await prisma.classAttendance.upsert({
        where: {
          classSessionId_userId: {
            classSessionId: session.id,
            userId: student.id,
          },
        },
        update: {},
        create: {
          classSessionId: session.id,
          userId: student.id,
          status,
          verifiedAt: status !== 'absent' ? session.sessionDate : null,
        },
      });
    }
    console.log(
      `Seeded ${attendees.length} attendances for session: ${session.title} (${session.course.name})`,
    );
  }
}

async function seedAssignments() {
  const existingCount = await prisma.assignment.count();
  if (existingCount > 0) {
    console.log('Assignments already seeded, skipping...');
    return;
  }

  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
  });

  if (courses.length === 0)
    throw new Error('No courses found. Run course seed first.');

  const assignmentTemplates = [
    {
      title: 'Tugas Individu: Studi Kasus',
      description:
        'Analisis studi kasus yang diberikan dan buat laporan singkat.',
    },
    {
      title: 'Proyek Mini: Implementasi Materi',
      description:
        'Implementasikan konsep yang dipelajari dalam proyek sederhana.',
    },
    {
      title: 'Kuis Pemahaman',
      description: 'Jawab pertanyaan berdasarkan materi yang sudah dibahas.',
    },
    {
      title: 'Latihan Soal & Refleksi',
      description:
        'Kerjakan latihan soal dan tuliskan refleksi pembelajaran Anda.',
    },
  ];

  for (const course of courses) {
    const count = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < count; i++) {
      const template = assignmentTemplates[i % assignmentTemplates.length];
      const status = faker.helpers.weightedArrayElement([
        { value: 'published' as const, weight: 5 },
        { value: 'draft' as const, weight: 2 },
        { value: 'closed' as const, weight: 3 },
      ]);

      await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: `${template.title} ${i + 1}`,
          description: template.description,
          dueDate: faker.date.between({ from: '2025-03-01', to: '2025-12-31' }),
          minPoints: faker.helpers.arrayElement([50, 75, 100]),
          status,
        },
      });
    }
    console.log(`Seeded ${count} assignments for course: ${course.name}`);
  }
}

async function seedAssignmentSubmissions() {
  const existingCount = await prisma.assignmentSubmission.count();
  if (existingCount > 0) {
    console.log('Assignment submissions already seeded, skipping...');
    return;
  }

  const assignments = await prisma.assignment.findMany({
    where: { status: { in: ['published', 'closed'] }, deletedAt: null },
  });

  const students = await prisma.user.findMany({
    where: { role: 'student', deletedAt: null },
  });

  if (assignments.length === 0) {
    console.log(
      'No published/closed assignments found, skipping submission seed.',
    );
    return;
  }
  if (students.length === 0) {
    console.log('No students found, skipping submission seed.');
    return;
  }

  for (const assignment of assignments) {
    const submitterCount = faker.number.int({
      min: Math.min(3, students.length),
      max: Math.min(12, students.length),
    });
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const submitters = shuffledStudents.slice(0, submitterCount);

    for (const student of submitters) {
      const status = faker.helpers.weightedArrayElement([
        { value: 'submitted' as const, weight: 4 },
        { value: 'graded' as const, weight: 4 },
        { value: 'notSubmitted' as const, weight: 2 },
      ]);

      const isGraded = status === 'graded';
      const grade = isGraded
        ? parseFloat(
            faker.number
              .float({ min: 50, max: 100, fractionDigits: 2 })
              .toFixed(2),
          )
        : null;

      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: student.id,
          },
        },
        update: {},
        create: {
          assignmentId: assignment.id,
          studentId: student.id,
          submissionText: faker.lorem.paragraph(),
          submittedAt:
            status !== 'notSubmitted' ? faker.date.recent({ days: 30 }) : null,
          grade,
          passed: isGraded ? grade !== null && grade >= 60 : null,
          feedback: isGraded ? faker.lorem.sentence() : null,
          gradedAt: isGraded ? faker.date.recent({ days: 14 }) : null,
          status,
        },
      });
    }
    console.log(
      `Seeded ${submitters.length} submissions for assignment: ${assignment.title}`,
    );
  }
}

async function seedCertificates() {
  const existingCount = await prisma.certificate.count();
  if (existingCount > 0) {
    console.log('Certificates already seeded, skipping...');
    return;
  }

  // Only enrollments marked as completed are candidates for a certificate
  const completedEnrollments = await prisma.programEnrollment.findMany({
    where: { status: 'completed' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: { select: { fullName: true } },
        },
      },
      program: {
        select: { id: true, name: true },
      },
    },
  });

  if (completedEnrollments.length === 0) {
    console.log('No completed enrollments found, skipping certificate seed.');
    return;
  }

  let certCount = 0;

  for (const enrollment of completedEnrollments) {
    const { user, program } = enrollment;

    // Guard: skip if a certificate already exists for this student + program
    const alreadyExists = await prisma.certificate.findUnique({
      where: { userId_programId: { userId: user.id, programId: program.id } },
    });
    if (alreadyExists) continue;

    // ── Business rule ─────────────────────────────────────────────────────
    // Every published / closed assignment in the program's courses must have
    // a graded submission with passed = true before a certificate can be
    // issued (mirrors the eligibility check in ProgramCertificatesService).
    // ──────────────────────────────────────────────────────────────────────
    const assignments = await prisma.assignment.findMany({
      where: {
        course: { programId: program.id, deletedAt: null },
        status: { in: ['published', 'closed'] },
        deletedAt: null,
      },
    });

    // A program with no published/closed assignments can never be eligible
    if (assignments.length === 0) continue;

    // Upsert a passing, graded submission for every assignment that the
    // student hasn't already passed — this ensures seed data is internally
    // consistent with the eligibility business rule.
    for (const assignment of assignments) {
      const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: user.id,
          },
        },
      });

      const alreadyPassed =
        existingSubmission?.status === 'graded' &&
        existingSubmission?.passed === true;

      if (!alreadyPassed) {
        const grade = parseFloat(
          faker.number
            .float({ min: 75, max: 100, fractionDigits: 2 })
            .toFixed(2),
        );
        await prisma.assignmentSubmission.upsert({
          where: {
            assignmentId_studentId: {
              assignmentId: assignment.id,
              studentId: user.id,
            },
          },
          update: {
            status: 'graded',
            grade,
            passed: true,
            submittedAt: faker.date.recent({ days: 60 }),
            gradedAt: faker.date.recent({ days: 30 }),
            feedback: faker.lorem.sentence(),
          },
          create: {
            assignmentId: assignment.id,
            studentId: user.id,
            submissionText: faker.lorem.paragraph(),
            submittedAt: faker.date.recent({ days: 60 }),
            status: 'graded',
            grade,
            passed: true,
            gradedAt: faker.date.recent({ days: 30 }),
            feedback: faker.lorem.sentence(),
          },
        });
      }
    }

    // ── Build snapshots (mirrors service logic exactly) ───────────────────
    const studentNameSnapshot = user.profile?.fullName ?? user.username;
    const programNameSnapshot = program.name;

    // Same certNumber format used by issueCertificate() in the service
    const certNumber = `CERT-${randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12)}`;

    await prisma.certificate.create({
      data: {
        userId: user.id,
        programId: program.id,
        certNumber,
        issuedAt: faker.date.recent({ days: 90 }),
        studentNameSnapshot,
        programNameSnapshot,
        fileUrl: faker.helpers.maybe(() => faker.internet.url(), {
          probability: 0.7,
        }),
      },
    });

    certCount++;
    console.log(
      `Issued certificate for "${studentNameSnapshot}" in program "${programNameSnapshot}"`,
    );
  }

  console.log(`Seeded ${certCount} certificates.`);
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
  await seedEnrollments();
  await seedLearningMaterials();
  await seedLearningMaterialCourseRelations();
  await seedLearningMaterialProgramRelations();
  await seedClassSessions();
  await seedClassAttendances();
  await seedAssignments();
  await seedAssignmentSubmissions();
  await seedCertificates();

  console.log(
    '\nSeed success! Total: 1 admin, 25 instructors, 25 students, profiles, 5 programs, 10 courses, enrollments, 25 learning materials, class sessions, attendances, assignments, submissions, dan certificates.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
