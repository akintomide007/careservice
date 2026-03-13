# Quick Deployment Guide

## 🚀 Deploy to Any Production Server

Follow these simple steps to deploy CareService to a new production server:

### 1️⃣ Install Prerequisites (One-time setup)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Install Docker Compose Plugin (v2 - IMPORTANT!)
sudo apt install docker-compose-plugin -y
```

**⚠️ Important**: Log out and back in after Docker installation!

---

### 2️⃣ Clone & Deploy

```bash
# Clone repository
cd ~
git clone https://github.com/akintomide007/careservice.git
cd careservice

# Run automated deployment script (handles everything!)
bash scripts/deploy-production.sh
```

**That's it! ONE COMMAND!** The script automatically:
- ✅ Checks and fixes Docker Compose version (if needed)
- ✅ Cleans up any leftover containers
- ✅ Detects your server IP
- ✅ Configures all environment files
- ✅ Installs dependencies
- ✅ Builds Docker images
- ✅ Starts all services
- ✅ Sets up the database

---

### 3️⃣ Access Your Application

After deployment completes, access your application at:

- **Web Dashboard**: `http://[YOUR-SERVER-IP]:3000`
- **API Endpoint**: `http://[YOUR-SERVER-IP]:3001`

**Default Login:**
- Email: `landlord@careservice.com`
- Password: `landlord123`

**⚠️ Change the password after first login!**

---

## 🔧 Common Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart services
docker-compose -f docker-compose.production.yml restart

# Update to latest version
cd ~/careservice
git pull origin main
bash scripts/deploy-production.sh
```

---

## 🔒 Security Setup (Recommended)

```bash
# Open firewall ports
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Generate new JWT secret
openssl rand -base64 32
# Copy output and update backend/.env.production JWT_SECRET

# Restart after changes
docker-compose -f docker-compose.production.yml restart
```

---

## 🚨 Troubleshooting

### Any Docker Compose Issues?

**No worries!** The deployment script now automatically:
- ✅ Detects old docker-compose versions
- ✅ Upgrades to Docker Compose Plugin automatically
- ✅ Cleans up container conflicts
- ✅ Handles all common deployment issues

**Just run the deployment script** - it fixes everything!

If you still encounter issues, standalone fix scripts are available:
- `bash scripts/fix-docker-compose.sh` - Fix Docker Compose version
- `bash scripts/cleanup-containers.sh` - Clean up containers

---

## 📚 Need More Help?

See the complete guide: [docs/PRODUCTION_SERVER_DEPLOYMENT.md](docs/PRODUCTION_SERVER_DEPLOYMENT.md)

---

## ✅ What Makes This Easy

The `deploy-production.sh` script handles everything automatically:

1. **Docker Compose Auto-Fix** - Detects and upgrades old versions
2. **Container Cleanup** - Removes conflicts automatically
3. **Auto IP Detection** - No manual configuration needed
4. **Environment Setup** - All configs updated automatically
5. **Dependency Installation** - Backend & frontend dependencies
6. **Docker Build** - Images built and optimized
7. **Service Startup** - All containers started in correct order
8. **Database Setup** - Migrations and optional seeding
9. **Health Checks** - Verifies all services are running

**Just run the script on any server and it works - even with common Docker issues!**
