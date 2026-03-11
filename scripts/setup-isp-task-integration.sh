#!/bin/bash

# ISP-Task Integration Setup Script
# This script completes the ISP goals to tasks integration

set -e

echo "========================================="
echo "ISP-Task Integration Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✓ Project directory confirmed"
echo ""

# Navigate to backend
cd backend

echo "Step 1: Generating Prisma Client..."
echo "-----------------------------------"
npx prisma generate
echo "✓ Prisma client generated"
echo ""

echo "Step 2: Running Database Migration..."
echo "--------------------------------------"
npx prisma migrate dev --name add_isp_goal_to_tasks --skip-seed
echo "✓ Database migration complete"
echo ""

echo "Step 3: Verification..."
echo "------------------------"
# Check if migration was successful
if [ -d "prisma/migrations/$(ls -t prisma/migrations | head -1)" ]; then
    echo "✓ Migration files created successfully"
else
    echo "⚠ Warning: Could not verify migration files"
fi
echo ""

cd ..

echo "========================================="
echo "✅ ISP-Task Integration Setup Complete!"
echo "========================================="
echo ""
echo "What's been implemented:"
echo "  ✓ Database schema updated (Task ↔ IspGoal relation)"
echo "  ✓ Backend services enhanced with ISP context"
echo "  ✓ API endpoints ready for ISP-linked tasks"
echo "  ✓ Mobile app TasksScreen displays ISP goals"
echo ""
echo "Next Steps:"
echo "  1. Restart your backend server:"
echo "     cd backend && npm run dev"
echo ""
echo "  2. Test as Manager (Web Dashboard):"
echo "     - View client ISP goals"
echo "     - Create tasks from goals"
echo "     - Assign to DSPs"
echo ""
echo "  3. Test as DSP (Web + Mobile):"
echo "     - View assigned tasks"
echo "     - See ISP goal context"
echo "     - Complete tasks"
echo ""
echo "  4. Read full documentation:"
echo "     docs/ISP_TASK_INTEGRATION_COMPLETE.md"
echo ""
echo "========================================="
