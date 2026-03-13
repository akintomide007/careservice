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

**⚠️ Important**: 
- Log out and back in after Docker installation!
- If you get `KeyError: 'ContainerConfig'` error, run the fix script (see troubleshooting below)

---

### 2️⃣ Clone & Deploy

```bash
# Clone repository
cd ~
git clone https://github.com/akintomide007/careservice.git
cd careservice

# Run automated deployment script
bash scripts/deploy-production.sh
```

**That's it!** The script automatically:
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

### Error: `KeyError: 'ContainerConfig'`

This error means you have an old version of docker-compose. Fix it by running:

```bash
# Run the fix script from the project directory
bash scripts/fix-docker-compose.sh

# Then try deployment again
bash scripts/deploy-production.sh
```

The fix script will:
- Remove old Python-based docker-compose (v1.x)
- Install new Docker Compose plugin (v2.x)
- Create a compatibility wrapper

---

## 📚 Need More Help?

See the complete guide: [docs/PRODUCTION_SERVER_DEPLOYMENT.md](docs/PRODUCTION_SERVER_DEPLOYMENT.md)

---

## ✅ What Makes This Easy

The `deploy-production.sh` script handles everything automatically:

1. **Auto IP Detection** - No manual configuration needed
2. **Environment Setup** - All configs updated automatically
3. **Dependency Installation** - Backend & frontend dependencies
4. **Docker Build** - Images built and optimized
5. **Service Startup** - All containers started in correct order
6. **Database Setup** - Migrations and optional seeding
7. **Health Checks** - Verifies all services are running

**Just run the script on any server and it works!**
