# 🚀 Production Deployment Guide - CareService

Complete guide for deploying CareService to production using Docker.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Deployment Steps](#manual-deployment-steps)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)
- [Backup & Recovery](#backup--recovery)

---

## Prerequisites

### Required Software
- ✅ **Docker** & **Docker Compose** installed
- ✅ **Node.js 20+** (verified with `node -v`)
- ✅ **Git** for version control
- ⚠️ **SSL/TLS Certificate** (recommended for production)

### Server Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **OS**: Ubuntu 20.04+, Debian 11+, or any Linux with Docker support

---

## 🚀 Quick Start (Automated)

### 1. Generate Secure Secrets
```bash
# Make script executable
chmod +x scripts/generate-secrets.sh

# Generate secrets
./scripts/generate-secrets.sh
```

**Copy the JWT_SECRET** and update `backend/.env.production`:
```bash
nano backend/.env.production
# Replace: CHANGE_THIS_TO_SECURE_RANDOM_32_CHAR_STRING_IN_PRODUCTION
# With the generated JWT_SECRET
```

### 2. Run Automated Deployment
```bash
# Make script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

The script will:
- ✅ Check Node.js version
- ✅ Verify environment files
- ✅ Install dependencies
- ✅ Fix security vulnerabilities
- ✅ Build Docker images
- ✅ Start all services
- ✅ Run database migrations
- ✅ Optionally seed database

### 3. Verify Deployment
```bash
# Check services status
docker-compose -f docker-compose.production.yml ps

# Test API health
curl http://localhost:3001/health

# Test web dashboard
curl http://localhost:3000
```

**Access URLs**:
- 🌐 **Web Dashboard**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001
- 🏥 **Health Check**: http://localhost:3001/health

---

## 📝 Manual Deployment Steps

If you prefer manual control, follow these steps:

### Step 1: Prepare Environment Files

#### Backend Environment
```bash
# Copy production template
cp backend/.env.example backend/.env.production

# Edit with your settings
nano backend/.env.production
```

**Required Changes**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://careuser:YOUR_PASSWORD@postgres:5432/care_provider_db
JWT_SECRET=<YOUR_GENERATED_SECRET_32_CHARS>
CORS_ORIGIN=https://yourdomain.com
```

#### Web Dashboard Environment
```bash
# Create production env file
nano web-dashboard/.env.production
```

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_TELEMETRY_DISABLED=1
```

### Step 2: Update Docker Compose (Optional)

If you want to use different passwords or ports:

```bash
nano docker-compose.production.yml
```

Update:
- `POSTGRES_PASSWORD`
- `DATABASE_URL` (must match POSTGRES_PASSWORD)
- Port mappings if needed

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install --production=false
npm audit fix

# Web Dashboard
cd ../web-dashboard
npm install --production=false
npm audit fix

cd ..
```

### Step 4: Build Docker Images

```bash
# Build all services
docker-compose -f docker-compose.production.yml build --no-cache

# This may take 5-10 minutes
```

### Step 5: Start Services

```bash
# Start in detached mode
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 6: Database Setup

```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run db:push

# Seed initial data (optional)
docker-compose -f docker-compose.production.yml exec backend npm run db:seed
```

### Step 7: Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Test backend health
curl http://localhost:3001/health

# Expected response: {"status":"ok","timestamp":"..."}
```

---

## 🔒 Security Checklist

### Critical Security Steps

#### 1. Generate Secure JWT Secret
```bash
# Generate 32-character secret
openssl rand -base64 32

# Update in backend/.env.production
JWT_SECRET=<generated_secret>
```

#### 2. Change Database Password
```bash
# Generate password
openssl rand -base64 24

# Update docker-compose.production.yml
POSTGRES_PASSWORD: <new_password>

# Update backend/.env.production
DATABASE_URL=postgresql://careuser:<new_password>@postgres:5432/care_provider_db
```

#### 3. Update CORS Origins
```bash
# In backend/.env.production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

#### 4. Enable HTTPS (Recommended)

**Option A: Using Nginx Reverse Proxy**

Create `nginx/nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Web Dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option B: Using Certbot (Let's Encrypt)**
```bash
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

#### 5. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### 6. Environment File Permissions
```bash
# Restrict access to env files
chmod 600 backend/.env.production
chmod 600 web-dashboard/.env.production
```

#### 7. Disable MS365 Mock
```bash
# In backend/.env.production
USE_MOCK_MS365=false
```

---

## 🐛 Troubleshooting

### Issue: Services Won't Start

**Solution 1: Check Docker Status**
```bash
# View service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs
```

**Solution 2: Rebuild Images**
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Issue: Database Connection Failed

**Check PostgreSQL**
```bash
# Test connection
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U careuser -d care_provider_db -c "SELECT 1;"

# View PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres
```

**Verify DATABASE_URL**
```bash
# Check environment variable
docker-compose -f docker-compose.production.yml exec backend \
  printenv DATABASE_URL
```

### Issue: Backend Returns 500 Errors

**Check Backend Logs**
```bash
docker-compose -f docker-compose.production.yml logs backend
```

**Common Causes**:
- Missing JWT_SECRET
- Wrong DATABASE_URL
- Prisma client not generated
- Missing migrations

**Fix**:
```bash
# Regenerate Prisma client
docker-compose -f docker-compose.production.yml exec backend \
  npx prisma generate

# Run migrations
docker-compose -f docker-compose.production.yml exec backend \
  npm run db:push
```

### Issue: Web Dashboard Shows 404

**Check Next.js Build**
```bash
# View web-dashboard logs
docker-compose -f docker-compose.production.yml logs web-dashboard

# Rebuild if needed
docker-compose -f docker-compose.production.yml build web-dashboard
docker-compose -f docker-compose.production.yml restart web-dashboard
```

### Issue: Port Already in Use

**Find and Kill Process**
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.production.yml
```

### Issue: Out of Memory

**Increase Docker Memory**
```bash
# Edit Docker settings or add to docker-compose
services:
  backend:
    mem_limit: 1g
  web-dashboard:
    mem_limit: 2g
```

---

## 🔧 Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f web-dashboard
docker-compose -f docker-compose.production.yml logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations if schema changed
docker-compose -f docker-compose.production.yml exec backend npm run db:push
```

### Access Container Shell
```bash
# Backend
docker-compose -f docker-compose.production.yml exec backend sh

# Database
docker-compose -f docker-compose.production.yml exec postgres psql -U careuser care_provider_db
```

### Monitor Resource Usage
```bash
# View stats
docker stats

# View disk usage
docker system df
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune

# Remove unused networks
docker network prune
```

---

## 💾 Backup & Recovery

### Database Backup

**Manual Backup**
```bash
# Create backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U careuser care_provider_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Automated Daily Backup (Cron Job)**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /home/arksystems/Desktop/careService && docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U careuser care_provider_db > /path/to/backups/backup_$(date +\%Y\%m\%d).sql
```

### Database Restore
```bash
# Stop backend to prevent connections
docker-compose -f docker-compose.production.yml stop backend

# Restore from backup
cat backup_20260310.sql | docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U careuser care_provider_db

# Start backend
docker-compose -f docker-compose.production.yml start backend
```

### Volume Backup
```bash
# Backup uploaded files
docker run --rm \
  -v careservice_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data
```

### Full System Backup
```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U careuser care_provider_db > backups/db_backup.sql

# Backup uploads
cp -r backend/uploads backups/

# Backup environment files
cp backend/.env.production backups/
cp web-dashboard/.env.production backups/

# Create compressed archive
tar czf careservice_backup_$(date +%Y%m%d).tar.gz backups/
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints
```bash
# Backend health
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}
```

### Service Status
```bash
# Check all containers
docker-compose -f docker-compose.production.yml ps

# Check specific service health
docker inspect careservice-backend --format='{{.State.Health.Status}}'
```

### Database Monitoring
```bash
# Connect to database
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U careuser care_provider_db

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('care_provider_db'));
```

---

## 🔄 Scaling & Performance

### Horizontal Scaling (Multiple Instances)

Update `docker-compose.production.yml`:
```yaml
backend:
  deploy:
    replicas: 3
```

### Vertical Scaling (More Resources)
```yaml
backend:
  cpus: 2
  mem_limit: 2g
```

### Enable Redis Caching
```bash
# Redis is already configured in docker-compose
# Ensure REDIS_URL is set in backend/.env.production
REDIS_URL=redis://redis:6379
```

---

## 📚 Additional Resources

- **API Documentation**: See `docs/API_DOCUMENTATION.md`
- **Multi-Tenant Guide**: See `fixDocummentation/MULTI_TENANT_ARCHITECTURE.md`
- **Role Hierarchy**: See `docs/ROLE_BASED_ACCESS_IMPLEMENTATION_COMPLETE.md`
- **Database Schema**: See `backend/prisma/schema.prisma`

---

## 🆘 Support

### Test Accounts (After Seeding)
- **Super Admin**: landlord@careservice.com / landlord123
- **Org Admin**: admin@careservice.com / admin123
- **Manager**: manager@careservice.com / manager123
- **DSP**: dsp@careservice.com / dsp123

### Common Commands Reference
```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Stop services
docker-compose -f docker-compose.production.yml down

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart
docker-compose -f docker-compose.production.yml restart

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run db:push

# Seed database
docker-compose -f docker-compose.production.yml exec backend npm run db:seed

# Access backend shell
docker-compose -f docker-compose.production.yml exec backend sh

# Access database
docker-compose -f docker-compose.production.yml exec postgres psql -U careuser care_provider_db

# View service status
docker-compose -f docker-compose.production.yml ps
```

---

## ✅ Production Checklist

- [ ] Node.js 20+ installed
- [ ] Docker and Docker Compose installed
- [ ] Generated secure JWT_SECRET
- [ ] Changed default database password
- [ ] Updated CORS_ORIGIN with production domain
- [ ] Disabled USE_MOCK_MS365
- [ ] Set up SSL/TLS certificates
- [ ] Configured firewall
- [ ] Set up automated backups
- [ ] Tested health endpoints
- [ ] Verified all services running
- [ ] Created test accounts
- [ ] Documented custom configuration
- [ ] Set up monitoring (optional)
- [ ] Configured log rotation (optional)

---

**Deployment Complete! 🎉**

Your CareService platform is now running in production mode!
