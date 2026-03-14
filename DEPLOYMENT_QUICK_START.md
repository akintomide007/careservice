# 🚀 CareService Production Deployment - Quick Start

## One-Command Deployment

```bash
bash scripts/deploy-production.sh
```

That's it! The script handles everything automatically.

---

## What It Does

✅ **Pre-flight checks** - Docker, Node.js, disk space, environment files  
✅ **Automatic backup** - PostgreSQL database backed up before deployment  
✅ **Smart cleanup** - Removes old containers/images, **preserves data volumes**  
✅ **Port conflict resolution** - Kills CareService processes, assigns alternatives for external processes  
✅ **Fresh build** - No cache, clean images  
✅ **Health monitoring** - Waits for all services to be healthy  
✅ **Database migrations** - Automatically applied  
✅ **Deployment log** - Timestamped log file created  

---

## Port Behavior

| Service | Default | Alternative | Conflict Handling |
|---------|---------|-------------|-------------------|
| Web Dashboard | 3000 | 3002 | CareService process → killed<br>External process → use 3002 |
| Backend API | 3001 | 3003 | CareService process → killed<br>External process → use 3003 |
| PostgreSQL | 5433 | 5434 | CareService process → killed<br>External process → use 5434 |
| Redis | 6381 | 6382 | CareService process → killed<br>External process → use 6382 |

---

## Available Scripts

### 🎯 Main Deployment
```bash
bash scripts/deploy-production.sh      # Full production deployment
```

### 🛠️ Utility Scripts
```bash
bash scripts/pre-deploy-cleanup.sh     # Cleanup (preserves data)
bash scripts/check-ports.sh            # Check port availability
bash scripts/backup-database.sh        # Manual database backup
bash scripts/rollback.sh               # Restore from backup
bash scripts/emergency-cleanup.sh      # ⚠️ NUCLEAR OPTION - deletes ALL data
```

---

## Access Your Application

After successful deployment:

**Local**:
- Web Dashboard: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

**Network** (if applicable):
- Web Dashboard: http://YOUR_IP:3000
- Backend API: http://YOUR_IP:3001

---

## Common Commands

```bash
# View all service logs
docker compose -f docker-compose.production.yml logs -f

# View specific service logs
docker compose -f docker-compose.production.yml logs -f backend

# Check service status
docker compose -f docker-compose.production.yml ps

# Restart a service
docker compose -f docker-compose.production.yml restart backend

# Stop all services
docker compose -f docker-compose.production.yml down
```

---

## Troubleshooting

### Services won't start?
```bash
# Check logs
docker compose -f docker-compose.production.yml logs -f

# Try emergency cleanup and redeploy
bash scripts/emergency-cleanup.sh    # ⚠️ Deletes all data!
bash scripts/deploy-production.sh
```

### Need to rollback?
```bash
bash scripts/rollback.sh             # Restores latest backup
```

### Port conflicts?
The deployment script handles this automatically! Just run it and it will either:
- Kill CareService processes using the ports
- Assign alternative ports if external processes are using them

---

## Data Safety

### ✅ Safe Operations (Preserve Data)
- `deploy-production.sh` - **Preserves** PostgreSQL and Redis volumes
- `pre-deploy-cleanup.sh` - **Preserves** data volumes
- `backup-database.sh` - Creates backup
- `rollback.sh` - Restores from backup

### ⚠️ Dangerous Operations (Data Loss)
- `emergency-cleanup.sh` - **DELETES EVERYTHING** (requires double confirmation)

---

## Your Deployment Answers

Based on your requirements, the deployment system:

1. ✅ **Preserves PostgreSQL and Redis volumes** by default
2. ✅ **Smart port handling**:
   - CareService processes → Killed automatically
   - External processes → Alternative ports assigned
3. ✅ **Automatic database backups** before each deployment

---

## Full Documentation

For detailed information, see:
- **Complete Guide**: `docs/PRODUCTION_DEPLOYMENT_V2.md`
- **Troubleshooting**: Check the documentation for common issues and solutions
- **Best Practices**: Pre-deployment, during deployment, and post-deployment guidelines

---

## Need Help?

1. Check deployment log: `./deployment_YYYYMMDD_HHMMSS.log`
2. View service logs: `docker logs careservice-backend`
3. Review documentation: `docs/PRODUCTION_DEPLOYMENT_V2.md`

---

**Status**: Production Ready ✅  
**Version**: 2.0  
**Last Updated**: March 14, 2026
