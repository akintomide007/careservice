#!/bin/bash

# ============================================================================
# Automatic PostgreSQL Database Backup Script
# ============================================================================
# Creates timestamped backups before deployment
# ============================================================================

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

# Create backup directory
# NOTE: Must match BACKUP_DIR in rollback.sh
BACKUP_DIR="./backups/postgres"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/careservice_backup_${TIMESTAMP}.sql"

echo ""
print_info "Starting database backup..."

# Check if postgres container is running
if docker ps --filter "name=careservice-postgres" --filter "status=running" | grep -q careservice-postgres; then
    print_info "PostgreSQL container is running - creating backup..."

    # Create backup
    if docker exec careservice-postgres pg_dump -U careuser care_provider_db > "$BACKUP_FILE" 2>/dev/null; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

        # Compress backup
        print_info "Compressing backup..."
        gzip "$BACKUP_FILE"
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
        print_success "Backup compressed: $BACKUP_FILE.gz ($COMPRESSED_SIZE)"

        # Keep only last 5 backups
        print_info "Cleaning old backups (keeping last 5)..."
        ls -t "$BACKUP_DIR"/careservice_backup_*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm
        print_success "Old backups cleaned"

        echo ""
        print_success "Database backup complete!"
        echo ""
    else
        print_error "Backup failed - database may be empty or inaccessible"
        exit 1
    fi
else
    print_warning "PostgreSQL container not running - skipping backup"
    print_info "This is normal for first-time deployments"
    echo ""
fi