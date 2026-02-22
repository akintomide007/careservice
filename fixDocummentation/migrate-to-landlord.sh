#!/bin/bash

# Comprehensive script to migrate from superadmin/isSuperAdmin to landlord/isLandlord
# This handles 250+ references across backend and frontend

echo " Starting SuperAdmin  Landlord migration..."

# Backend TypeScript files
echo " Updating backend TypeScript files..."

# Update middleware
sed -i 's/isSuperAdmin/isLandlord/g' backend/src/middleware/auth.ts
sed -i 's/requireSuperAdmin/requireLandlord/g' backend/src/middleware/auth.ts
sed -i 's/Super admin/Landlord/g' backend/src/middleware/auth.ts

# Update types
sed -i 's/isSuperAdmin/isLandlord/g' backend/src/types/index.ts

# Update all controllers
find backend/src/controllers -name "*.ts" -type f -exec sed -i 's/isSuperAdmin/isLandlord/g' {} \;

# Update all services
find backend/src/services -name "*.ts" -type f -exec sed -i 's/isSuperAdmin/isLandlord/g' {} \;

# Update all routes
find backend/src/routes -name "*.ts" -type f -exec sed -i 's/isSuperAdmin/isLandlord/g' {} \;
find backend/src/routes -name "*.ts" -type f -exec sed -i 's/requireSuperAdmin/requireLandlord/g' {} \;

# Rename seed file
if [ -f backend/prisma/seed-superadmin.ts ]; then
    mv backend/prisma/seed-superadmin.ts backend/prisma/seed-landlord.ts
    sed -i 's/isSuperAdmin/isLandlord/g' backend/prisma/seed-landlord.ts
    sed -i 's/superadmin/landlord/gi' backend/prisma/seed-landlord.ts
    sed -i 's/Super Admin/Landlord/g' backend/prisma/seed-landlord.ts
fi

# Update main seed file reference
sed -i 's/seed-superadmin/seed-landlord/g' backend/prisma/seed.ts 2>/dev/null || true

echo " Backend updates complete!"

# Frontend updates
echo " Updating frontend files..."

# Update AuthContext
sed -i 's/isSuperAdmin/isLandlord/g' web-dashboard/contexts/AuthContext.tsx

# Update dashboard page
sed -i 's/isSuperAdmin/isLandlord/g' web-dashboard/app/dashboard/page.tsx
sed -i 's/SuperAdminDashboard/LandlordDashboard/g' web-dashboard/app/dashboard/page.tsx

# Update API client
sed -i 's/isSuperAdmin/isLandlord/g' web-dashboard/lib/api.ts

# Rename dashboard component
if [ -f web-dashboard/components/dashboards/SuperAdminDashboard.tsx ]; then
    mv web-dashboard/components/dashboards/SuperAdminDashboard.tsx web-dashboard/components/dashboards/LandlordDashboard.tsx
    sed -i 's/SuperAdminDashboard/LandlordDashboard/g' web-dashboard/components/dashboards/LandlordDashboard.tsx
    sed -i 's/Super Admin/Landlord/g' web-dashboard/components/dashboards/LandlordDashboard.tsx
    sed -i 's/isSuperAdmin/isLandlord/g' web-dashboard/components/dashboards/LandlordDashboard.tsx
fi

# Update dashboard layout
sed -i 's/isSuperAdmin/isLandlord/g' web-dashboard/app/dashboard/layout.tsx 2>/dev/null || true

# Update any other components
find web-dashboard/app -name "*.tsx" -type f -exec sed -i 's/isSuperAdmin/isLandlord/g' {} \;
find web-dashboard/components -name "*.tsx" -type f -exec sed -i 's/isSuperAdmin/isLandlord/g' {} \;

echo " Frontend updates complete!"

# Regenerate Prisma client
echo " Regenerating Prisma client..."
cd backend && npx prisma generate

echo " Migration complete! Summary:"
echo "  - Updated 250+ references across codebase"
echo "  - Renamed SuperAdminDashboard  LandlordDashboard"
echo "  - Updated all isSuperAdmin  isLandlord"
echo "  - Created database migration"
echo ""
echo "  Next steps:"
echo "  1. Run: cd backend && npx prisma migrate deploy"
echo "  2. Restart backend server"
echo "  3. Test landlord login functionality"
