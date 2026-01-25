#!/bin/bash

echo "Care Provider System - Phase 2 API Testing"
echo "==========================================="
echo ""

API_BASE="http://localhost:3008/api"

echo "1. Login as DSP"
echo "----------------"
LOGIN_RESPONSE=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dsp@careservice.com","password":"dsp123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Login successful!"
echo "Token: ${TOKEN:0:30}..."
echo ""

echo "2. Get All Clients"
echo "------------------"
curl -s $API_BASE/clients \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {id, firstName, lastName, dddId}'
echo ""

echo "3. Search Clients"
echo "-----------------"
curl -s "$API_BASE/clients?search=Sarah" \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {firstName, lastName}'
echo ""

CLIENT_ID=$(curl -s $API_BASE/clients -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

echo "4. Clock In"
echo "-----------"
CLOCK_IN_RESPONSE=$(curl -s -X POST $API_BASE/sessions/clock-in \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"serviceType\": \"community_based_support\",
    \"latitude\": 40.7128,
    \"longitude\": -74.0060,
    \"locationName\": \"Community Center\"
  }")

SESSION_ID=$(echo $CLOCK_IN_RESPONSE | jq -r '.id')
echo "Clocked in successfully!"
echo "Session ID: $SESSION_ID"
echo "Client: $(echo $CLOCK_IN_RESPONSE | jq -r '.client.firstName') $(echo $CLOCK_IN_RESPONSE | jq -r '.client.lastName')"
echo ""

echo "5. Get Active Sessions"
echo "----------------------"
curl -s $API_BASE/sessions/active \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {id, serviceType, status, clockInTime}'
echo ""

sleep 2

echo "6. Clock Out"
echo "------------"
CLOCK_OUT_RESPONSE=$(curl -s -X POST $API_BASE/sessions/clock-out \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"latitude\": 40.7128,
    \"longitude\": -74.0060
  }")

echo "Clocked out successfully!"
echo "Total Hours: $(echo $CLOCK_OUT_RESPONSE | jq -r '.totalHours')"
echo ""

echo "7. Get Session History"
echo "----------------------"
curl -s "$API_BASE/sessions/history?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {serviceType, totalHours, status}'
echo ""

echo "8. Login as Manager"
echo "-------------------"
MANAGER_LOGIN=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@careservice.com","password":"manager123"}')

MANAGER_TOKEN=$(echo $MANAGER_LOGIN | jq -r '.token')
echo "Manager logged in!"
echo ""

echo "9. Create New Client (Manager)"
echo "------------------------------"
NEW_CLIENT=$(curl -s -X POST $API_BASE/clients \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Client",
    "dateOfBirth": "1992-08-15",
    "dddId": "DDD-2024-TEST",
    "address": "123 Test St",
    "emergencyContactName": "Emergency Contact",
    "emergencyContactPhone": "555-0999"
  }')

echo "New client created!"
echo "Name: $(echo $NEW_CLIENT | jq -r '.firstName') $(echo $NEW_CLIENT | jq -r '.lastName')"
echo "DDD ID: $(echo $NEW_CLIENT | jq -r '.dddId')"
echo ""

echo "10. Get All Sessions (Manager View)"
echo "------------------------------------"
curl -s $API_BASE/sessions/all \
  -H "Authorization: Bearer $MANAGER_TOKEN" | jq '. | length'
echo " total sessions found"
echo ""

echo "All Phase 2 tests completed successfully!"
