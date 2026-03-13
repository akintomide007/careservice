# Docker Permission Fix for Production Server

## Problem
You're seeing this error:
```
PermissionError(13, 'Permission denied')
docker.errors.DockerException: Error while fetching server API version
```

This happens because your user doesn't have permission to access the Docker socket.

## Solution (Choose ONE)

### Option 1: Add User to Docker Group (Recommended)
This allows you to run docker commands without sudo:

```bash
# On your production server, run:
sudo usermod -aG docker $USER

# Then logout and login again, OR run:
newgrp docker

# Verify it works:
docker ps

# Now run the deployment:
cd ~/Desktop/careservice
./scripts/deploy-production.sh
```

### Option 2: Run with Sudo
If you don't want to add user to docker group:

```bash
# On your production server:
cd ~/Desktop/careservice
sudo ./scripts/deploy-production.sh
```

## Full Deployment Steps for Production Server

1. **SSH into your production server**
2. **Navigate to project directory**:
   ```bash
   cd ~/Desktop/careservice
   ```

3. **Fix Docker permissions** (one-time):
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Run deployment**:
   ```bash
   ./scripts/deploy-production.sh
   ```

5. **Verify services are running**:
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

6. **Check health**:
   ```bash
   curl http://localhost:3001/health
   ```

## If You See "Node.js version 20 or higher required"

The script checks the system Node version. If your system has Node 18 but you have Node 20 installed elsewhere:

```bash
# Check where Node 20 is installed:
which node
/usr/local/bin/node --version

# If Node 20 is not in PATH, either:
# A) Update PATH to include it
# B) Run docker-compose directly (it doesn't need Node 20):
docker-compose -f docker-compose.production.yml up -d
```

## Quick Deploy Without the Script

If the script continues to have issues, deploy directly:

```bash
# On production server:
cd ~/Desktop/careservice

# Build and start all services:
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Check status:
docker-compose -f docker-compose.production.yml ps

# Seed database (first time only):
docker-compose -f docker-compose.production.yml exec backend npm run db:seed
```

## After Successful Deployment

1. **Find your server's IP address**:
   ```bash
   ip addr show | grep inet
   ```

2. **Access your application**:
   - Web Dashboard: `http://YOUR_SERVER_IP:3000`
   - Backend API: `http://YOUR_SERVER_IP:3001/health`
   - Login: landlord@careservice.com / landlord123

3. **Configure mobile app** to use your server:
   ```javascript
   // Update mobile-app API URL to:
   const API_URL = 'http://YOUR_SERVER_IP:3001';
   ```

## Troubleshooting

### Still getting permission errors?
```bash
# Check Docker socket permissions:
ls -l /var/run/docker.sock

# Should show: srw-rw---- 1 root docker
# If not, run:
sudo chmod 666 /var/run/docker.sock  # Temporary fix
# OR
sudo systemctl restart docker        # Proper fix
```

### Services won't start?
```bash
# Check logs:
docker-compose -f docker-compose.production.yml logs

# Rebuild:
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Need to stop everything?
```bash
docker-compose -f docker-compose.production.yml down
```

## Next Steps After Deployment

1. ✅ Fix Docker permissions
2. ✅ Deploy all containers  
3. ✅ Verify services healthy
4. ✅ Seed database
5. ⚠️ Get your server's public IP
6. ⚠️ Update mobile app API URL
7. ⚠️ Set up domain name (optional)
8. ⚠️ Configure SSL/TLS (for production use)
9. ⚠️ Change default passwords
