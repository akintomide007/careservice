#!/bin/bash

# =============================================================================
# Clean Rebuild Script for Production
# =============================================================================

set -e

echo "🧹 Clean Rebuild - Removing all Docker artifacts and rebuilding..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running from project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Stop all containers
print_info "Stopping all containers..."
docker-compose -f docker-compose.production.yml down
print_success "Containers stopped"
echo ""

# Step 2: Remove Docker images
print_info "Removing Docker images..."
docker rmi careservice-backend careservice-web-dashboard 2>/dev/null || print_warning "Some images not found (this is ok)"
print_success "Docker images removed"
echo ""

# Step 3: Clean backend artifacts
print_info "Cleaning backend build artifacts..."
rm -rf backend/dist
rm -rf backend/node_modules/.prisma
rm -rf backend/node_modules/@prisma
print_success "Backend artifacts cleaned"
echo ""

# Step 4: Clean dashboard artifacts  
print_info "Cleaning dashboard build artifacts..."
rm -rf web-dashboard/.next
print_success "Dashboard artifacts cleaned"
echo ""

# Step 5: Clean Docker build cache (optional but recommended)
print_info "Cleaning Docker build cache..."
docker builder prune -f
print_success "Docker build cache cleaned"
echo ""

print_success "🎉 Clean complete! Now run the deployment script:"
echo ""
echo "  bash scripts/deploy-production.sh"
echo ""
