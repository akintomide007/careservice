#!/bin/bash

# =============================================================================
# Emergency Cleanup Script for CareService
# NUCLEAR OPTION: Removes EVERYTHING including data volumes
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "☢️  EMERGENCY CLEANUP - NUCLEAR OPTION ☢️"
echo "=========================================="
echo ""

# Multiple warnings
print_error "⚠️⚠️⚠️  EXTREME WARNING  ⚠️⚠️⚠️"
echo ""
print_warning "This script will DELETE:"
echo "  ❌ All CareService containers (running and stopped)"
echo "  ❌ All CareService networks"
echo "  ❌ All CareService images"
echo "  ❌ ALL CareService volumes (INCLUDING DATABASE DATA)"
echo "  ❌ All Docker build cache"
echo "  ❌ All orphaned Docker resources"
echo "  ❌ All processes using CareService ports"
echo ""
print_error "⚠️  THIS WILL PERMANENTLY DELETE ALL YOUR DATA! ⚠️"
print_error "⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️"
echo ""

# First confirmation
read -p "Type 'I UNDERSTAND' to continue: " CONFIRM1
if [ "$CONFIRM1" != "I UNDERSTAND" ]; then
    print_info "Emergency cleanup cancelled"
    exit 0
fi

# Second confirmation
echo ""
print_warning "Last chance to cancel!"
read -p "Type 'DELETE EVERYTHING' to proceed: " CONFIRM2
if [ "$CONFIRM2" != "DELETE EVERYTHING" ]; then
    print_info "Emergency cleanup cancelled"
    exit 0
fi

echo ""
print_error "Starting emergency cleanup in 5 seconds... Press Ctrl+C to cancel!"
sleep 5

set -e

# Detect docker compose command (matches deploy-production.sh)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    print_warning "Docker Compose not found - skipping compose down step"
    COMPOSE_CMD=""
fi

# Check if running from project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_warning "Not in project root, but continuing with cleanup..."
fi

echo ""
print_info "Step 1: Stopping all CareService Docker Compose services..."
if [ -n "$COMPOSE_CMD" ] && [ -f "docker-compose.production.yml" ]; then
    $COMPOSE_CMD -f docker-compose.production.yml down -v 2>/dev/null || print_warning "Docker Compose down failed (may not be running)"
else
    print_warning "Skipping compose down (no compose file or command found)"
fi
print_success "Docker Compose services stopped"
echo ""

print_info "Step 2: Removing ALL CareService containers..."
docker ps -a --filter "name=careservice" --format "{{.Names}}" | xargs -r docker rm -f 2>/dev/null || true
print_success "All CareService containers removed"
echo ""

print_info "Step 3: Removing ALL CareService volumes (DATA DELETION)..."
docker volume ls --filter "name=careservice" --format "{{.Name}}" | xargs -r docker volume rm -f 2>/dev/null || true
print_success "All CareService volumes DELETED"
echo ""

print_info "Step 4: Removing ALL CareService networks..."
docker network ls --filter "name=careservice" --format "{{.Name}}" | xargs -r docker network rm 2>/dev/null || true
print_success "All CareService networks removed"
echo ""

print_info "Step 5: Removing ALL CareService images..."
docker images --filter "reference=careservice*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi -f 2>/dev/null || true
docker images --filter "reference=careservice-*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi -f 2>/dev/null || true
docker images --filter "reference=careservice_*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi -f 2>/dev/null || true
print_success "All CareService images removed"
echo ""

print_info "Step 6: Removing orphaned containers..."
docker container prune -f > /dev/null 2>&1 || true
print_success "Orphaned containers removed"
echo ""

print_info "Step 7: Removing dangling images..."
docker image prune -f > /dev/null 2>&1 || true
print_success "Dangling images removed"
echo ""

print_info "Step 8: Cleaning ALL Docker build cache..."
docker builder prune -af > /dev/null 2>&1 || true
print_success "Docker build cache cleaned"
echo ""

print_info "Step 9: Removing unused volumes..."
docker volume prune -f > /dev/null 2>&1 || true
print_success "Unused volumes removed"
echo ""

print_info "Step 10: Killing processes on CareService ports..."
PORTS=(3000 3001 5433 6381)
for PORT in "${PORTS[@]}"; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        kill -9 $PID 2>/dev/null || true
        print_warning "Killed process on port $PORT (PID: $PID)"
    fi
done
print_success "All ports cleared"
echo ""

# Final status
print_success "☢️  EMERGENCY CLEANUP COMPLETE ☢️"
echo ""
print_info "Summary:"
echo "  ✅ All containers removed"
echo "  ✅ All volumes DELETED (data gone)"
echo "  ✅ All networks removed"
echo "  ✅ All images removed"
echo "  ✅ All build cache cleaned"
echo "  ✅ All ports cleared"
echo ""
print_warning "Your system is now completely clean - ALL DATA HAS BEEN DELETED"
echo ""
print_info "To redeploy from scratch:"
echo "  bash scripts/deploy-production.sh"
echo ""