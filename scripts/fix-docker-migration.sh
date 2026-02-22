#!/bin/bash

echo "Fixing Docker Migration Issue..."

# Stop containers
echo "Stopping containers..."
docker-compose down

# Remove the migration that's causing issues
echo "Removing problematic migration folder..."
rm -rf backend/prisma/migrations/20260221_rename_superadmin_to_landlord

# Apply migrations with force (since we're renaming, not dropping)
echo "Starting database..."
docker-compose up -d postgres

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Apply the column rename directly via SQL
echo "Applying column rename directly..."
docker-compose exec -T postgres psql -U care_provider_user -d care_provider_db << 'EOF'
-- Check if old column exists and rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE users RENAME COLUMN is_super_admin TO is_landlord;
        RAISE NOTICE 'Column renamed from is_super_admin to is_landlord';
    ELSE
        RAISE NOTICE 'Column is_super_admin does not exist, skipping rename';
    END IF;
END $$;
EOF

echo "Marking schema as in sync..."
docker-compose exec -T backend npx prisma migrate resolve --applied 20260221_rename_superadmin_to_landlord || true

# Start all services
echo "Starting all services..."
docker-compose up -d

echo "Migration fix complete!"
echo "Check container logs with: docker-compose logs -f backend"
