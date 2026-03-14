# 🚀 CareService Production Server Deployment Guide

Complete guide for deploying CareService to a production server (VPS/Cloud Instance).

---

## 📋 Table of Contents

1. [Server Requirements](#server-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Install Required Software](#install-required-software)
4. [Security Configuration](#security-configuration)
5. [Deploy Application](#deploy-application)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Firewall Configuration](#firewall-configuration)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04/22.04 LTS or Debian 11/12
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2 cores minimum (4 cores recommended)
- **Storage**: 20GB minimum (50GB recommended)
- **Network**: Public IP address

### Recommended Cloud Providers
- **DigitalOcean**: Droplet ($24/month - 4GB RAM, 2 CPUs)
- **AWS**: EC2 t3.medium ($30/month)
- **Google Cloud**: e2-medium ($25/month)
- **Linode**: Dedicated 4GB ($24/month)
- **Vultr**: Cloud Compute 4GB ($24/month)

---

## Initial Server Setup

### 1. Access Your Server

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Or if using a specific key
ssh -i ~/.ssh/your-key.pem root@YOUR_SERVER_IP
```

### 2. Create a Non-Root User

```bash
# Create new user
adduser careservice

# Add to sudo group
usermod -aG sudo careservice

# Switch to new user
su - careservice
```

### 3. Set Up SSH Key Authentication (Optional but Recommended)

**On your local machine:**
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id careservice@YOUR_SERVER_IP
```

**On the server:**
```bash
# Disable root login (security best practice)
sudo nano /etc/ssh/sshd_config

# Change these lines:
# PermitRootLogin no
# PasswordAuthentication no

# Restart SSH service
sudo systemctl restart ssh
```

### 4. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

Wait a minute, then reconnect:
```bash
ssh careservice@YOUR_SERVER_IP
```

---

## Install Required Software

### 1. Install Docker

```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Install Node.js (v18+)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Git

```bash
sudo apt-get install -y git
git --version
```

### 4. Install Essential Tools

```bash
sudo apt-get install -y \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    fail2ban \
    htop \
    net-tools
```

---

## Security Configuration

### 1. Configure Firewall (UFW)

```bash
# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (if needed for direct access)
# sudo ufw allow 3000/tcp  # Web Dashboard
# sudo ufw allow 3001/tcp  # Backend API

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 2. Configure Fail2Ban (Brute Force Protection)

```bash
# Install and start fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### 3. Set Up Automatic Security Updates

```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Deploy Application

### 1. Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/careservice.git

# Navigate to project directory
cd careservice
```

### 2. Configure Environment Variables

#### Backend Environment

```bash
# Create production environment file
nano backend/.env.production
```

**backend/.env.production** content:
```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://careuser:STRONG_PASSWORD_HERE@postgres:5432/care_provider_db

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_STRONG_JWT_SECRET_HERE

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=YOUR_STRONG_SESSION_SECRET_HERE

# CORS Configuration
CORS_ORIGIN=http://YOUR_DOMAIN.com,https://YOUR_DOMAIN.com

# Application URLs
APP_URL=https://YOUR_DOMAIN.com
API_URL=https://api.YOUR_DOMAIN.com

# Email Configuration (if using)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Logging
LOG_LEVEL=info
```

#### Web Dashboard Environment

```bash
# Create production environment file
nano web-dashboard/.env.production
```

**web-dashboard/.env.production** content:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN.com
```

### 3. Update Docker Compose for Production

```bash
nano docker-compose.production.yml
```

**Important Changes:**
- Update PostgreSQL password
- Update port mappings if needed
- Add restart policies

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: STRONG_DATABASE_PASSWORD_HERE  # Change this!
```

### 4. Run Deployment Script

```bash
# Make sure script is executable
chmod +x scripts/deploy-production.sh

# Run deployment
bash scripts/deploy-production.sh
```

**The script will:**
- ✅ Check system requirements
- ✅ Create automatic backup
- ✅ Clean old containers
- ✅ Build fresh images
- ✅ Start all services
- ✅ Run database migrations
- ✅ Verify health checks

### 5. Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker compose -f docker-compose.production.yml logs -f

# Test backend API
curl http://localhost:3001/health

# Test web dashboard
curl http://localhost:3000
```

---

## Domain & SSL Setup

### 1. Point Domain to Server

**At your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):**

Add these DNS A records:
```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      3600
A       www     YOUR_SERVER_IP      3600
A       api     YOUR_SERVER_IP      3600
```

Wait 5-30 minutes for DNS propagation.

**Verify DNS:**
```bash
# Check if domain points to your server
dig YOUR_DOMAIN.com +short
dig www.YOUR_DOMAIN.com +short
dig api.YOUR_DOMAIN.com +short
```

### 2. Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration for main domain
sudo nano /etc/nginx/sites-available/careservice
```

**Nginx Configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main application
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # SSL certificates (will be created by Certbot)
    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.YOUR_DOMAIN.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Backend API
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/careservice /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Obtain SSL Certificate with Let's Encrypt

```bash
# Install Certbot if not already installed
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com -d api.YOUR_DOMAIN.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run
```

**Certificate will auto-renew!** Certbot sets up a cron job automatically.

### 4. Update Environment Variables with Domain

```bash
# Update backend CORS
nano backend/.env.production
# CORS_ORIGIN=https://YOUR_DOMAIN.com,https://www.YOUR_DOMAIN.com

# Update web dashboard API URL
nano web-dashboard/.env.production
# NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN.com

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build
```

---

## Firewall Configuration

### Final UFW Setup

```bash
# Review rules
sudo ufw status numbered

# If you're using Nginx as reverse proxy, you can remove direct access to ports 3000/3001
sudo ufw delete allow 3000/tcp
sudo ufw delete allow 3001/tcp

# Final rules should be:
# - 22/tcp (SSH)
# - 80/tcp (HTTP)
# - 443/tcp (HTTPS)

sudo ufw status verbose
```

---

## Post-Deployment

### 1. Create Initial Admin User

```bash
# Access the backend container
docker exec -it careservice-backend bash

# Run seed script or create user manually
npx prisma db seed

# Exit container
exit
```

### 2. Test Application

Visit your domain:
- **Main App**: https://YOUR_DOMAIN.com
- **API**: https://api.YOUR_DOMAIN.com/health
- **API Docs**: https://api.YOUR_DOMAIN.com/api-docs (if enabled)

### 3. Set Up Monitoring

#### Install PM2 Ecosystem (Optional - for non-Docker monitoring)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Set up PM2 startup script
pm2 startup systemd
```

#### Monitor Docker Containers

```bash
# Check container status
docker ps -a

# View logs
docker compose -f docker-compose.production.yml logs -f

# Check resource usage
docker stats
```

### 4. Set Up Automated Backups

```bash
# Create backup script
nano ~/backup-careservice.sh
```

**Backup script content:**
```bash
#!/bin/bash

# Navigate to project
cd ~/careservice

# Run backup
bash scripts/backup-database.sh

# Upload to remote storage (optional)
# rsync -avz backups/ user@backup-server:/path/to/backups/
# Or use S3: aws s3 sync backups/ s3://your-bucket/careservice-backups/
```

**Set up cron job:**
```bash
# Make executable
chmod +x ~/backup-careservice.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/careservice/backup-careservice.sh
```

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check container health
docker ps

# Check logs for errors
docker compose -f docker-compose.production.yml logs --tail=100

# Check disk usage
df -h

# Check memory usage
free -h
```

### Weekly Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean Docker resources
docker system prune -f

# Review logs
sudo journalctl -u docker --since "1 week ago"
```

### Monthly Tasks

```bash
# Review backups
ls -lh ~/careservice/backups/

# Check SSL certificate expiry
sudo certbot certificates

# Review security logs
sudo fail2ban-client status
```

### Updating Application

```bash
cd ~/careservice

# Pull latest code
git pull origin main

# Run deployment
bash scripts/deploy-production.sh
```

---

## Troubleshooting

### Application Not Loading

```bash
# Check container status
docker ps -a

# View logs
docker compose -f docker-compose.production.yml logs -f

# Restart services
docker compose -f docker-compose.production.yml restart
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL container
docker logs careservice-postgres

# Access PostgreSQL
docker exec -it careservice-postgres psql -U careuser -d care_provider_db

# Check connection from backend
docker exec -it careservice-backend npx prisma migrate status
```

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Restart specific service
docker compose -f docker-compose.production.yml restart backend

# Restart all services
docker compose -f docker-compose.production.yml restart
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 PID
```

---

## Security Best Practices

### 1. Regular Updates

```bash
# Set up automatic security updates
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 2. Strong Passwords

- Use strong, unique passwords for:
  - Database (PostgreSQL)
  - JWT secrets
  - Session secrets
  - Admin accounts

Generate secure passwords:
```bash
openssl rand -base64 32
```

### 3. Backup Strategy

- **Daily**: Automated database backups
- **Weekly**: Full system backups
- **Off-site**: Store backups remotely (S3, different server)
- **Test**: Regularly test backup restoration

### 4. Monitoring

- Set up monitoring alerts (UptimeRobot, Pingdom)
- Monitor logs for suspicious activity
- Track resource usage (CPU, RAM, disk)

### 5. Keep Software Updated

```bash
# Weekly updates
sudo apt update && sudo apt upgrade -y
docker pull postgres:15-alpine
docker pull redis:7-alpine
```

---

## Quick Reference Commands

```bash
# View all services
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f [service]

# Restart service
docker compose -f docker-compose.production.yml restart [service]

# Stop all services
docker compose -f docker-compose.production.yml down

# Start all services
docker compose -f docker-compose.production.yml up -d

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build

# Create backup
bash scripts/backup-database.sh

# Rollback database
bash scripts/rollback.sh

# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# View SSL certificates
sudo certbot certificates

# Check firewall
sudo ufw status verbose
```

---

## Support & Resources

### Documentation
- Main deployment: `docs/PRODUCTION_DEPLOYMENT_V2.md`
- Quick start: `DEPLOYMENT_QUICK_START.md`

### Useful Links
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

---

**Deployment Checklist:**

- [ ] Server provisioned with minimum requirements
- [ ] Docker and Docker Compose installed
- [ ] Node.js 18+ installed
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication set up
- [ ] Application cloned from repository
- [ ] Environment variables configured
- [ ] Deployment script executed successfully
- [ ] Domain DNS configured
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate obtained
- [ ] Application accessible via HTTPS
- [ ] Initial admin user created
- [ ] Automated backups configured
- [ ] Monitoring set up
- [ ] Security updates enabled

---

**Last Updated**: March 14, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
