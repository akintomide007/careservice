# Production Server Deployment Guide

This guide explains how to deploy the CareService application to any production server.

## Prerequisites

Before deploying, ensure the target server has:

1. **Operating System**: Linux (Ubuntu 20.04+ or similar)
2. **Docker**: Version 20.10 or higher
3. **Docker Compose**: Version 2.0 or higher
4. **Node.js**: Version 20 or higher
5. **Git**: For cloning the repository
6. **Ports Available**: 3000 (web), 3001 (API), 5433 (postgres), 6381 (redis)

## Deployment Steps

### Step 1: Install Prerequisites

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git (if not already installed)
sudo apt install -y git
```

**Important**: Log out and log back in after adding your user to the docker group.

### Step 2: Clone the Repository

```bash
# Clone the repository to your server
cd ~
git clone https://github.com/akintomide007/careservice.git
cd careservice
```

### Step 3: Configure Environment Files

The deployment script will automatically configure most settings, but you should review and customize:

#### Backend Configuration (`backend/.env.production`)

Key settings to review:
- `JWT_SECRET`: Generate a secure secret (run `openssl rand -base64 32`)
- `DATABASE_URL`: Update password if needed (default: `carepass`)
- `ASSEMBLYAI_API_KEY`: Add your API key if using speech-to-text
- `USE_MOCK_MS365`: Set to `false` if integrating with real Microsoft 365

#### Web Dashboard Configuration (`web-dashboard/.env.production`)

The `NEXT_PUBLIC_API_URL` will be automatically set by the deployment script.

### Step 4: Run Deployment Script

The deployment script will automatically:
- Detect the server's IP address
- Update all necessary configuration files
- Install dependencies
- Build Docker images
- Start all services
- Run database migrations
- Optionally seed initial data

```bash
# Make the script executable (if not already)
chmod +x scripts/deploy-production.sh

# Run the deployment
bash scripts/deploy-production.sh
```

**During deployment:**
- The script will detect your server IP (e.g., `192.168.1.100`)
- When prompted "Seed database with initial data? (y/N):", type `y` for first deployment

### Step 5: Verify Deployment

After deployment completes, verify everything is working:

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Test API health
curl http://localhost:3001/health

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 6: Access the Application

The deployment script will display the URLs at the end:

**Local Access (on the server):**
- Web Dashboard: http://localhost:3000
- Backend API: http://localhost:3001

**Network Access (from other devices):**
- Web Dashboard: http://[SERVER_IP]:3000
- Backend API: http://[SERVER_IP]:3001

Replace `[SERVER_IP]` with your server's detected IP address.

## Default Login Credentials

After seeding the database, use these credentials for first login:

- **Email**: landlord@careservice.com
- **Password**: landlord123

**⚠️ IMPORTANT**: Change this password immediately after first login!

## Firewall Configuration

If using a firewall, open the necessary ports:

```bash
# For Ubuntu/Debian with ufw
sudo ufw allow 3000/tcp  # Web Dashboard
sudo ufw allow 3001/tcp  # Backend API
sudo ufw allow 22/tcp    # SSH (if not already open)
sudo ufw enable
```

## Using a Custom Domain

If you have a domain name, you should:

1. **Set up DNS**: Point your domain to the server IP
2. **Configure Nginx** as a reverse proxy with SSL/TLS:

```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update CORS_ORIGIN** in `backend/.env.production`:
```bash
CORS_ORIGIN=http://localhost:3000,http://[SERVER_IP]:3000,https://yourdomain.com
```

4. **Restart services**:
```bash
docker-compose -f docker-compose.production.yml restart
```

## Useful Management Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs -f backend

# Stop all services
docker-compose -f docker-compose.production.yml down

# Restart services
docker-compose -f docker-compose.production.yml restart

# Access backend shell
docker-compose -f docker-compose.production.yml exec backend sh

# Access database
docker-compose -f docker-compose.production.yml exec postgres psql -U careuser -d care_provider_db

# Rebuild and restart (after code changes)
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

## Updating the Application

When you need to update to a newer version:

```bash
# Navigate to project directory
cd ~/careservice

# Stop services
docker-compose -f docker-compose.production.yml down

# Pull latest code
git pull origin main

# Run deployment script again
bash scripts/deploy-production.sh
```

## Backup and Restore

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U careuser care_provider_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U careuser -d care_provider_db < backup_20260312_123456.sql
```

### Automated Backups

Set up a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd ~/careservice && docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U careuser care_provider_db > ~/backups/careservice_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Docker Compose Version Issues

**Error: `KeyError: 'ContainerConfig'`**

This error indicates you have an old Python-based docker-compose (v1.x) installed. The solution is to upgrade to Docker Compose Plugin (v2.x).

**Quick Fix:**
```bash
# Run the automated fix script
bash scripts/fix-docker-compose.sh

# Then retry deployment
bash scripts/deploy-production.sh
```

**Manual Fix:**
```bash
# Remove old docker-compose
sudo apt remove docker-compose -y
sudo pip uninstall docker-compose -y 2>/dev/null || true
sudo rm -f /usr/local/bin/docker-compose

# Install Docker Compose Plugin (v2)
sudo apt update
sudo apt install docker-compose-plugin -y

# Verify installation
docker compose version

# Create compatibility wrapper
cat > /tmp/docker-compose-wrapper.sh << 'EOF'
#!/bin/bash
exec docker compose "$@"
EOF
sudo mv /tmp/docker-compose-wrapper.sh /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Services Won't Start

```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check logs for errors
docker-compose -f docker-compose.production.yml logs
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
sudo kill -9 [PID]
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U careuser

# Restart PostgreSQL
docker-compose -f docker-compose.production.yml restart postgres
```

### IP Detection Issues

If the script doesn't detect the correct IP:

```bash
# Check your IP addresses
hostname -I
ip addr show

# Manually update the files
nano web-dashboard/.env.production
# Change: NEXT_PUBLIC_API_URL=http://[YOUR_IP]:3001

nano backend/.env.production
# Change: CORS_ORIGIN=http://localhost:3000,http://[YOUR_IP]:3000
```

## Security Best Practices

1. **Change Default Credentials**: Update the default landlord password
2. **Update JWT Secret**: Generate a new one with `openssl rand -base64 32`
3. **Change Database Password**: Update in both `.env.production` and `docker-compose.production.yml`
4. **Enable Firewall**: Only open necessary ports
5. **Use HTTPS**: Set up SSL/TLS with Nginx reverse proxy
6. **Regular Updates**: Keep Docker, Node.js, and dependencies updated
7. **Regular Backups**: Set up automated database backups
8. **Monitor Logs**: Regularly check for suspicious activity

## Production Checklist

- [ ] Prerequisites installed (Docker, Node.js, etc.)
- [ ] Repository cloned
- [ ] Environment files configured
- [ ] JWT_SECRET updated
- [ ] Database password changed
- [ ] Deployment script executed successfully
- [ ] Services running and healthy
- [ ] API health check passing
- [ ] Web dashboard accessible
- [ ] Default password changed
- [ ] Firewall configured
- [ ] SSL/TLS configured (if using domain)
- [ ] Backup strategy implemented
- [ ] Monitoring set up

## Support

For issues or questions:
- Check the logs: `docker-compose -f docker-compose.production.yml logs`
- Review this documentation
- Check other docs in the `docs/` folder
- Contact the development team

---

**Last Updated**: March 2026
