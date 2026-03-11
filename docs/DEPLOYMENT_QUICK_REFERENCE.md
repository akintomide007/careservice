# 🚀 Deployment Quick Reference

## Service URLs
- **Web Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | landlord@careservice.com | landlord123 |
| Org Admin | admin@careservice.com | admin123 |
| Manager | manager@careservice.com | manager123 |
| DSP | dsp@careservice.com | dsp123 |

## Common Commands

### View Service Status
```bash
docker-compose -f docker-compose.production.yml ps
```

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
docker-compose -f docker-compose.production.yml restart web-dashboard
```

### Stop Services
```bash
docker-compose -f docker-compose.production.yml down
```

### Start Services
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Database Management
```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run db:push

# Seed database
docker-compose -f docker-compose.production.yml exec backend npm run db:seed

# Access database shell
docker-compose -f docker-compose.production.yml exec postgres psql -U careuser care_provider_db

# Backup database
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U careuser care_provider_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Container Shell Access
```bash
# Backend
docker-compose -f docker-compose.production.yml exec backend sh

# Web Dashboard
docker-compose -f docker-compose.production.yml exec web-dashboard sh
```

### Health Checks
```bash
# Backend API
curl http://localhost:3001/health

# Web Dashboard
curl http://localhost:3000
```

## Troubleshooting

### Services Won't Start
```bash
# View logs
docker-compose -f docker-compose.production.yml logs

# Rebuild
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Database Connection Issues
```bash
# Check PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres \
  pg_isready -U careuser -d care_provider_db

# View PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres
```

### Backend Errors
```bash
# Check backend logs
docker-compose -f docker-compose.production.yml logs backend

# Regenerate Prisma client
docker-compose -f docker-compose.production.yml exec backend npx prisma generate

# Run migrations
docker-compose -f docker-compose.production.yml exec backend npm run db:push
```

## Security Notes

⚠️ **Before Going Live:**
1. Update JWT_SECRET in `backend/.env.production`
2. Change database password in `docker-compose.production.yml`
3. Update CORS_ORIGIN with your domain
4. Set up SSL/TLS certificates
5. Configure firewall (allow only 22, 80, 443)
6. Set up automated backups

## Files Created

- `backend/.env.production` - Backend environment variables
- `web-dashboard/.env.production` - Frontend environment variables
- `docker-compose.production.yml` - Docker services configuration
- `scripts/generate-secrets.sh` - Generate secure secrets
- `scripts/deploy-production.sh` - Automated deployment
- `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide

## Next Steps

1. ✅ Verify all services are running
2. ✅ Test API health endpoint
3. ✅ Login to web dashboard
4. ⚠️ Update JWT_SECRET for production
5. ⚠️ Change database password
6. ⚠️ Configure SSL/TLS
7. ⚠️ Set up backups
8. ⚠️ Update CORS origins

---

For complete documentation, see `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
