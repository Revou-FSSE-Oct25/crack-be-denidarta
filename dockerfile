# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner

WORKDIR /app

# Install production deps (prisma included — needed for CLI and client)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client (prisma is in dependencies, so available)
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/src/main"]
