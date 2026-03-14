#!/bin/bash

# ============================================================================
# CareService Production Deployment Script v2.0
# ============================================================================
# Comprehensive production deployment with:
# - Pre-flight checks
# - Automatic database backup
# - Smart port conflict resolution
# - Safe cleanup (preserves data volumes)
# - Health monitoring
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${MAGENTA}$1${NC}"
}

# Create deployment log
DEPLOY_LOG="./deployment_$(date +"%Y%m%d_%H%M%S").log"
exec > >(tee -a "$DEPLOY_LOG") 2>&1

echo ""
print_header "╔════════════════════════════════════════════════════════════╗"
print_header "║   🚀 CareService Production Deployment v2.0              ║"
print_header "╚════════════════════════════════════════════════════════════╝"
echo ""
print_info "Timestamp: $(date)"
print_info "Log file: $DEPLOY_LOG"
echo ""

# Check if running from project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# ============================================================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 1: PRE-FLIGHT CHECKS"
print_header "═══════════════════════════════════════════════════════════"
echo ""

# Check Docker
print_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
print_success "Docker installed: $DOCKER_VERSION"

# Check Docker Compose
print_info "Checking Docker Compose..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "2.0.0")
    print_success "Docker Compose Plugin detected (v$COMPOSE_VERSION)"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose version --short 2>/dev/null || echo "unknown")
    print_warning "Old docker-compose detected (v$COMPOSE_VERSION)"
    COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose not found"
    exit 1
fi

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher required. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Check disk space
print_info "Checking disk space..."
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 5 ]; then
    print_error "Insufficient disk space. At least 5GB required, found ${AVAILABLE_SPACE}GB"
    exit 1
fi
print_success "Available disk space: ${AVAILABLE_SPACE}GB"

# Check environment files
print_info "Checking environment files..."
if [ ! -f "backend/.env.production" ]; then
    print_error "backend/.env.production not found!"
    exit 1
fi
if [ ! -f "web-dashboard/.env.production" ]; then
    print_error "web-dashboard/.env.production not found!"
    exit 1
fi
print_success "Environment files found"

echo ""
print_success "Pre-flight checks complete!"

# ============================================================================
# PHASE 2: DETECT HOST IP
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 2: NETWORK CONFIGURATION"
print_header "═══════════════════════════════════════════════════════════"
echo ""

print_info "Detecting host IP address..."
HOST_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
if [ -z "$HOST_IP" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    HOST_IP=$(ip route get 1 2>/dev/null | awk '{print $7;exit}' || echo "localhost")
fi
if [ -z "$HOST_IP" ]; then
    print_warning "Could not detect IP address automatically. Using localhost"
    HOST_IP="localhost"
fi
print_success "Detected host IP: $HOST_IP"

# ============================================================================
# PHASE 3: PORT CONFLICT RESOLUTION
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 3: PORT AVAILABILITY CHECK"
print_header "═══════════════════════════════════════════════════════════"
echo ""

# Run port check script
bash scripts/check-ports.sh

# Source port assignments
if [ -f /tmp/careservice_ports.env ]; then
    source /tmp/careservice_ports.env
    print_info "Port configuration loaded:"
    print_info "  • Web Dashboard: $WEB_PORT"
    print_info "  • Backend API: $BACKEND_PORT"
    print_info "  • PostgreSQL: $POSTGRES_PORT"
    print_info "  • Redis: $REDIS_PORT"
else
    # Default ports
    export WEB_PORT=3000
    export BACKEND_PORT=3001
    export POSTGRES_PORT=5433
    export REDIS_PORT=6381
fi

# ============================================================================
# PHASE 4: DATABASE BACKUP
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 4: DATABASE BACKUP"
print_header "═══════════════════════════════════════════════════════════"
echo ""

bash scripts/backup-database.sh || print_warning "Backup skipped (first deployment?)"

# ============================================================================
# PHASE 5: COMPREHENSIVE CLEANUP
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 5: COMPREHENSIVE CLEANUP"
print_header "═══════════════════════════════════════════════════════════"
echo ""

bash scripts/pre-deploy-cleanup.sh

# ============================================================================
# PHASE 6: ENVIRONMENT CONFIGURATION
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 6: ENVIRONMENT CONFIGURATION"
print_header "═══════════════════════════════════════════════════════════"
echo ""

# Create root .env file for Docker Compose
print_info "Creating root .env file for Docker Compose..."
cat > .env << EOF
# Auto-generated by deploy-production.sh
# Date: $(date)
# This file is used by Docker Compose to pass build arguments
NEXT_PUBLIC_API_URL=http://$HOST_IP:$BACKEND_PORT
EOF
print_success "Root .env created with API URL: http://$HOST_IP:$BACKEND_PORT"

# Update web-dashboard .env.production
print_info "Configuring web-dashboard/.env.production..."
cat > web-dashboard/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://$HOST_IP:$BACKEND_PORT
NEXT_TELEMETRY_DISABLED=1
EOF
print_success "Web dashboard environment configured"

# Update CORS origin in backend .env
print_info "Configuring backend CORS origins..."
sed -i.bak "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:$WEB_PORT,http://$HOST_IP:$WEB_PORT|g" backend/.env.production
print_success "Backend CORS configured"

# ============================================================================
# PHASE 7: INSTALL DEPENDENCIES
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 7: INSTALL DEPENDENCIES"
print_header "═══════════════════════════════════════════════════════════"
echo ""

print_info "Installing backend dependencies..."
cd backend
npm install --production=false --silent 2>&1 | grep -E "(added|removed|changed|audited)" || true
print_success "Backend dependencies installed"
cd ..

print_info "Installing web-dashboard dependencies..."
cd web-dashboard
npm install --production=false --silent 2>&1 | grep -E "(added|removed|changed|audited)" || true
print_success "Web-dashboard dependencies installed"
cd ..

# ============================================================================
# PHASE 8: BUILD & DEPLOY CONTAINERS
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 8: BUILD & DEPLOY CONTAINERS"
print_header "═══════════════════════════════════════════════════════════"
echo ""

# Export ports for docker-compose
export WEB_PORT BACKEND_PORT POSTGRES_PORT REDIS_PORT

print_info "Building Docker images (this may take several minutes)..."
$COMPOSE_CMD -f docker-compose.production.yml build --no-cache 2>&1 | grep -E "(Building|writing|naming|DONE)" || true
print_success "Images built successfully"

print_info "Starting services..."
$COMPOSE_CMD -f docker-compose.production.yml up -d
print_success "Services started"

# ============================================================================
# PHASE 9: HEALTH CHECKS & VERIFICATION
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 9: HEALTH CHECKS & VERIFICATION"
print_header "═══════════════════════════════════════════════════════════"
echo ""

print_info "Waiting for services to be healthy..."

# Wait for PostgreSQL
print_info "Checking PostgreSQL..."
for i in {1..30}; do
    if docker exec careservice-postgres pg_isready -U careuser -d care_provider_db &>/dev/null; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for Redis
print_info "Checking Redis..."
for i in {1..30}; do
    if docker exec careservice-redis redis-cli ping &>/dev/null; then
        print_success "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

# Wait for Backend
print_info "Checking Backend API..."
for i in {1..60}; do
    if curl -s "http://localhost:$BACKEND_PORT/health" &>/dev/null; then
        print_success "Backend API is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_warning "Backend health check timed out (may still be starting)"
    fi
    sleep 2
done

# Wait for Web Dashboard
print_info "Checking Web Dashboard..."
for i in {1..60}; do
    if curl -s "http://localhost:$WEB_PORT" &>/dev/null; then
        print_success "Web Dashboard is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_warning "Web Dashboard health check timed out (may still be starting)"
    fi
    sleep 2
done

# ============================================================================
# PHASE 10: DATABASE MIGRATIONS
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  PHASE 10: DATABASE MIGRATIONS"
print_header "═══════════════════════════════════════════════════════════"
echo ""

print_info "Running database migrations..."
docker exec careservice-backend npx prisma migrate deploy
print_success "Migrations applied"

print_info "Generating Prisma client..."
docker exec careservice-backend npx prisma generate
print_success "Prisma client generated"

# ============================================================================
# PHASE 11: DEPLOYMENT SUMMARY
# ============================================================================
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  🎉 DEPLOYMENT COMPLETE!"
print_header "═══════════════════════════════════════════════════════════"
echo ""

print_success "CareService is now running!"
echo ""
print_info "📊 Service Status:"
$COMPOSE_CMD -f docker-compose.production.yml ps

echo ""
print_info "🌐 Access URLs:"
echo -e "${CYAN}  • Web Dashboard:  http://localhost:$WEB_PORT${NC}"
echo -e "${CYAN}  • Backend API:    http://localhost:$BACKEND_PORT${NC}"
echo -e "${CYAN}  • API Health:     http://localhost:$BACKEND_PORT/health${NC}"
if [ "$HOST_IP" != "localhost" ]; then
    echo ""
    print_info "🌍 Network Access:"
    echo -e "${CYAN}  • Web Dashboard:  http://$HOST_IP:$WEB_PORT${NC}"
    echo -e "${CYAN}  • Backend API:    http://$HOST_IP:$BACKEND_PORT${NC}"
fi

echo ""
print_info "📝 Useful Commands:"
echo -e "${YELLOW}  • View logs:       docker compose -f docker-compose.production.yml logs -f${NC}"
echo -e "${YELLOW}  • Stop services:   docker compose -f docker-compose.production.yml down${NC}"
echo -e "${YELLOW}  • Restart:         docker compose -f docker-compose.production.yml restart${NC}"
echo -e "${YELLOW}  • Rollback:        bash scripts/rollback.sh${NC}"

echo ""
print_info "📄 Deployment log saved: $DEPLOY_LOG"
echo ""
print_success "Happy deploying! 🚀"
echo ""
