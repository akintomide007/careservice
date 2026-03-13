#!/bin/bash

# =============================================================================
# Fix Docker Compose Version for Production Deployment
# =============================================================================

set -e

echo "🔧 Fixing Docker Compose Installation..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check current docker-compose version
print_info "Checking current Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    CURRENT_VERSION=$(docker-compose version --short 2>/dev/null || echo "unknown")
    print_warning "Found old docker-compose (v$CURRENT_VERSION)"
    print_info "Removing old Python-based docker-compose..."
    
    # Remove old docker-compose
    sudo apt remove docker-compose -y 2>/dev/null || true
    sudo pip uninstall docker-compose -y 2>/dev/null || true
    sudo pip3 uninstall docker-compose -y 2>/dev/null || true
    sudo rm -f /usr/local/bin/docker-compose 2>/dev/null || true
    sudo rm -f /usr/bin/docker-compose 2>/dev/null || true
    
    print_success "Old docker-compose removed"
else
    print_info "No old docker-compose found"
fi
echo ""

# Install Docker Compose Plugin (v2)
print_info "Installing Docker Compose Plugin (v2)..."

# Update package list
sudo apt update

# Install the Docker Compose plugin
sudo apt install -y docker-compose-plugin

print_success "Docker Compose Plugin installed"
echo ""

# Verify installation
print_info "Verifying installation..."
if docker compose version &> /dev/null; then
    VERSION=$(docker compose version --short)
    print_success "Docker Compose v$VERSION is now installed!"
    echo ""
    print_info "Use 'docker compose' (with space) instead of 'docker-compose' (with hyphen)"
else
    print_error "Installation verification failed"
    exit 1
fi
echo ""

# Create symbolic link for compatibility (optional)
print_info "Creating compatibility alias..."
cat > /tmp/docker-compose-wrapper.sh << 'EOF'
#!/bin/bash
# Wrapper script to redirect docker-compose to docker compose
exec docker compose "$@"
EOF

sudo mv /tmp/docker-compose-wrapper.sh /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

print_success "Compatibility alias created"
echo ""

print_success "🎉 Docker Compose is now ready!"
echo ""
echo "You can now use either:"
echo "  - docker compose (recommended)"
echo "  - docker-compose (compatibility mode)"
echo ""
print_info "Run the deployment script again: bash scripts/deploy-production.sh"
