#!/bin/bash

echo "Testing Care Provider API"
echo "========================="
echo ""

echo "1. Health Check"
echo "---------------"
curl -s http://localhost:3001/health | jq .
echo ""

echo "2. Login as DSP"
echo "---------------"
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dsp@careservice.com","password":"dsp123"}' | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "Login successful!"
  echo "Token: ${TOKEN:0:20}..."
else
  echo "Login failed"
fi
echo ""

echo "3. Login as Manager"
echo "-------------------"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@careservice.com","password":"manager123"}' | jq .
echo ""

echo "4. Login as Admin"
echo "-----------------"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careservice.com","password":"admin123"}' | jq .
echo ""

echo "All tests completed!"
