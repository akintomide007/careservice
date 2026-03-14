# CareService Production Deployment Guide v2.0

## 🚀 Overview

This guide covers the enhanced production deployment system with comprehensive cleanup, automatic backups, smart port conflict resolution, and rollback capabilities.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Features](#deployment-features)
3. [Available Scripts](#available-scripts)
4. [Deployment Process](#deployment-process)
5. [Port Conflict Resolution](#port-conflict-resolution)
6. [Backup & Rollback](#backup--rollback)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Procedures](#emergency-procedures)

---

## Quick Start

### Normal Deployment (Recommended)

```bash
bash scripts/deploy-production.sh
```

This is the **safest** option that:
- ✅ Preserves PostgreSQL and Redis data volumes
- ✅ Creates automatic database backup
- ✅ Handles port conflicts intelligently
- ✅ Performs comprehensive cleanup
- ✅ Provides detailed deployment logs

---

## Deployment Features

### ✅ Phase 1: Pre-Flight Checks
- Docker & Docker Compose version verification
- Node.js version check (requires v18+)
- Disk space verification (minimum 5GB)
- Environment file validation
- Network configuration detection

### 🧹 Phase 2: Smart Cleanup
- **CareService processes**: Automatically killed
- **External processes**: Alternative ports assigned
- **Containers**: All removed (fresh build)
- **Images**: Force rebuilt (no cache)
- **Networks**: Cleaned and recreated
- **Volumes**: **PRESERVED** (safe mode)

### 🔐 Phase 3: Port Conflict Resolution
| Service | Default Port | Alternative Port |
|---------|-------------|------------------|
| Web Dashboard | 3000 | 3002 |
| Backend API | 3001 | 3003 |
| PostgreSQL | 5433 | 5434 |
| Redis | 6381 | 6382 |

**Behavior**:
- If CareService process uses port → **Killed automatically**
- If external process uses port → **Alternative port assigned**

### 💾 Phase 4: Automatic Backup
- Creates timestamped PostgreSQL backup
- Compresses backups (gzip)
- Keeps last 5 backups
- Stored in `./backups/` directory

### 🚀 Phase 5: Deployment
- Fresh Docker image build (no cache)
- Sequential service startup:
  1. PostgreSQL (wait for healthy)
  2. Redis (wait for healthy)
  3. Backend API (wait for healthy)
  4. Web Dashboard (wait for healthy)
- Database migrations applied
- Health checks performed

---

## Available Scripts

### 1. **deploy-production.sh** (Main Deployment)

```bash
bash scripts/deploy-production.sh
```

**What it does**:
- Complete production deployment with all phases
- Preserves data volumes
- Creates automatic backups
- Handles port conflicts
- Generates timestamped deployment log

**Output**: 
- Deployment log: `./deployment_YYYYMMDD_HHMMSS.log`
- Service URLs displayed at completion

---

### 2. **pre-deploy-cleanup.sh** (Standalone Cleanup)

```bash
bash scripts/pre-deploy-cleanup.sh
```

**What it does**:
- Stops all CareService containers
- Removes containers, networks, and images
- Cleans Docker build cache
- **Preserves data volumes** (PostgreSQL & Redis)
- Kills CareService processes on required ports

**Use when**: You want to clean up before manual deployment

---

### 3. **check-ports.sh** (Port Availability)

```bash
bash scripts/check-ports.sh
```

**What it does**:
- Checks ports 3000, 3001, 5433, 6381
- Identifies process using each port
- Assigns alternative ports if needed
- Saves port configuration to `/tmp/careservice_ports.env`

**Use when**: You want to verify port availability before deployment

---

### 4. **backup-database.sh** (Manual Backup)

```bash
bash scripts/backup-database.sh
```

**What it does**:
- Creates PostgreSQL dump
- Compresses with gzip
- Saves to `./backups/careservice_db_YYYYMMDD_HHMMSS.sql.gz`
- Keeps last 5 backups

**Use when**: You want to create a manual backup before changes

---

### 5. **rollback.sh** (Database Rollback)

```bash
bash scripts/rollback.sh
```

**What it does**:
- Lists available backups
- Restores most recent backup
- Drops current database
- Recreates and restores from backup
- Restarts backend service

**Use when**: You need to restore database to previous state

⚠️ **WARNING**: This will replace current database data!

---

### 6. **emergency-cleanup.sh** (Nuclear Option)

```bash
bash scripts/emergency-cleanup.sh
```

**What it does**:
- Removes **EVERYTHING** including data volumes
- Deletes PostgreSQL and Redis data
- Removes all containers, images, networks
- Cleans build cache
- Kills all processes on CareService ports

**Use when**: You need a completely clean slate

⚠️ **DANGER**: This will cause **PERMANENT DATA LOSS**!

**Requires confirmation**:
1. Type `DELETE` to confirm
2. Type `YES DELETE EVERYTHING` to proceed

---

## Deployment Process

### Step-by-Step Deployment

#### 1. Prepare Environment Files

Ensure these files exist:
- `backend/.env.production`
- `web-dashboard/.env.production`

#### 2. Run Deployment

```bash
bash scripts/deploy-production.sh
```

#### 3. Monitor Progress

The script will show:
- ✅ Pre-flight checks
- 🌐 Network configuration
- 🔍 Port availability
- 💾 Database backup (if exists)
- 🧹 Cleanup progress
- 📦 Dependency installation
- 🏗️ Image building
- 🚀 Service startup
- ✅ Health checks
- 📊 Final status

#### 4. Access Services

**Local Access**:
- Web Dashboard: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

**Network Access** (if detected):
- Web Dashboard: http://YOUR_IP:3000
- Backend API: http://YOUR_IP:3001

---

## Port Conflict Resolution

### How It Works

The deployment script intelligently handles port conflicts:

#### Scenario 1: CareService Process
```
Port 3001 used by: node backend/server.js
Action: ✅ Process killed automatically
Result: Port 3001 used for deployment
```

#### Scenario 2: External Process
```
Port 3001 used by: some-other-app
Action: ⚠️ Alternative port assigned
Result: Backend deployed on port 3003 instead
```

### Manual Port Configuration

If you want to force specific ports:

1. **Edit docker-compose.production.yml**:
```yaml
services:
  backend:
    ports:
      - "3003:3001"  # Use port 3003 instead
```

2. **Update backend/.env.production**:
```bash
CORS_ORIGIN=http://localhost:3002,http://YOUR_IP:3002
```

3. **Update web-dashboard/.env.production**:
```bash
NEXT_PUBLIC_API_URL=http://YOUR_IP:3003
```

---

## Backup & Rollback

### Automatic Backups

Backups are created automatically during deployment:
- Location: `./backups/`
- Format: `careservice_db_YYYYMMDD_HHMMSS.sql.gz`
- Retention: Last 5 backups kept

### Manual Backup

```bash
bash scripts/backup-database.sh
```

### Restore from Backup

```bash
bash scripts/rollback.sh
```

**Process**:
1. Lists all available backups
2. Shows most recent backup date
3. Prompts for confirmation
4. Drops current database
5. Restores from backup
6. Restarts services

### List Available Backups

```bash
ls -lh backups/
```

### Restore Specific Backup

```bash
# Decompress backup
gunzip -c backups/careservice_db_20260314_120000.sql.gz > /tmp/restore.sql

# Restore manually
docker exec careservice-postgres dropdb -U careuser care_provider_db
docker exec careservice-postgres createdb -U careuser care_provider_db
docker exec -i careservice-postgres psql -U careuser care_provider_db < /tmp/restore.sql

# Restart backend
docker compose -f docker-compose.production.yml restart backend
```

---

## Troubleshooting

### Common Issues

#### ❌ "Docker Compose not found"

**Solution**:
```bash
# Install Docker Compose plugin
sudo apt-get update
sudo apt-get install docker-compose-plugin

# OR install standalone docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### ❌ "Node.js version 18 or higher required"

**Solution**:
```bash
# Using nvm
nvm install 18
nvm use 18

# OR using apt (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### ❌ "Insufficient disk space"

**Solution**:
```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a --volumes

# Remove old backups
rm -f backups/careservice_db_*.sql.gz
```

#### ❌ "PostgreSQL failed to start"

**Solution**:
```bash
# Check logs
docker logs careservice-postgres

# Restart service
docker compose -f docker-compose.production.yml restart postgres

# Force recreate
docker compose -f docker-compose.production.yml up -d --force-recreate postgres
```

#### ❌ "Backend health check timed out"

**Solution**:
```bash
# Check backend logs
docker logs careservice-backend

# Common causes:
# 1. Database migration failed
docker exec careservice-backend npx prisma migrate deploy

# 2. Environment variables missing
docker exec careservice-backend printenv | grep DATABASE_URL

# 3. Rebuild backend
docker compose -f docker-compose.production.yml up -d --build --force-recreate backend
```

#### ❌ "Web Dashboard shows connection refused"

**Solution**:
```bash
# Check if API URL is correct
cat web-dashboard/.env.production | grep NEXT_PUBLIC_API_URL

# Should match: http://YOUR_IP:3001 (or alternative port)

# Rebuild dashboard
docker compose -f docker-compose.production.yml up -d --build --force-recreate web-dashboard
```

### View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f backend

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 backend
```

### Check Service Health

```bash
# All containers status
docker compose -f docker-compose.production.yml ps

# Backend health
curl http://localhost:3001/health

# PostgreSQL health
docker exec careservice-postgres pg_isready -U careuser

# Redis health
docker exec careservice-redis redis-cli ping
```

---

## Emergency Procedures

### Complete System Reset

When nothing else works:

```bash
# 1. Emergency cleanup (removes ALL data)
bash scripts/emergency-cleanup.sh

# 2. Fresh deployment
bash scripts/deploy-production.sh
```

⚠️ **WARNING**: This will delete all database data!

### Restore After Emergency Cleanup

```bash
# 1. Run fresh deployment
bash scripts/deploy-production.sh

# 2. Restore from backup (if available)
bash scripts/rollback.sh
```

### Manual Service Management

```bash
# Stop all services
docker compose -f docker-compose.production.yml down

# Start specific service
docker compose -f docker-compose.production.yml up -d postgres

# Restart service
docker compose -f docker-compose.production.yml restart backend

# View service logs
docker compose -f docker-compose.production.yml logs -f web-dashboard

# Execute command in container
docker exec -it careservice-backend bash
```

---

## Best Practices

### 🎯 Before Deployment

1. ✅ Always backup database manually
2. ✅ Review environment files
3. ✅ Check available disk space
4. ✅ Verify Docker is running
5. ✅ Test on staging environment first

### 🎯 During Deployment

1. ✅ Monitor deployment logs
2. ✅ Watch for errors or warnings
3. ✅ Verify each phase completes successfully
4. ✅ Keep deployment log file

### 🎯 After Deployment

1. ✅ Test all services are accessible
2. ✅ Verify health endpoints
3. ✅ Check application functionality
4. ✅ Monitor logs for errors
5. ✅ Keep backup files safe

### 🎯 Regular Maintenance

```bash
# Weekly: Create manual backup
bash scripts/backup-database.sh

# Monthly: Clean old Docker resources
docker system prune -a

# As needed: Review deployment logs
ls -lh deployment_*.log
```

---

## Quick Reference

### Useful Commands

```bash
# Deploy to production
bash scripts/deploy-production.sh

# Create backup
bash scripts/backup-database.sh

# Rollback database
bash scripts/rollback.sh

# Check port availability
bash scripts/check-ports.sh

# Clean system (safe)
bash scripts/pre-deploy-cleanup.sh

# Emergency reset (dangerous)
bash scripts/emergency-cleanup.sh

# View logs
docker compose -f docker-compose.production.yml logs -f

# Stop services
docker compose -f docker-compose.production.yml down

# Restart services
docker compose -f docker-compose.production.yml restart
```

### Environment Variables

**backend/.env.production**:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://careuser:carepass@postgres:5432/care_provider_db
REDIS_URL=redis://redis:6379
CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
```

**web-dashboard/.env.production**:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://YOUR_IP:3001
```

---

## Support

### Getting Help

1. **Check logs**: Review deployment log file
2. **Search issues**: Check troubleshooting section
3. **View container logs**: `docker logs <container-name>`
4. **Create issue**: Report bugs on GitHub

### Reporting Issues

Include:
- Deployment log file
- Container logs
- Environment (OS, Docker version, Node version)
- Steps to reproduce
- Expected vs actual behavior

---

**Last Updated**: March 14, 2026  
**Version**: 2.0  
**Status**: Production Ready ✅
