# Database Setup Guide

This guide covers how to set up your PostgreSQL database for CareService, whether using Docker or a local PostgreSQL installation.

---

## Table of Contents
- [Option 1: Docker PostgreSQL](#option-1-docker-postgresql)
- [Option 2: Local PostgreSQL](#option-2-local-postgresql)
- [Database Reset](#database-reset)
- [Troubleshooting](#troubleshooting)

---

## Option 1: Docker PostgreSQL

### Prerequisites
- Docker and Docker Compose installed
- Ports 5433 and 6379 available

### Setup Steps

1. **Copy Docker environment file:**
   ```bash
   cd backend
   cp .env.docker.example .env
   ```

2. **Start Docker containers:**
   ```bash
   cd .. # Back to project root
   docker-compose up -d postgres redis
   ```

3. **Verify services are running:**
   ```bash
   docker ps
   ```
   You should see `postgres` and `redis` containers running.

4. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

5. **Seed database with landlord user:**
   ```bash
   npm run seed:landlord
   ```

6. **Start the backend:**
   ```bash
   npm run dev
   ```

### Docker Connection Details
- **Host:** localhost
- **Port:** 5433
- **Database:** care_provider_db
- **User:** careuser
- **Password:** carepass

---

## Option 2: Local PostgreSQL

### Prerequisites
- PostgreSQL 12+ installed locally
- PostgreSQL service running

### Installation

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Arch Linux:
```bash
sudo pacman -S postgresql
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Automated Setup (Recommended)

We provide a script that handles everything automatically:

```bash
# From project root
./scripts/setup-local-postgres.sh
```

The script will:
1. Check if PostgreSQL is installed and running
2. Prompt for your PostgreSQL password
3. Create the database
4. Create/update your `.env` file
5. Run migrations
6. Optionally seed with landlord user

### Manual Setup

If you prefer manual setup:

1. **Set PostgreSQL password (if not already set):**
   ```bash
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'yourpassword';
   \q
   ```

2. **Create database:**
   ```bash
   sudo -u postgres createdb careservice_db
   ```

3. **Copy local environment file:**
   ```bash
   cd backend
   cp .env.local.example .env
   ```

4. **Update password in .env:**
   ```bash
   # Edit .env and update:
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/careservice_db
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Seed database:**
   ```bash
   npm run seed:landlord
   ```

7. **Start the backend:**
   ```bash
   npm run dev
   ```

### Local Connection Details
- **Host:** localhost
- **Port:** 5432
- **Database:** careservice_db
- **User:** postgres
- **Password:** (your PostgreSQL password)

---

## Database Reset

To completely reset your database (⚠️ **WARNING: Deletes ALL data**):

### Using Script (Recommended):
```bash
# From project root
./scripts/reset-database.sh
```

### Manual Reset:
```bash
cd backend
npx prisma migrate reset --force
npm run seed:landlord
```

This will:
1. Drop all tables
2. Re-run all migrations
3. Optionally seed with landlord user

---

## Initial Credentials

After seeding, you can login with:

**Landlord (Super Admin):**
- Email: `landlord@careservice.com`
- Password: `landlord123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## Verification

### Test Database Connection:
```bash
cd backend
npx prisma db pull
```

### Open Prisma Studio:
```bash
npm run db:studio
```
Then visit http://localhost:5555

### Check Tables:
```bash
# Docker
docker exec -it careservice-postgres psql -U careuser -d care_provider_db -c "\dt"

# Local
psql -U postgres -d careservice_db -c "\dt"
```

---

## Troubleshooting

### PostgreSQL Not Running

**Docker:**
```bash
docker-compose up -d postgres
```

**Local (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Local (macOS):**
```bash
brew services start postgresql
brew services list
```

### Connection Refused

1. Check PostgreSQL is running
2. Verify port is correct (5432 for local, 5433 for Docker)
3. Check firewall settings
4. Verify DATABASE_URL in `.env`

### Password Authentication Failed

1. Check password in `.env` matches your PostgreSQL password
2. For local setup, verify postgres user password:
   ```bash
   sudo -u postgres psql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

### Migration Errors

1. **Reset and try again:**
   ```bash
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Port Already in Use

**Docker (port 5433):**
```bash
# Find what's using the port
sudo lsof -i :5433
# Stop the conflicting service or change Docker port in docker-compose.yml
```

**Local (port 5432):**
```bash
# Find what's using the port
sudo lsof -i :5432
# If it's another PostgreSQL instance, stop it:
sudo systemctl stop postgresql
```

### Database Already Exists

**Drop and recreate:**
```bash
# Docker
docker exec -it careservice-postgres psql -U careuser -c "DROP DATABASE care_provider_db;"
docker exec -it careservice-postgres psql -U careuser -c "CREATE DATABASE care_provider_db;"

# Local
sudo -u postgres psql -c "DROP DATABASE careservice_db;"
sudo -u postgres psql -c "CREATE DATABASE careservice_db;"
```

---

## Switching Between Docker and Local

### From Docker to Local:
1. Stop Docker containers:
   ```bash
   docker-compose down
   ```
2. Follow [Local PostgreSQL Setup](#option-2-local-postgresql)

### From Local to Docker:
1. Stop local PostgreSQL (optional):
   ```bash
   sudo systemctl stop postgresql  # Ubuntu/Debian
   brew services stop postgresql   # macOS
   ```
2. Follow [Docker PostgreSQL Setup](#option-1-docker-postgresql)

---

## Additional Commands

### Backup Database:
```bash
# Docker
docker exec careservice-postgres pg_dump -U careuser care_provider_db > backup.sql

# Local
pg_dump -U postgres careservice_db > backup.sql
```

### Restore Database:
```bash
# Docker
docker exec -i careservice-postgres psql -U careuser care_provider_db < backup.sql

# Local
psql -U postgres careservice_db < backup.sql
```

### View Logs:
```bash
# Docker
docker logs careservice-postgres

# Local (Ubuntu/Debian)
sudo journalctl -u postgresql

# Local (macOS)
tail -f /usr/local/var/log/postgresql@14.log
```

---

## Next Steps

Once your database is set up:
1. ✅ Database configured and running
2. ✅ Migrations completed
3. ✅ Landlord user seeded
4. → See [User Registration Test Guide](./USER_REGISTRATION_TEST_GUIDE.md)
5. → Start creating tenants and users!

---

**Last Updated:** February 28, 2026
