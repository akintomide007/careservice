#!/bin/bash

# =============================================================================
# Cleanup Docker Containers Script
# =============================================================================

set -e

echo "🧹 Cleaning up Docker containers..."
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

# Navigate to project directory
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Stopping all running containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true
print_success "Containers stopped"
echo ""

print_info "Removing orphaned containers..."
docker container prune -f
print_success "Orphaned containers removed"
echo ""

print_info "Checking for any remaining careservice containers..."
REMAINING=$(docker ps -a --filter "name=careservice" --format "{{.Names}}" | wc -l)

if [ "$REMAINING" -gt 0 ]; then
    print_warning "Found $REMAINING careservice containers. Removing them..."
    docker ps -a --filter "name=careservice" --format "{{.Names}}" | xargs -r docker rm -f
    print_success "All careservice containers removed"
else
    print_success "No remaining containers found"
fi
echo ""

print_info "Cleanup summary:"
docker ps -a --filter "name=careservice"
echo ""

print_success "🎉 Cleanup complete!"
echo ""
print_info "You can now run: bash scripts/deploy-production.sh"
