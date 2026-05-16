# crack-be-denidarta

Backend untuk aplikasi Rapor Biru. Dibangun dengan NestJS 11 dan Prisma 7.

## Tech Stack

- **Framework**: NestJS 11
- **ORM**: Prisma 7 + `@prisma/adapter-pg`
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT (access + refresh token)
- **Docs**: Swagger (`/api/docs`)

## Setup Lokal

```bash
npm install
```

Buat file `.env`:
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

Jalankan dev server:
```bash
npm run start:dev
```

## Scripts

```bash
npm run start:dev   # development (watch mode)
npm run build       # production build
npm run start:prod  # jalankan hasil build
npm run test        # unit test
npm run seed        # seed database
```

## Prisma

```bash
npx prisma migrate dev    # buat migration baru
npx prisma migrate deploy # apply migration ke production
npx prisma studio         # buka GUI database
```

## Deployment

Backend di-deploy sebagai **Docker container** di VPS (Ubuntu 24.04).

Docker image: `denidarta/rapor-biru-backend:latest` (Docker Hub)

### Build & push image baru

```bash
cd crack-be-denidarta
docker build --platform linux/amd64 -t denidarta/rapor-biru-backend:latest .
docker push denidarta/rapor-biru-backend:latest
```

### Update di VPS

```bash
cd ~/apps/rapor-biru
docker compose pull
docker compose up -d
```

### Stack di VPS (`~/apps/rapor-biru/`)

```
rapor-biru/
├── docker-compose.yml
├── .env
├── nginx/
│   └── conf.d/
│       └── api.conf      # reverse proxy api.raporbiru.web.id
└── certbot/              # SSL cert Let's Encrypt
```

Environment variable yang wajib ada di `.env` VPS:

| Key | Keterangan |
|-----|------------|
| `DATABASE_URL` | Supabase connection string |
| `FRONTEND_URL` | URL frontend (untuk CORS) |
| `JWT_ACCESS_SECRET` | Secret JWT access token |
| `JWT_REFRESH_SECRET` | Secret JWT refresh token |
| `JWT_ACCESS_EXPIRES_IN` | Expiry access token (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Expiry refresh token (default: `7d`) |

API live di: [https://api.raporbiru.web.id](https://api.raporbiru.web.id)
