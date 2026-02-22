#!/bin/bash

# Fix Build Errors Script
echo "Fixing TypeScript build errors..."

# Fix organizationAdmin.service.ts - replace 'name' with firstName/lastName for Users
sed -i '59s/name: true/firstName: true, lastName: true/' backend/src/services/organizationAdmin.service.ts
sed -i '103s/name: true/firstName: true, lastName: true/' backend/src/services/organizationAdmin.service.ts  
sed -i '106s/name: true/firstName: true, lastName: true/' backend/src/services/organizationAdmin.service.ts

# Remove 'sessions' from _count (Organization doesn't have this relation)
sed -i '33d' backend/src/services/organizationAdmin.service.ts  # Delete line 33 (sessions: true)
sed -i '78d' backend/src/services/organizationAdmin.service.ts  # Delete line 79 (now 78)
sed -i '314d' backend/src/services/organizationAdmin.service.ts # Delete line 316 (now 314)

# Fix line 188 - split name into firstName/lastName
sed -i '188s/name: data.adminUser.name,/firstName: data.adminUser.name.split(" ")[0] || data.adminUser.name, lastName: data.adminUser.name.split(" ").slice(1).join(" ") || "",/' backend/src/services/organizationAdmin.service.ts

# Remove references to org._count.sessions
sed -i '45d' backend/src/services/organizationAdmin.service.ts  # totalSessions line
sed -i '120d' backend/src/services/organizationAdmin.service.ts  # totalSessions line
sed -i '356d' backend/src/services/organizationAdmin.service.ts  # totalSessions line

# Fix remaining name in supportTicket.service.ts line 105
sed -i '105s/name: true/firstName: true, lastName: true/' backend/src/services/supportTicket.service.ts

echo "Fixes applied!"
