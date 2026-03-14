#!/bin/bash

# =============================================================================
# Rollback Script for CareService
# Restores previous deployment from backup
# =============================================================================

set -e

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

echo "🔄 CareService Rollback Utility"
echo "================================"
echo ""

# Check if running from project root
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Detect docker compose command (matches deploy-production.sh)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose not found"
    exit 1
fi
print_info "Using compose command: $COMPOSE_CMD"

# Check for available backups
# NOTE: Must match BACKUP_DIR in backup-database.sh
BACKUP_DIR="./backups/postgres"
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "No backup directory found at: $BACKUP_DIR"
    exit 1
fi

# List available backups
BACKUPS=$(ls -t "$BACKUP_DIR"/careservice_backup_*.sql.gz 2>/dev/null || true)
if [ -z "$BACKUPS" ]; then
    print_error "No backups found in $BACKUP_DIR"
    exit 1
fi

print_info "Available backups:"
echo ""
COUNT=1
declare -a BACKUP_ARRAY
while IFS= read -r backup; do
    BACKUP_ARRAY[$COUNT]="$backup"
    BACKUP_NAME=$(basename "$backup")
    BACKUP_SIZE=$(du -h "$backup" | cut -f1)
    BACKUP_DATE=$(echo "$BACKUP_NAME" | sed -n 's/careservice_backup_\([0-9]\{8\}_[0-9]\{6\}\).*/\1/p' | sed 's/_/ /; s/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3/')
    echo "  $COUNT) $BACKUP_NAME"
    echo "     Date: $BACKUP_DATE | Size: $BACKUP_SIZE"
    echo ""
    COUNT=$((COUNT + 1))
done <<< "$BACKUPS"

# Ask user to select a backup
echo ""
read -p "Select backup number to restore (1-$((COUNT-1))) or 'q' to quit: " SELECTION

if [ "$SELECTION" = "q" ] || [ "$SELECTION" = "Q" ]; then
    print_info "Rollback cancelled"
    exit 0
fi

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -ge "$COUNT" ]; then
    print_error "Invalid selection"
    exit 1
fi

SELECTED_BACKUP="${BACKUP_ARRAY[$SELECTION]}"
print_info "Selected backup: $(basename "$SELECTED_BACKUP")"

# Confirmation
echo ""
print_warning "⚠️  WARNING: This will replace the current database with the backup!"
print_warning "⚠️  Current data will be lost!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Rollback cancelled"
    exit 0
fi

# Check if PostgreSQL is running
print_info "Checking PostgreSQL status..."
if ! $COMPOSE_CMD -f docker-compose.production.yml ps postgres | grep -q "Up"; then
    print_error "PostgreSQL container is not running. Please start it first:"
    echo "  $COMPOSE_CMD -f docker-compose.production.yml up -d postgres"
    exit 1
fi

# Wait for PostgreSQL to be ready
print_info "Waiting for PostgreSQL to be ready..."
sleep 3
$COMPOSE_CMD -f docker-compose.production.yml exec -T postgres pg_isready -U careuser -d care_provider_db

# Create a backup of current state before rollback
print_info "Creating backup of current database before rollback..."
CURRENT_BACKUP="$BACKUP_DIR/pre_rollback_$(date +"%Y%m%d_%H%M%S").sql.gz"
$COMPOSE_CMD -f docker-compose.production.yml exec -T postgres pg_dump -U careuser -d care_provider_db | gzip > "$CURRENT_BACKUP"
print_success "Current state backed up to: $(basename "$CURRENT_BACKUP")"

# Drop and recreate database
print_info "Dropping current database..."
$COMPOSE_CMD -f docker-compose.production.yml exec -T postgres psql -U careuser -d postgres -c "DROP DATABASE IF EXISTS care_provider_db;"
$COMPOSE_CMD -f docker-compose.production.yml exec -T postgres psql -U careuser -d postgres -c "CREATE DATABASE care_provider_db OWNER careuser;"
print_success "Database recreated"

# Restore from backup
print_info "Restoring from backup: $(basename "$SELECTED_BACKUP")"
gunzip -c "$SELECTED_BACKUP" | $COMPOSE_CMD -f docker-compose.production.yml exec -T postgres psql -U careuser -d care_provider_db
print_success "Database restored successfully"

# Run migrations to ensure schema is up to date
print_info "Running database migrations to ensure schema compatibility..."
$COMPOSE_CMD -f docker-compose.production.yml exec -T backend npm run db:push 2>/dev/null || print_warning "Migration may have failed - check logs"

# Restart backend to clear cache
print_info "Restarting backend service..."
$COMPOSE_CMD -f docker-compose.production.yml restart backend
print_success "Backend restarted"

echo ""
print_success "🎉 Rollback completed successfully!"
echo ""
print_info "Restored from: $(basename "$SELECTED_BACKUP")"
print_info "Pre-rollback backup saved to: $(basename "$CURRENT_BACKUP")"
echo ""
print_warning "Please verify the application is working correctly"
echo ""