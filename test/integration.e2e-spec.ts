import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, EnrollmentStatus } from '@prisma/client';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

interface CourseResponse {
  id: string;
  name: string;
  // Add other properties if needed for assertions
}

interface EnrollmentResponse {
  id: string;
  programId: string;
  userId: string;
  status: EnrollmentStatus;
  // Add other properties if needed for assertions
}

describe('Program Enrollment Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data IDs
  let adminId: string;
  let instructorId: string;
  let studentId: string;
  let programId: string;
  let courseId: string;

  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    // Clean up created entities
    try {
      await prisma.classSession.deleteMany({ where: { courseId: courseId } });
    } catch (_e) {
      void _e; // Intentionally ignore errors during cleanup
    }
    try {
      await prisma.course.deleteMany({ where: { id: courseId } });
    } catch (_e) {
      void _e; // Intentionally ignore errors during cleanup
    }
    try {
      await prisma.programEnrollment.deleteMany({
        where: { programId, userId: studentId },
      });
    } catch (_e) {
      void _e; // Intentionally ignore errors during cleanup
    }
    try {
      await prisma.program.deleteMany({ where: { id: programId } });
    } catch (_e) {
      void _e; // Intentionally ignore errors during cleanup
    }
    try {
      await prisma.user.deleteMany({
        where: { id: { in: [adminId, instructorId, studentId] } },
      });
    } catch (_e) {
      void _e; // Intentionally ignore errors during cleanup
    }

    await app.close();
  });

  it('setup test data', async () => {
    // 1. Create Admin
    const admin = await prisma.user.create({
      data: {
        username: 'admin_test_' + Date.now(),
        email: 'admin_test_' + Date.now() + '@example.com',
        role: UserRole.admin,
      },
    });
    adminId = admin.id;
    adminToken = jwtService.sign(
      { sub: admin.id, role: admin.role, email: admin.email },
      { secret: process.env.JWT_ACCESS_SECRET },
    );

    // 2. Create Instructor
    const instructor = await prisma.user.create({
      data: {
        username: 'instructor_test_' + Date.now(),
        email: 'instructor_test_' + Date.now() + '@example.com',
        role: UserRole.instructor,
      },
    });
    instructorId = instructor.id;

    // 3. Create Student
    const student = await prisma.user.create({
      data: {
        username: 'student_test_' + Date.now(),
        email: 'student_test_' + Date.now() + '@example.com',
        role: UserRole.student,
      },
    });
    studentId = student.id;
    studentToken = jwtService.sign(
      { sub: student.id, role: student.role, email: student.email },
      { secret: process.env.JWT_ACCESS_SECRET },
    );

    // 4. Create Program via DB
    const program = await prisma.program.create({
      data: {
        name: 'Integration Test Program',
        createdBy: admin.id,
      },
    });
    programId = program.id;

    // 5. Create Course in Program via DB
    const course = await prisma.course.create({
      data: {
        name: 'Integration Test Course',
        instructorId: instructor.id,
        programId: program.id,
        status: 'active',
      },
    });
    courseId = course.id;
  });

  it('student should not see the course before enrollment', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    // Expect the course array not to include the newly created course
    const courses: CourseResponse[] =
      (res.body as { data: PaginatedResponse<CourseResponse> }).data?.data ||
      [];
    const foundCourse = courses.find((c) => c.id === courseId);
    expect(foundCourse).toBeUndefined();
  });

  it('admin enrolls student to the program', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        programId: programId,
        userId: studentId,
        status: EnrollmentStatus.enrolled,
      })
      .expect(201);

    const enrollmentData = (res.body as { data: { data: EnrollmentResponse } })
      .data.data;
    expect(enrollmentData.programId).toBe(programId);
    expect(enrollmentData.userId).toBe(studentId);
    expect(enrollmentData.status).toBe(EnrollmentStatus.enrolled);
  });

  it('student accesses the assets (courses) of their program', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    // Student should now see the course associated with the enrolled program
    const courses: CourseResponse[] =
      (res.body as { data: PaginatedResponse<CourseResponse> }).data?.data ||
      [];
    const foundCourse = courses.find((c) => c.id === courseId);
    expect(foundCourse).toBeDefined();
    expect(foundCourse?.name).toBe('Integration Test Course');
  });

  it('student accesses specific course details', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const courseDetails = (res.body as { data: { data: CourseResponse } }).data
      .data;
    expect(courseDetails.id).toBe(courseId);
    expect(courseDetails.name).toBe('Integration Test Course');
  });
});
