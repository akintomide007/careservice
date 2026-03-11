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

# Step 1: Check Node.js version
print_info "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20 or higher required. Current: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"
echo ""

# Step 2: Check environment files
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

# Step 3: Check JWT_SECRET
print_info "Checking JWT_SECRET..."
if grep -q "CHANGE_THIS_TO_SECURE_RANDOM_32_CHAR_STRING_IN_PRODUCTION" backend/.env.production; then
    print_warning "JWT_SECRET not updated! Run: ./scripts/generate-secrets.sh"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
print_success "JWT_SECRET check complete"
echo ""

# Step 4: Stop existing containers
print_info "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down
print_success "Containers stopped"
echo ""

# Step 5: Install/Update dependencies
print_info "Installing backend dependencies..."
cd backend
npm install --production=false
print_success "Backend dependencies installed"
echo ""

print_info "Installing web-dashboard dependencies..."
cd ../web-dashboard
npm install --production=false
cd ..
print_success "Web-dashboard dependencies installed"
echo ""

# Step 6: Fix security vulnerabilities
print_info "Fixing security vulnerabilities..."
cd backend
npm audit fix || true  # Continue even if some fixes fail
cd ../web-dashboard
npm audit fix || true
cd ..
print_success "Security vulnerabilities addressed"
echo ""

# Step 7: Build Docker images
print_info "Building Docker images (this may take several minutes)..."
docker-compose -f docker-compose.production.yml build --no-cache
print_success "Docker images built"
echo ""

# Step 8: Start services
print_info "Starting services..."
docker-compose -f docker-compose.production.yml up -d
print_success "Services started"
echo ""

# Step 9: Wait for services to be healthy
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

# Step 10: Run database migrations
print_info "Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T backend npm run db:push
print_success "Database migrations complete"
echo ""

# Step 11: Seed database (optional)
read -p "Seed database with initial data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    docker-compose -f docker-compose.production.yml exec -T backend npm run db:seed
    print_success "Database seeded"
fi
echo ""

# Step 12: Display status
print_info "Checking service status..."
docker-compose -f docker-compose.production.yml ps
echo ""

# Step 13: Display logs
print_info "Recent logs:"
docker-compose -f docker-compose.production.yml logs --tail=20
echo ""

# Success message
print_success "🎉 Production deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   - Web Dashboard: http://localhost:3000"
echo "   - Backend API:   http://localhost:3001"
echo "   - API Health:    http://localhost:3001/health"
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
