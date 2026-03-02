#!/bin/bash

# =============================================================================
# CareService - Database Reset Script
# =============================================================================
# This script resets the database to a clean state
# WARNING: This will delete ALL data!

set -e

echo "⚠️  DATABASE RESET WARNING"
echo "========================="
echo ""
echo "This will:"
echo "  1. Drop all tables"
echo "  2. Run all migrations"
echo "  3. Optionally seed with landlord user"
echo ""
echo "ALL DATA WILL BE LOST!"
echo ""

read -p "Are you sure you want to continue? (yes/NO): " -r
echo ""

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Reset cancelled"
    exit 0
fi

cd "$(dirname "$0")/../backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Resetting database..."
echo ""

# Reset database (drops all tables and runs migrations)
npx prisma migrate reset --force --skip-seed

echo ""
echo -e "${GREEN}✓ Database reset complete${NC}"
echo ""

# Ask about seeding
read -p "Do you want to seed with landlord user? (Y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Seeding database..."
    npm run seed:landlord
    echo ""
    echo -e "${GREEN}✓ Database seeded${NC}"
    echo ""
    echo "Landlord Credentials:"
    echo "  Email: landlord@careservice.com"
    echo "  Password: landlord123"
else
    echo "Database is empty (no users)"
    echo "Run 'npm run seed:landlord' to create landlord user"
fi

echo ""
echo -e "${GREEN}✅ Reset complete!${NC}"
echo ""
