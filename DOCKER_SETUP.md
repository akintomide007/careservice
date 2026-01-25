# Docker Setup Guide

This guide explains how to run the Care Provider System using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for backend and web-dashboard
- Start PostgreSQL, Redis, Backend API, and Web Dashboard
- Set up networking between services
- Run database migrations automatically

### 2. Access the Applications

- **Web Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5433 (PostgreSQL)
- **Redis**: localhost:6379

### 3. Stop All Services

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

## Development Workflow

### Hot Reloading

Both backend and web-dashboard support hot reloading in development mode:
- Code changes are automatically detected
- No need to rebuild containers for code changes
- node_modules are isolated per container

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f web-dashboard
```

### Run Database Commands

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Push schema changes
docker-compose exec backend npx prisma db push

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npx prisma db seed

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

### Rebuild Containers

If you modify package.json or Dockerfile:

```bash
docker-compose up --build
```

### Access Container Shell

```bash
# Backend container
docker-compose exec backend sh

# Web dashboard container
docker-compose exec web-dashboard sh
```

## Service Architecture

```
┌─────────────────┐
│  Web Dashboard  │ :3000
│   (Next.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────┐
│   Backend API   │◄────►│  Redis   │ :6379
│   (Express)     │ :3001│ (Cache)  │
└────────┬────────┘      └──────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │ :5433 (mapped from :5432)
│   (Database)    │
└─────────────────┘
```

## Troubleshooting

### Port Already in Use

If you get "address already in use" errors:

```bash
# Check what's using the port
lsof -i :3000  # or 3001, 5433, 6379

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Reset Everything

To start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all -v

# Rebuild from scratch
docker-compose up --build
```

### Clear Build Cache

```bash
docker-compose build --no-cache
```

## Production Deployment

For production, modify docker-compose.yml to use `target: runner` instead of `target: development`:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: runner  # Change from development
```

And update environment variables for production security.

## Notes

- The mobile app (React Native) is not dockerized as it requires physical devices/emulators
- Uploads are persisted in a Docker volume
- Database data persists between container restarts
- Hot reloading works for both backend and frontend
