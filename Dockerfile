# Stage 1: Install all dependencies (dev + prod)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package and tsconfig files for migrations and seeding support
COPY package.json package-lock.json tsconfig.json ./

# Copy complete node_modules from builder to support prisma migrations and tsx/typescript seeding
COPY --from=builder /app/node_modules ./node_modules

# Copy built code and configuration
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy database migration helper script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["node", "server.js"]
