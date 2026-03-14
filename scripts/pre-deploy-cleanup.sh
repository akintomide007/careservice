#!/bin/bash

# ============================================================================
# Pre-Deployment Cleanup Script
# ============================================================================
# This script performs comprehensive cleanup before deployment while
# PRESERVING data volumes (PostgreSQL and Redis)
# ============================================================================

set -e  # Exit on error

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

echo ""
print_info "========================================="
print_info "COMPREHENSIVE CLEANUP (Safe Mode)"
print_info "Preserving: postgres_data, redis_data"
print_info "========================================="
echo ""

# Detect docker-compose command
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose not found"
    exit 1
fi

# Step 1: Stop all careservice containers
print_info "Stopping all CareService containers..."
$COMPOSE_CMD -f docker-compose.production.yml down 2>/dev/null || true
print_success "Containers stopped"

# Step 2: Remove all careservice containers (including stopped ones)
print_info "Removing all CareService containers..."
docker ps -a --filter "name=careservice" -q | xargs -r docker rm -f 2>/dev/null || true
print_success "Containers removed"

# Step 3: Remove careservice networks (except default bridge)
print_info "Removing CareService networks..."
docker network ls --filter "name=careservice" -q | xargs -r docker network rm 2>/dev/null || true
print_success "Networks removed"

# Step 4: Remove careservice images for fresh build
print_info "Removing CareService images..."
docker images --filter "reference=careservice-*" -q | xargs -r docker rmi -f 2>/dev/null || true
docker images --filter "reference=careservice_*" -q | xargs -r docker rmi -f 2>/dev/null || true
print_success "Images removed"

# Step 5: Clean Docker build cache
print_info "Cleaning Docker build cache..."
docker builder prune -f 2>/dev/null || true
print_success "Build cache cleaned"

# Step 6: Remove dangling images and containers
print_info "Removing dangling images and containers..."
docker system prune -f 2>/dev/null || true
print_success "Dangling resources cleaned"

# Step 7: Kill processes on required ports (only CareService processes)
print_info "Checking for CareService processes on required ports..."
REQUIRED_PORTS=(3000 3001 5433 6381)
PORT_NAMES=("Web Dashboard" "Backend API" "PostgreSQL" "Redis")

for i in "${!REQUIRED_PORTS[@]}"; do
    PORT="${REQUIRED_PORTS[$i]}"
    NAME="${PORT_NAMES[$i]}"
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        CMDLINE=$(ps -p $PID -o args= 2>/dev/null || echo "unknown")
        
        # Check if process belongs to careservice
        if echo "$CMDLINE" | grep -qi "careservice\|docker.*careservice\|node.*backend\|node.*web-dashboard"; then
            print_warning "Killing CareService process on port $PORT (PID: $PID)"
            kill -9 $PID 2>/dev/null || true
            print_success "Process killed on port $PORT"
        else
            print_info "Port $PORT used by non-CareService process - will assign alternative port"
        fi
    fi
done

# Step 8: Verify volumes are preserved
print_info "Verifying data volumes..."
if docker volume ls | grep -q "postgres_data"; then
    print_success "PostgreSQL data volume preserved ✓"
else
    print_warning "PostgreSQL data volume not found (will be created on deployment)"
fi

if docker volume ls | grep -q "redis_data"; then
    print_success "Redis data volume preserved ✓"
else
    print_warning "Redis data volume not found (will be created on deployment)"
fi

echo ""
print_success "Cleanup complete! System ready for deployment."
echo ""
