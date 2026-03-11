#!/bin/bash

# =============================================================================
# Generate Secure Secrets for Production Deployment
# =============================================================================

echo "🔐 Generating secure secrets for production..."
echo ""

# Generate JWT Secret
echo "📝 JWT_SECRET (Copy this to backend/.env.production):"
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate Database Password
echo "📝 Database Password (Update docker-compose.production.yml):"
DB_PASSWORD=$(openssl rand -base64 24)
echo "POSTGRES_PASSWORD=$DB_PASSWORD"
echo ""

# Generate Redis Password (optional)
echo "📝 Redis Password (Optional - Update docker-compose.production.yml):"
REDIS_PASSWORD=$(openssl rand -base64 24)
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""

echo "✅ Secrets generated successfully!"
echo ""
echo "⚠️  IMPORTANT SECURITY STEPS:"
echo "1. Copy JWT_SECRET to backend/.env.production"
echo "2. Update POSTGRES_PASSWORD in docker-compose.production.yml"
echo "3. Update DATABASE_URL in backend/.env.production with new password"
echo "4. Store these secrets securely (password manager, vault, etc.)"
echo "5. Never commit these secrets to version control"
echo ""
