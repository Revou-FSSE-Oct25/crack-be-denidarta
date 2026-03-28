# Resource Modules Scaffold Design

**Date:** 2026-03-28

## Overview

Scaffold 8 NestJS resource modules under `src/modules/` using the NestJS CLI (`nest g resource`), each with full CRUD structure wired to Prisma.

## Modules

| Module | Path |
|---|---|
| users | `src/modules/users/` |
| courses | `src/modules/courses/` |
| enrollments | `src/modules/enrollments/` |
| learning-materials | `src/modules/learning-materials/` |
| class-sessions | `src/modules/class-sessions/` |
| attendances | `src/modules/attendances/` |
| assignments | `src/modules/assignments/` |
| submissions | `src/modules/submissions/` |

## Per-Module Structure

Each module contains:

```
<resource>/
  <resource>.module.ts
  <resource>.controller.ts      # REST: findAll, findOne, create, update, remove
  <resource>.service.ts         # Prisma CRUD calls
  dto/
    create-<resource>.dto.ts
    update-<resource>.dto.ts    # extends PartialType(Create DTO)
```

## Generation Command

```bash
nest g resource modules/<resource> --no-spec
```

Select "REST API" when prompted and "yes" to generate CRUD entry points.

## Integration

- Each module imported into `AppModule`
- `PrismaService` injected into each service via constructor
- `PrismaModule` (or direct `PrismaService` provider) shared across modules
