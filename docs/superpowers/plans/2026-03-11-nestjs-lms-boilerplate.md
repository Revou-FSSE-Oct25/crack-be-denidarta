# NestJS LMS Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold an empty NestJS LMS backend with Prisma + PostgreSQL, JWT auth, and feature module stubs.

**Architecture:** Single monolithic NestJS app organized into feature modules (auth, users, courses, enrollments, assignments, quizzes, grades, notifications). Each module is empty/stubbed — ready for the developer to fill in. Prisma handles all DB access via a shared PrismaService.

**Tech Stack:** NestJS, Prisma, PostgreSQL, JWT (`@nestjs/jwt`, `passport-jwt`), `class-validator`, `class-transformer`

---

## Chunk 1: Project Initialization

### Task 1: Initialize NestJS project

**Files:**
- Create: `src/main.ts`
- Create: `src/app.module.ts`
- Create: `package.json`, `tsconfig.json`, `nest-cli.json`

- [ ] **Step 1: Scaffold NestJS app**

> ⚠️ **Warning:** This command scaffolds into the current directory and will overwrite existing files (`package.json`, `tsconfig.json`, `README.md`, etc.). The only pre-existing files of value are `.postman/` and `postman/` — these will NOT be touched by NestJS CLI. Confirm you're okay losing the existing `README.md` before proceeding.

Run inside repo root:
```bash
npx @nestjs/cli new . --package-manager npm --skip-git
```
When prompted "Directory is not empty. Continue?", select **Yes**.

- [ ] **Step 2: Verify it builds and runs**

```bash
npm run build
npm run start:dev
```
Expected: Server starts on `http://localhost:3000`

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: initialize NestJS project"
```

---

### Task 2: Install and configure Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Install Prisma**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

> Note: `@prisma/client` is a runtime dependency; the `prisma` CLI is a dev-only tool.

- [ ] **Step 2: Update `prisma/schema.prisma`**

Replace contents with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models will be added here later
```

- [ ] **Step 3: Set up `.env`**

`.env` (already created by `prisma init`, update the DATABASE_URL):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crack_lms?schema=public"
JWT_SECRET="change_this_secret"
```

- [ ] **Step 4: Create `.env.example`**

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_jwt_secret_here"
```

- [ ] **Step 5: Ensure `.env` is gitignored**

Check `.gitignore` has:
```
.env
```

- [ ] **Step 6: Guard against accidentally tracking `.env`**

```bash
git rm --cached .env 2>/dev/null || true
```

This is a no-op if `.env` isn't tracked yet — safe to always run.

- [ ] **Step 7: Commit**

```bash
git add prisma/ .env.example .gitignore
git commit -m "chore: add Prisma with PostgreSQL setup"
```

---

### Task 3: Create PrismaService

**Files:**
- Create: `src/prisma/prisma.module.ts`
- Create: `src/prisma/prisma.service.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create `src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- [ ] **Step 2: Create `src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Register PrismaModule in `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: Compiles with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/prisma/ src/app.module.ts
git commit -m "feat: add global PrismaModule and PrismaService"
```

---

## Chunk 2: Auth & Config Setup

### Task 4: Install auth and config dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install class-validator class-transformer
npm install -D @types/passport-jwt
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add auth, config, and validation dependencies"
```

---

### Task 5: Set up ConfigModule globally

**Files:**
- Modify: `src/app.module.ts`

- [ ] **Step 1: Update `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Commit**

```bash
git add src/app.module.ts
git commit -m "feat: add global ConfigModule"
```

---

### Task 6: Enable global validation pipe in `main.ts`

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Update `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- [ ] **Step 2: Commit**

```bash
git add src/main.ts
git commit -m "feat: enable global validation pipe and api prefix"
```

---

## Chunk 3: Feature Module Stubs

### Task 7: Generate feature module stubs

Each module gets a module file, an empty controller, and an empty service. Run these NestJS CLI commands one by one:

**Files created per module:** `src/<module>/<module>.module.ts`, `src/<module>/<module>.controller.ts`, `src/<module>/<module>.service.ts`

- [ ] **Step 1: Generate all modules**

```bash
npx nest generate module auth
npx nest generate controller auth --no-spec
npx nest generate service auth --no-spec

npx nest generate module users
npx nest generate controller users --no-spec
npx nest generate service users --no-spec

npx nest generate module courses
npx nest generate controller courses --no-spec
npx nest generate service courses --no-spec

npx nest generate module enrollments
npx nest generate controller enrollments --no-spec
npx nest generate service enrollments --no-spec

npx nest generate module assignments
npx nest generate controller assignments --no-spec
npx nest generate service assignments --no-spec

npx nest generate module quizzes
npx nest generate controller quizzes --no-spec
npx nest generate service quizzes --no-spec

npx nest generate module grades
npx nest generate controller grades --no-spec
npx nest generate service grades --no-spec

npx nest generate module notifications
npx nest generate controller notifications --no-spec
npx nest generate service notifications --no-spec
```

The CLI automatically appends each new module to the `imports` array in `src/app.module.ts`. Do NOT manually restore `app.module.ts` to a previous snapshot after these commands run — let the CLI manage it.

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: Compiles with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: scaffold feature module stubs (auth, users, courses, enrollments, assignments, quizzes, grades, notifications)"
```

---

### Task 8: Add JWT auth stub

**Files:**
- Modify: `src/auth/auth.module.ts`

- [ ] **Step 1: Update `src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/auth/
git commit -m "feat: configure JwtModule in AuthModule"
```

---

## Chunk 4: Final Wiring

### Task 9: Run the app end-to-end

- [ ] **Step 1: Start dev server**

```bash
npm run start:dev
```
Expected: App starts on port 3000, no errors in console. (DB connection will fail if Postgres isn't running — that's fine for a boilerplate check.)

- [ ] **Step 2: Test the root endpoint**

```bash
curl http://localhost:3000/api
```

Expected: `Hello World!` (the default AppController maps `GET /` which becomes `GET /api` under the global prefix). A 404 also confirms the server is running — acceptable for a boilerplate.

- [ ] **Step 3: Final commit**

```bash
git add src/ docs/
git commit -m "chore: finalize NestJS LMS boilerplate"
```

---

## Summary

After completing all tasks, the project will have:

| Module | Status |
|---|---|
| `prisma` | Global PrismaService connected to PostgreSQL |
| `auth` | Module with JwtModule configured, empty controller/service |
| `users` | Empty stub |
| `courses` | Empty stub |
| `enrollments` | Empty stub |
| `assignments` | Empty stub |
| `quizzes` | Empty stub |
| `grades` | Empty stub |
| `notifications` | Empty stub |

**Next steps (when ready):**
- Define Prisma models in `prisma/schema.prisma` and run `npx prisma migrate dev`
- Implement `auth` (register, login, JWT strategy, guards)
- Build out each feature module one by one
