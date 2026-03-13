# Backend Dockerfile - Multi-stage build
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma (Alpine 3.22 uses OpenSSL 3.x)
RUN apk add --no-cache openssl openssl-dev

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Copy package files first
COPY --from=builder /app/package*.json ./

# Copy prisma schema
COPY --from=builder /app/prisma ./prisma

# Copy node_modules (includes Prisma CLI)
COPY --from=builder /app/node_modules ./node_modules

# Regenerate Prisma Client in the production environment
# This ensures binary compatibility with Alpine Linux
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Fix permissions
RUN chown -R node:node /app

USER node

EXPOSE 3001

CMD ["npm", "start"]

# Development stage (for docker-compose with hot reload)
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install all dependencies including dev dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Don't switch to node user in development to avoid permission issues with volumes
# USER node

EXPOSE 3001

CMD ["npm", "run", "dev"]
