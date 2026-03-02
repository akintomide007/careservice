#!/bin/bash

# =============================================================================
# CareService - Local PostgreSQL Setup Script
# =============================================================================
# This script sets up a local PostgreSQL database for CareService
# Run this script after installing PostgreSQL locally

set -e  # Exit on error

echo "🚀 CareService - Local PostgreSQL Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="careservice_db"
DB_USER="postgres"  # Using default postgres user

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Arch: sudo pacman -S postgresql"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠ PostgreSQL is not running${NC}"
    echo ""
    echo "Starting PostgreSQL..."
    
    # Try to start PostgreSQL based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start postgresql || sudo systemctl start postgresql
    else
        # Linux
        sudo systemctl start postgresql || sudo service postgresql start
    fi
    
    sleep 2
    
    if ! pg_isready -q; then
        echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
        echo "Please start PostgreSQL manually and run this script again"
        exit 1
    fi
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Prompt for PostgreSQL password
echo ""
echo "Enter your PostgreSQL password for user 'postgres'"
echo "(This is the password you set during PostgreSQL installation)"
read -sp "Password: " PG_PASSWORD
echo ""

# Test connection
export PGPASSWORD="$PG_PASSWORD"
if ! psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}❌ Failed to connect to PostgreSQL${NC}"
    echo "Please check your password and try again"
    exit 1
fi

echo -e "${GREEN}✓ Connected to PostgreSQL${NC}"

# Check if database already exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo ""
    echo -e "${YELLOW}⚠ Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" &> /dev/null
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo "Keeping existing database"
    fi
fi

# Create database if it doesn't exist
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo ""
    echo "Creating database '$DB_NAME'..."
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" &> /dev/null
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Update .env file
echo ""
echo "Setting up environment configuration..."
cd "$(dirname "$0")/../backend"

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        echo ""
        echo -e "${YELLOW}Note: Make sure DATABASE_URL in .env is set to:${NC}"
        echo "DATABASE_URL=postgresql://postgres:$PG_PASSWORD@localhost:5432/$DB_NAME"
        ENV_CREATED=false
    else
        cp .env.local.example .env
        # Update password in .env
        sed -i.bak "s/yourpassword/$PG_PASSWORD/g" .env && rm .env.bak 2>/dev/null || sed -i "s/yourpassword/$PG_PASSWORD/g" .env
        echo -e "${GREEN}✓ .env file created${NC}"
        ENV_CREATED=true
    fi
else
    cp .env.local.example .env
    # Update password in .env
    sed -i.bak "s/yourpassword/$PG_PASSWORD/g" .env && rm .env.bak 2>/dev/null || sed -i "s/yourpassword/$PG_PASSWORD/g" .env
    echo -e "${GREEN}✓ .env file created${NC}"
    ENV_CREATED=true
fi

# Run migrations
echo ""
echo "Running database migrations..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi

# Run seed (landlord only)
echo ""
read -p "Do you want to seed the database with initial landlord user? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Seeding database..."
    if npm run seed:landlord; then
        echo -e "${GREEN}✓ Database seeded${NC}"
        SEEDED=true
    else
        echo -e "${YELLOW}⚠ Seeding failed (you can run 'npm run seed:landlord' later)${NC}"
        SEEDED=false
    fi
else
    echo "Skipping seed data"
    SEEDED=false
fi

# Success summary
echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Database Details:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""

if [ "$ENV_CREATED" = true ]; then
    echo "Environment:"
    echo "  ✓ .env file created"
fi

echo "  ✓ Migrations run"

if [ "$SEEDED" = true ]; then
    echo "  ✓ Landlord user seeded"
    echo ""
    echo "Landlord Credentials:"
    echo "  Email: landlord@careservice.com"
    echo "  Password: landlord123"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Change this password after first login!${NC}"
fi

echo ""
echo "Next Steps:"
echo "  1. cd backend"
echo "  2. npm install (if not already done)"
echo "  3. npm run dev"
echo ""
echo "Then visit: http://localhost:3001"
echo ""

unset PGPASSWORD
