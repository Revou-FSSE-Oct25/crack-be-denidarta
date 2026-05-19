# crack-be-denidarta

Backend for the Rapor Biru application. Built with NestJS 11 and Prisma 7.

## Tech Stack

- **Framework**: NestJS 11
- **ORM**: Prisma 7 + `@prisma/adapter-pg`
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT (access + refresh token)
- **Docs**: Swagger (`/api/docs`)

## Local Setup

```bash
npm install
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Start the dev server:
```bash
npm run start:dev
```

## Scripts

```bash
npm run start:dev   # development (watch mode)
npm run build       # production build
npm run start:prod  # run the production build
npm run test        # unit tests
npm run seed        # seed the database
```

## Prisma

```bash
npx prisma migrate dev    # create a new migration
npx prisma migrate deploy # apply migrations to production
npx prisma studio         # open the database GUI
```

## Deployment

The backend is deployed as a **Docker container** on a VPS (Ubuntu 24.04).

Docker image: `denidarta/rapor-biru-backend:latest` (Docker Hub)

### Build & push a new image

```bash
cd crack-be-denidarta
docker build --platform linux/amd64 -t denidarta/rapor-biru-backend:latest .
docker push denidarta/rapor-biru-backend:latest
```

### Update on VPS

```bash
cd ~/apps/rapor-biru
docker compose pull
docker compose up -d
```

### VPS stack (`~/apps/rapor-biru/`)

```
rapor-biru/
├── docker-compose.yml
├── .env
├── nginx/
│   └── conf.d/
│       └── api.conf      # reverse proxy for api.raporbiru.web.id
└── certbot/              # Let's Encrypt SSL certificates
```

Required environment variables in the VPS `.env`:

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | Supabase connection string |
| `FRONTEND_URL` | Frontend URL (used for CORS) |
| `JWT_ACCESS_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: `7d`) |

Live API: [https://api.raporbiru.web.id](https://api.raporbiru.web.id)

## Test Coverage
-----------------------------------------|---------|----------|---------|---------|-----------------------
File                                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------------------|---------|----------|---------|---------|-----------------------
All files                                |    61.5 |    50.98 |   42.68 |   61.37 |
 src                                     |   20.58 |       30 |   42.85 |   16.12 |
  app.controller.ts                      |     100 |       75 |     100 |     100 | 7
  app.module.ts                          |       0 |      100 |       0 |       0 | 1-70
  app.service.ts                         |     100 |      100 |     100 |     100 |
  main.ts                                |       0 |        0 |       0 |       0 | 1-35
 src/auth                                |   60.34 |    60.81 |   63.15 |   59.61 |
  auth.controller.ts                     |   96.96 |       75 |   88.88 |   96.77 | 51
  auth.module.ts                         |       0 |      100 |     100 |       0 | 1-21
  auth.service.ts                        |   53.52 |       54 |      40 |   50.79 | 35-116,149-166
 src/auth/dto                            |   77.77 |      100 |     100 |   77.77 |
  forgot-password.dto.ts                 |     100 |      100 |     100 |     100 |
  login.dto.ts                           |       0 |      100 |     100 |       0 | 1-11
  refresh.dto.ts                         |     100 |      100 |     100 |     100 |
  reset-password.dto.ts                  |     100 |      100 |     100 |     100 |
  set-password.dto.ts                    |     100 |      100 |     100 |     100 |
 src/auth/strategies                     |     100 |    83.33 |     100 |     100 |
  jwt.strategy.ts                        |     100 |      100 |     100 |     100 |
  local.strategy.ts                      |     100 |    83.33 |     100 |     100 | 8
 src/common/decorators                   |   80.95 |        0 |      75 |      75 |
  current-user.decorator.ts              |   33.33 |        0 |       0 |   33.33 | 16-20
  public.decorator.ts                    |     100 |      100 |     100 |     100 |
  resource-owner.decorator.ts            |     100 |      100 |     100 |     100 |
  roles.decorator.ts                     |     100 |      100 |     100 |     100 |
 src/common/dto                          |     100 |      100 |     100 |     100 |
  pagination-query.dto.ts                |     100 |      100 |     100 |     100 |
 src/common/filters                      |       0 |        0 |       0 |       0 |
  http-exception.filter.ts               |       0 |        0 |       0 |       0 | 1-91
 src/common/guards                       |   61.03 |     57.4 |    62.5 |   61.66 |
  DataPolicies.guard.ts                  |   96.15 |       85 |     100 |     100 | 16,37
  course-access.guard.ts                 |   30.43 |    18.75 |      50 |   27.77 | 16-55
  jwt.guard.ts                           |       0 |        0 |       0 |       0 | 1-18
  roles.guard.ts                         |     100 |    91.66 |     100 |     100 | 13
 src/common/interceptors                 |   66.66 |    33.33 |    62.5 |   66.66 |
  audit-log.interceptor.ts               |     100 |    66.66 |     100 |     100 | 28-29
  response.interceptor.ts                |       0 |        0 |       0 |       0 | 1-38
  timeout.interceptor.ts                 |   83.33 |       50 |      75 |    87.5 | 20
 src/common/middlewares                  |       0 |        0 |       0 |       0 |
  request-id.middleware.ts               |       0 |        0 |       0 |       0 | 1-11
 src/common/pipes                        |     100 |      100 |     100 |     100 |
  sanitize.pipe.ts                       |     100 |      100 |     100 |     100 |
 src/common/utils                        |     100 |      100 |     100 |     100 |
  ensure-found.util.ts                   |     100 |      100 |     100 |     100 |
  pagination.util.ts                     |     100 |      100 |     100 |     100 |
 src/config                              |       0 |      100 |     100 |       0 |
  env.config.ts                          |       0 |      100 |     100 |       0 | 1-3
 src/database                            |   43.75 |       75 |       0 |   41.66 |
  database.module.ts                     |       0 |      100 |     100 |       0 | 1-9
  prisma.service.ts                      |   63.63 |       75 |       0 |   55.55 | 12-23
 src/modules/assignments                 |   72.63 |    43.58 |      72 |   73.25 |
  assignments.controller.ts              |   95.65 |       75 |   83.33 |   95.23 | 43
  assignments.module.ts                  |       0 |      100 |     100 |       0 | 1-10
  assignments.repository.ts              |   67.64 |     42.3 |      70 |   67.74 | 32,67-128,148,218-225
  assignments.service.ts                 |   77.41 |    30.55 |   66.66 |   75.86 | 70,102-115
 src/modules/assignments/dto             |   96.49 |       75 |   66.66 |   96.49 |
  create-assignment.dto.ts               |    92.3 |       75 |       0 |    92.3 | 44
  grading-criteria-item.dto.ts           |     100 |      100 |     100 |     100 |
  response-assignment.dto.ts             |   97.22 |       75 |      80 |   97.22 | 43
  update-assignment.dto.ts               |     100 |      100 |     100 |     100 |
 src/modules/assignments/entities        |       0 |      100 |     100 |       0 |
  assignment.entity.ts                   |       0 |      100 |     100 |       0 | 1
 src/modules/attendances                 |   40.95 |       36 |   18.75 |   40.21 |
  attendances.controller.ts              |   74.07 |       75 |    12.5 |      72 | 28,40,46,53,61,73,81
  attendances.module.ts                  |       0 |      100 |     100 |       0 | 1-11
  attendances.repository.ts              |   13.95 |       10 |       0 |   11.11 | 20-211
  attendances.service.ts                 |   60.71 |       75 |   41.66 |   57.69 | 28-29,56-96
 src/modules/attendances/dto             |   89.28 |       75 |     100 |   88.88 |
  create-attendance.dto.ts               |     100 |       75 |     100 |     100 | 13
  response-attendance.dto.ts             |     100 |       75 |     100 |     100 | 16
  update-attendance.dto.ts               |       0 |      100 |     100 |       0 | 1-4
  verify-attendance.dto.ts               |     100 |       75 |     100 |     100 | 10
 src/modules/attendances/entities        |       0 |      100 |     100 |       0 |
  attendance.entity.ts                   |       0 |      100 |     100 |       0 | 1
 src/modules/class-sessions              |   57.14 |    54.23 |      32 |   55.05 |
  class-sessions.controller.ts           |   76.92 |       75 |   14.28 |      75 | 29,39,47,52,60,67
  class-sessions.module.ts               |       0 |      100 |     100 |       0 | 1-12
  class-sessions.repository.ts           |   38.88 |    23.07 |   14.28 |   31.25 | 28-124
  class-sessions.service.ts              |   63.04 |    53.84 |   54.54 |   60.46 | 54-55,62-71,106-130
 src/modules/class-sessions/dto          |   98.24 |    78.12 |     100 |     100 |
  class-session-query.dto.ts             |   93.75 |      100 |     100 |     100 |
  create-class-session.dto.ts            |     100 |      100 |     100 |     100 |
  response-class-session.dto.ts          |     100 |       75 |     100 |     100 | 19-28
  update-class-session.dto.ts            |     100 |       75 |     100 |     100 | 9
 src/modules/class-sessions/entities     |       0 |      100 |     100 |       0 |
  class-session.entity.ts                |       0 |      100 |     100 |       0 | 1
 src/modules/courses                     |   43.67 |    32.14 |   17.39 |   41.02 |
  courses.controller.ts                  |   77.27 |       75 |   16.66 |      75 | 27,35,41,49,56
  courses.module.ts                      |       0 |      100 |     100 |       0 | 1-11
  courses.repository.ts                  |   38.88 |    18.75 |    12.5 |   31.25 | 23-127
  courses.service.ts                     |   35.89 |     12.5 |   22.22 |   33.33 | 25-91,104-109
 src/modules/courses/dto                 |   92.59 |       80 |      40 |   96.15 |
  course-query.dto.ts                    |   94.73 |      100 |     100 |     100 |
  create-course.dto.ts                   |     100 |       75 |     100 |     100 | 24
  response-course.dto.ts                 |   86.36 |       75 |       0 |   90.47 | 30,34
  update-course.dto.ts                   |     100 |      100 |     100 |     100 |
 src/modules/courses/entities            |       0 |      100 |     100 |       0 |
  course.entity.ts                       |       0 |      100 |     100 |       0 | 1
 src/modules/enrollments                 |   59.42 |    52.63 |      28 |   58.33 |
  enrollments.controller.ts              |      75 |       75 |   14.28 |   72.72 | 25,33,38,43,52,60
  enrollments.module.ts                  |       0 |      100 |     100 |       0 | 1-10
  enrollments.repository.ts              |      50 |       75 |   14.28 |      40 | 11-63
  enrollments.service.ts                 |   65.38 |    27.77 |   45.45 |   65.21 | 50-73,100-110
 src/modules/enrollments/dto             |   92.85 |       75 |      40 |    92.5 |
  create-enrollment.dto.ts               |     100 |       75 |     100 |     100 | 12
  response-enrollment.dto.ts             |      90 |       75 |      40 |   89.28 | 12,15,26
  update-enrollment.dto.ts               |     100 |       75 |     100 |     100 | 10
 src/modules/enrollments/entities        |       0 |      100 |     100 |       0 |
  enrollment.entity.ts                   |       0 |      100 |     100 |       0 | 1
 src/modules/learning-materials          |   68.11 |    63.33 |   47.82 |   67.21 |
  learning-materials.controller.ts       |   72.72 |       75 |   14.28 |      70 | 25,35,40,45,53,60
  learning-materials.module.ts           |       0 |      100 |     100 |       0 | 1-10
  learning-materials.repository.ts       |      80 |       50 |   71.42 |   76.92 | 21-27,70
  learning-materials.service.ts          |      76 |       50 |   55.55 |   73.91 | 45-46,75-84
 src/modules/learning-materials/dto      |     100 |       75 |     100 |     100 |
  create-learning-material.dto.ts        |     100 |       75 |     100 |     100 | 34
  response-learning-material.dto.ts      |     100 |       75 |     100 |     100 | 20
  update-learning-material.dto.ts        |     100 |      100 |     100 |     100 |
 src/modules/learning-materials/entities |       0 |      100 |     100 |       0 |
  learning-material.entity.ts            |       0 |      100 |     100 |       0 | 1
 src/modules/profiles                    |   29.62 |    16.66 |   20.68 |   27.77 |
  profiles.controller.ts                 |       0 |        0 |       0 |       0 | 1-93
  profiles.module.ts                     |       0 |      100 |     100 |       0 | 1-11
  profiles.repository.ts                 |   26.31 |     37.5 |       0 |   18.75 | 8-74
  profiles.service.ts                    |   73.07 |       75 |      60 |   70.83 | 31-32,68-83
 src/modules/profiles/dto                |      50 |    27.27 |       0 |   52.23 |
  create-profile.dto.ts                  |       0 |        0 |       0 |       0 | 1-122
  response-profile.dto.ts                |     100 |       75 |     100 |     100 | 29-30
  update-profile.dto.ts                  |       0 |      100 |     100 |       0 | 1-4
 src/modules/profiles/entities           |       0 |      100 |     100 |       0 |
  profile.entity.ts                      |       0 |      100 |     100 |       0 | 1
 src/modules/program-certificates        |   25.43 |    13.46 |   26.92 |   24.03 |
  program-certificates.controller.ts     |       0 |        0 |       0 |       0 | 1-65
  program-certificates.module.ts         |       0 |      100 |     100 |       0 | 1-13
  program-certificates.repository.ts     |   35.29 |       75 |       0 |   26.66 | 7-111
  program-certificates.service.ts        |   35.38 |     12.5 |      70 |   33.33 | 62-163,217-256
 src/modules/program-certificates/dto    |     100 |       75 |     100 |     100 |
  response-certificate.dto.ts            |     100 |       75 |     100 |     100 | 20
 src/modules/programs                    |   29.68 |    17.64 |    9.09 |   26.78 |
  programs.controller.ts                 |       0 |        0 |       0 |       0 | 1-48
  programs.module.ts                     |       0 |      100 |     100 |       0 | 1-10
  programs.repository.ts                 |   53.84 |       75 |       0 |   45.45 | 58-96
  programs.service.ts                    |      50 |    21.42 |      20 |   45.45 | 20-71,83-88
 src/modules/programs/dto                |   62.16 |       75 |       0 |   65.71 |
  create-program.dto.ts                  |       0 |      100 |     100 |       0 | 1-20
  response-program.dto.ts                |   79.31 |       75 |       0 |   85.18 | 40,44,48,52
  update-program.dto.ts                  |       0 |      100 |     100 |       0 | 1-4
 src/modules/programs/entities           |       0 |      100 |     100 |       0 |
  program.entity.ts                      |       0 |      100 |     100 |       0 | 1
 src/modules/submissions                 |   78.57 |     80.7 |   64.51 |   78.78 |
  submissions.controller.ts              |   81.25 |       80 |      25 |      80 | 36,49,84,95,112,122
  submissions.module.ts                  |       0 |      100 |     100 |       0 | 1-13
  submissions.repository.ts              |   69.23 |    61.53 |   63.63 |   66.66 | 93-128,157
  submissions.service.ts                 |   90.41 |     84.5 |   91.66 |   90.14 | 47-64
 src/modules/submissions/dto             |   94.54 |    66.66 |      40 |   96.29 |
  create-submission.dto.ts               |     100 |       75 |     100 |     100 | 33
  criteria-score-item.dto.ts             |     100 |      100 |     100 |     100 |
  grade-submission.dto.ts                |   85.71 |      100 |       0 |   85.71 | 8
  response-submission.dto.ts             |    92.3 |    64.28 |      50 |      96 | 42
  submit-assignment.dto.ts               |     100 |      100 |     100 |     100 |
  update-submission.dto.ts               |     100 |      100 |     100 |     100 |
 src/modules/submissions/entities        |       0 |      100 |     100 |       0 |
  submission.entity.ts                   |       0 |      100 |     100 |       0 | 1
 src/modules/users                       |   67.04 |    45.83 |   55.55 |   65.82 |
  users.controller.ts                    |   86.11 |    72.22 |   66.66 |   84.84 | 35-36,57,78-79
  users.module.ts                        |       0 |      100 |     100 |       0 | 1-11
  users.repository.ts                    |   72.72 |    13.63 |   84.61 |      70 | 24,58-103
  users.service.ts                       |   52.17 |       75 |   21.42 |   47.61 | 19-29,38-79,91-97
 src/modules/users/dto                   |    90.9 |       75 |       0 |    90.9 |
  create-user.dto.ts                     |     100 |       75 |     100 |     100 | 24
  find-all-users.dto.ts                  |   84.61 |      100 |       0 |   84.61 | 18,24
  update-user.dto.ts                     |     100 |      100 |     100 |     100 |
 src/modules/users/entities              |   81.81 |      100 |   33.33 |   81.81 |
  user.entity.ts                         |   81.81 |      100 |   33.33 |   81.81 | 28,40
 src/test/factories                      |     100 |       50 |     100 |     100 |
  user.factory.ts                        |     100 |       50 |     100 |     100 | 13
-----------------------------------------|---------|----------|---------|---------|-----------------------

Test Suites: 39 passed, 39 total
Tests:       164 passed, 164 total
Snapshots:   0 total
Time:        3.599 s, estimated 5 s
