# Resource Modules Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold 8 NestJS resource modules under `src/modules/` with full CRUD structure wired to PrismaService.

**Architecture:** Each resource gets its own module folder with a module, controller, service, and two DTOs. The NestJS CLI generates the skeleton; we then wire PrismaService into each service and fill in CRUD method bodies. All modules are registered in AppModule.

**Tech Stack:** NestJS 11, Prisma 7, class-validator, class-transformer, TypeScript

---

## File Map

**Created per module (8 modules × 5 files = 40 files):**

```
src/modules/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/create-user.dto.ts
    dto/update-user.dto.ts
  courses/
    courses.module.ts
    courses.controller.ts
    courses.service.ts
    dto/create-course.dto.ts
    dto/update-course.dto.ts
  enrollments/
    enrollments.module.ts
    enrollments.controller.ts
    enrollments.service.ts
    dto/create-enrollment.dto.ts
    dto/update-enrollment.dto.ts
  learning-materials/
    learning-materials.module.ts
    learning-materials.controller.ts
    learning-materials.service.ts
    dto/create-learning-material.dto.ts
    dto/update-learning-material.dto.ts
  class-sessions/
    class-sessions.module.ts
    class-sessions.controller.ts
    class-sessions.service.ts
    dto/create-class-session.dto.ts
    dto/update-class-session.dto.ts
  attendances/
    attendances.module.ts
    attendances.controller.ts
    attendances.service.ts
    dto/create-attendance.dto.ts
    dto/update-attendance.dto.ts
  assignments/
    assignments.module.ts
    assignments.controller.ts
    assignments.service.ts
    dto/create-assignment.dto.ts
    dto/update-assignment.dto.ts
  submissions/
    submissions.module.ts
    submissions.controller.ts
    submissions.service.ts
    dto/create-submission.dto.ts
    dto/update-submission.dto.ts
```

**Modified:**
- `src/app.module.ts` — import all 8 modules

---

### Task 1: Scaffold users module

**Files:**
- Create: `src/modules/users/users.module.ts`
- Create: `src/modules/users/users.controller.ts`
- Create: `src/modules/users/users.service.ts`
- Create: `src/modules/users/dto/create-user.dto.ts`
- Create: `src/modules/users/dto/update-user.dto.ts`

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/users --no-spec
```

When prompted:
- Transport layer: `REST API`
- Generate CRUD entry points: `Yes`

- [ ] **Step 2: Wire PrismaService into users.service.ts**

Replace the contents of `src/modules/users/users.service.ts` with:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  findAll() {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to users.module.ts**

Replace the contents of `src/modules/users/users.module.ts` with:

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
```

- [ ] **Step 4: Fill in create-user.dto.ts**

```typescript
import { IsEmail, IsEnum, IsString, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  username: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

- [ ] **Step 5: Fill in update-user.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/users/
git commit -m "feat: scaffold users module"
```

---

### Task 2: Scaffold courses module

**Files:**
- Create: `src/modules/courses/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/courses --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into courses.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto });
  }

  findAll() {
    return this.prisma.course.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to courses.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService],
})
export class CoursesModule {}
```

- [ ] **Step 4: Fill in create-course.dto.ts**

```typescript
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CourseStatus)
  status: CourseStatus;

  @IsInt()
  instructorId: number;
}
```

- [ ] **Step 5: Fill in update-course.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/courses/
git commit -m "feat: scaffold courses module"
```

---

### Task 3: Scaffold enrollments module

**Files:**
- Create: `src/modules/enrollments/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/enrollments --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into enrollments.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEnrollmentDto) {
    return this.prisma.courseEnrollment.create({ data: dto });
  }

  findAll() {
    return this.prisma.courseEnrollment.findMany();
  }

  findOne(id: number) {
    return this.prisma.courseEnrollment.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateEnrollmentDto) {
    return this.prisma.courseEnrollment.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.courseEnrollment.delete({ where: { id } });
  }
}
```

- [ ] **Step 3: Add PrismaService to enrollments.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, PrismaService],
})
export class EnrollmentsModule {}
```

- [ ] **Step 4: Fill in create-enrollment.dto.ts**

```typescript
import { IsEnum, IsInt } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsInt()
  courseId: number;

  @IsInt()
  userId: number;

  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
```

- [ ] **Step 5: Fill in update-enrollment.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/enrollments/
git commit -m "feat: scaffold enrollments module"
```

---

### Task 4: Scaffold learning-materials module

**Files:**
- Create: `src/modules/learning-materials/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/learning-materials --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into learning-materials.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';

@Injectable()
export class LearningMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLearningMaterialDto) {
    return this.prisma.learningMaterial.create({ data: dto });
  }

  findAll() {
    return this.prisma.learningMaterial.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.learningMaterial.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateLearningMaterialDto) {
    return this.prisma.learningMaterial.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.learningMaterial.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to learning-materials.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialsController } from './learning-materials.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [LearningMaterialsController],
  providers: [LearningMaterialsService, PrismaService],
})
export class LearningMaterialsModule {}
```

- [ ] **Step 4: Fill in create-learning-material.dto.ts**

```typescript
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateLearningMaterialDto {
  @IsInt()
  courseId: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;

  @IsEnum(MaterialType)
  materialType: MaterialType;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
```

- [ ] **Step 5: Fill in update-learning-material.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningMaterialDto } from './create-learning-material.dto';

export class UpdateLearningMaterialDto extends PartialType(CreateLearningMaterialDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/learning-materials/
git commit -m "feat: scaffold learning-materials module"
```

---

### Task 5: Scaffold class-sessions module

**Files:**
- Create: `src/modules/class-sessions/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/class-sessions --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into class-sessions.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Injectable()
export class ClassSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClassSessionDto) {
    return this.prisma.classSession.create({ data: dto });
  }

  findAll() {
    return this.prisma.classSession.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.classSession.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateClassSessionDto) {
    return this.prisma.classSession.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.classSession.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to class-sessions.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsController } from './class-sessions.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ClassSessionsController],
  providers: [ClassSessionsService, PrismaService],
})
export class ClassSessionsModule {}
```

- [ ] **Step 4: Fill in create-class-session.dto.ts**

```typescript
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateClassSessionDto {
  @IsInt()
  courseId: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  meetingUrl?: string;
}
```

- [ ] **Step 5: Fill in update-class-session.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateClassSessionDto } from './create-class-session.dto';

export class UpdateClassSessionDto extends PartialType(CreateClassSessionDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/class-sessions/
git commit -m "feat: scaffold class-sessions module"
```

---

### Task 6: Scaffold attendances module

**Files:**
- Create: `src/modules/attendances/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/attendances --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into attendances.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAttendanceDto) {
    return this.prisma.classAttendance.create({ data: dto });
  }

  findAll() {
    return this.prisma.classAttendance.findMany();
  }

  findOne(id: number) {
    return this.prisma.classAttendance.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateAttendanceDto) {
    return this.prisma.classAttendance.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.classAttendance.delete({ where: { id } });
  }
}
```

- [ ] **Step 3: Add PrismaService to attendances.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService, PrismaService],
})
export class AttendancesModule {}
```

- [ ] **Step 4: Fill in create-attendance.dto.ts**

```typescript
import { IsEnum, IsInt } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @IsInt()
  classSessionId: number;

  @IsInt()
  userId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
```

- [ ] **Step 5: Fill in update-attendance.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/attendances/
git commit -m "feat: scaffold attendances module"
```

---

### Task 7: Scaffold assignments module

**Files:**
- Create: `src/modules/assignments/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/assignments --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into assignments.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAssignmentDto) {
    return this.prisma.assignment.create({ data: dto });
  }

  findAll() {
    return this.prisma.assignment.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.assignment.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateAssignmentDto) {
    return this.prisma.assignment.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.assignment.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to assignments.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, PrismaService],
})
export class AssignmentsModule {}
```

- [ ] **Step 4: Fill in create-assignment.dto.ts**

```typescript
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class CreateAssignmentDto {
  @IsInt()
  courseId: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  maxPoints?: number;

  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;
}
```

- [ ] **Step 5: Fill in update-assignment.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignment.dto';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/assignments/
git commit -m "feat: scaffold assignments module"
```

---

### Task 8: Scaffold submissions module

**Files:**
- Create: `src/modules/submissions/` (all files)

- [ ] **Step 1: Generate the module**

```bash
npx nest g resource modules/submissions --no-spec
```

When prompted: REST API, Yes to CRUD.

- [ ] **Step 2: Wire PrismaService into submissions.service.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSubmissionDto) {
    return this.prisma.assignmentSubmission.create({ data: dto });
  }

  findAll() {
    return this.prisma.assignmentSubmission.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.assignmentSubmission.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateSubmissionDto) {
    return this.prisma.assignmentSubmission.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.assignmentSubmission.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
```

- [ ] **Step 3: Add PrismaService to submissions.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, PrismaService],
})
export class SubmissionsModule {}
```

- [ ] **Step 4: Fill in create-submission.dto.ts**

```typescript
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class CreateSubmissionDto {
  @IsInt()
  assignmentId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  submissionText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;
}
```

- [ ] **Step 5: Fill in update-submission.dto.ts**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/submissions/
git commit -m "feat: scaffold submissions module"
```

---

### Task 9: Register all modules in AppModule

**Files:**
- Modify: `src/app.module.ts`

- [ ] **Step 1: Update app.module.ts**

Replace `src/app.module.ts` with:

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LearningMaterialsModule } from './modules/learning-materials/learning-materials.module';
import { ClassSessionsModule } from './modules/class-sessions/class-sessions.module';
import { AttendancesModule } from './modules/attendances/attendances.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    LearningMaterialsModule,
    ClassSessionsModule,
    AttendancesModule,
    AssignmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Verify the app builds**

```bash
npx nest build
```

Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app.module.ts
git commit -m "feat: register all resource modules in AppModule"
```
