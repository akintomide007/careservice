#!/bin/bash

# =============================================================================
# Production Deployment Script for CareService
# =============================================================================

set -e  # Exit on error

echo " Starting CareService Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}  $1${NC}"
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

# Check if running from project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check and fix Docker Compose version
print_info "Checking Docker Compose version..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "2.0.0")
    print_success "Docker Compose Plugin detected (v$COMPOSE_VERSION)"
elif command -v docker-compose &> /dev/null; then
    OLD_VERSION=$(docker-compose version --short 2>/dev/null || echo "unknown")
    print_warning "Old docker-compose detected (v$OLD_VERSION). Upgrading to Docker Compose Plugin..."
    
    # Auto-fix: Remove old docker-compose and install plugin
    print_info "Removing old docker-compose..."
    sudo apt remove docker-compose -y 2>/dev/null || true
    sudo pip uninstall docker-compose -y 2>/dev/null || true
    sudo pip3 uninstall docker-compose -y 2>/dev/null || true
    sudo rm -f /usr/local/bin/docker-compose 2>/dev/null || true
    sudo rm -f /usr/bin/docker-compose 2>/dev/null || true
    
    print_info "Installing Docker Compose Plugin..."
    sudo apt update -qq
    sudo apt install -y docker-compose-plugin
    
    # Create compatibility wrapper
    cat > /tmp/docker-compose-wrapper.sh << 'EOF'
#!/bin/bash
exec docker compose "$@"
EOF
    sudo mv /tmp/docker-compose-wrapper.sh /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose Plugin installed successfully!"
else
    print_error "Docker Compose not found. Installing..."
    sudo apt update -qq
    sudo apt install -y docker-compose-plugin
    print_success "Docker Compose Plugin installed"
fi
echo ""

# Step 2: Check Node.js version
print_info "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20 or higher required. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"
echo ""

# Step 3: Detect host IP address
print_info "Detecting host IP address..."
# Try to get the primary IP address (preferring non-local IPs)
HOST_IP=$(hostname -I | awk '{print $1}')
if [ -z "$HOST_IP" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    # Fallback: try to get IP from default route
    HOST_IP=$(ip route get 1 | awk '{print $7;exit}')
fi
if [ -z "$HOST_IP" ]; then
    print_warning "Could not detect IP address automatically. Using localhost"
    HOST_IP="localhost"
else
    print_success "Detected host IP: $HOST_IP"
fi
echo ""

# Step 4: Check and update environment files
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

# Step 5: Update API URL in dashboard .env with detected IP
print_info "Updating web-dashboard API URL to: http://$HOST_IP:3001"
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$HOST_IP:3001|g" web-dashboard/.env.production
print_success "API URL updated in web-dashboard/.env.production"
echo ""

# Step 6: Update CORS origin in backend .env with detected IP
print_info "Updating backend CORS origin to include: http://$HOST_IP:3000"
# Update CORS_ORIGIN to include the detected IP along with localhost
sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:3000,http://$HOST_IP:3000|g" backend/.env.production
print_success "CORS origin updated in backend/.env.production"
echo ""

# Step 7: Clean up any existing containers
print_info "Cleaning up existing containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true
docker container prune -f > /dev/null 2>&1 || true

# Remove any orphaned careservice containers
ORPHANED=$(docker ps -a --filter "name=careservice" --filter "name=d03e3ec" --format "{{.Names}}" 2>/dev/null | wc -l)
if [ "$ORPHANED" -gt 0 ]; then
    print_warning "Found $ORPHANED orphaned container(s). Removing..."
    docker ps -a --filter "name=careservice" --filter "name=d03e3ec" --format "{{.Names}}" | xargs -r docker rm -f > /dev/null 2>&1
fi
print_success "Container cleanup complete"
echo ""

# Step 8: Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install --production=false
print_success "Backend dependencies installed"
echo ""

# Step 9: Install web-dashboard dependencies
print_info "Installing web-dashboard dependencies..."
cd ../web-dashboard
npm install --production=false
cd ..
print_success "Web-dashboard dependencies installed"
echo ""

# Step 10: Fix security vulnerabilities
print_info "Fixing security vulnerabilities..."
cd backend
npm audit fix || true  # Continue even if some fixes fail
cd ../web-dashboard
npm audit fix || true
cd ..
print_success "Security vulnerabilities addressed"
echo ""

# Step 11: Build Docker images
print_info "Building Docker images (this may take several minutes)..."
docker-compose -f docker-compose.production.yml build --no-cache
print_success "Docker images built"
echo ""

# Step 12: Start services
print_info "Starting services..."
docker-compose -f docker-compose.production.yml up -d
print_success "Services started"
echo ""

# Step 13: Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check postgres
print_info "Checking PostgreSQL..."
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U careuser -d care_provider_db > /dev/null 2>&1; then
    print_success "PostgreSQL is healthy"
else
    print_warning "PostgreSQL may still be starting up"
fi

# Check redis
print_info "Checking Redis..."
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is healthy"
else
    print_warning "Redis may still be starting up"
fi

echo ""

# Step 14: Run database migrations
print_info "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T backend npm run db:push
print_success "Database migrations complete"
echo ""

# Step 15: Seed database (optional)
read -p "Seed database with initial data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    docker-compose -f docker-compose.production.yml exec -T backend npm run db:seed
    print_success "Database seeded"
fi
echo ""

# Step 16: Display status
print_info "Checking service status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# Step 17: Display logs
print_info "Recent logs:"
docker-compose -f docker-compose.production.yml logs --tail=20
echo ""

# Success message
print_success "🎉 Production deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   - Web Dashboard (Local):   http://localhost:3000"
echo "   - Web Dashboard (Network): http://$HOST_IP:3000"
echo "   - Backend API (Local):     http://localhost:3001"
echo "   - Backend API (Network):   http://$HOST_IP:3001"
echo "   - API Health:              http://$HOST_IP:3001/health"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:     docker-compose -f docker-compose.production.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.production.yml down"
echo "   - Restart:       docker-compose -f docker-compose.production.yml restart"
echo "   - Shell access:  docker-compose -f docker-compose.production.yml exec backend sh"
echo ""
print_warning "Remember to:"
echo "   1. Update JWT_SECRET in backend/.env.production"
echo "   2. Change default database password"
echo "   3. Update CORS_ORIGIN with your domain"
echo "   4. Set up SSL/TLS (nginx reverse proxy recommended)"
echo "   5. Configure backups for PostgreSQL"
echo ""
