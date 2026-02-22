#!/bin/bash
FILE="backend/src/services/organizationAdmin.service.ts"

# Remove duplicate closing brace on line 120
sed -i '120d' "$FILE"

# Remove invalid _count references in getOrganizationById (lines 115-118)
sed -i '116s/, *$//' "$FILE"  # Remove trailing comma
sed -i '117,118d' "$FILE"     # Delete the invalid sessions/progressNotes/incidents lines

# Remove contactName from organization creation (not in schema)
sed -i '/contactName: data.contactName,/d' "$FILE"

# Fix getOrganizationStats - remove invalid _count fields
sed -i '/progressNotes: true,/d' "$FILE"
sed -i '/incidents: true,/d' "$FILE"
sed -i '/serviceStrategies: true,/d' "$FILE"
sed -i '/violations: true,/d' "$FILE"

# Fix return statement in getOrganizationStats - remove invalid properties
sed -i '/totalProgressNotes: org._count.progressNotes,/d' "$FILE"
sed -i '/totalIncidents: org._count.incidents,/d' "$FILE"
sed -i '/totalStrategies: org._count.serviceStrategies,/d' "$FILE"
sed -i '/totalViolations: org._count.violations,/d' "$FILE"

echo "Fixed organizationAdmin.service.ts"
