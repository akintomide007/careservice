#!/bin/bash

# ============================================================================
# Port Availability Checker
# ============================================================================
# Smart port conflict resolution:
# - Kills CareService processes on required ports
# - Assigns alternative ports for non-CareService conflicts
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo ""
print_info "Checking port availability..."

REQUIRED_PORTS=(3000 3001 5433 6381)
PORT_NAMES=("Web Dashboard" "Backend API" "PostgreSQL" "Redis")
ALTERNATIVE_PORTS=(3000 3001 5433 6381)

CONFLICTS_FOUND=0

for i in "${!REQUIRED_PORTS[@]}"; do
    PORT="${REQUIRED_PORTS[$i]}"
    NAME="${PORT_NAMES[$i]}"
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        CMDLINE=$(ps -p $PID -o args= 2>/dev/null || echo "unknown")
        
        # Check if process belongs to careservice
        if echo "$CMDLINE" | grep -qi "careservice\|docker.*careservice\|node.*backend\|node.*web-dashboard"; then
            print_warning "Port $PORT ($NAME) used by CareService process (PID: $PID)"
            print_info "This will be automatically killed during cleanup"
        else
            print_warning "Port $PORT ($NAME) occupied by external process (PID: $PID): ${CMDLINE:0:60}..."
            CONFLICTS_FOUND=1
            
            # Assign alternative port
            case $PORT in
                3000)
                    ALTERNATIVE_PORTS[0]=3002
                    print_info "✓ Alternative assigned: Web Dashboard → port 3002"
                    ;;
                3001)
                    ALTERNATIVE_PORTS[1]=3003
                    print_info "✓ Alternative assigned: Backend API → port 3003"
                    ;;
                5433)
                    ALTERNATIVE_PORTS[2]=5434
                    print_info "✓ Alternative assigned: PostgreSQL → port 5434"
                    ;;
                6381)
                    ALTERNATIVE_PORTS[3]=6382
                    print_info "✓ Alternative assigned: Redis → port 6382"
                    ;;
            esac
        fi
    else
        print_success "Port $PORT ($NAME) is available"
    fi
done

echo ""

# Export port assignments
export WEB_PORT=${ALTERNATIVE_PORTS[0]}
export BACKEND_PORT=${ALTERNATIVE_PORTS[1]}
export POSTGRES_PORT=${ALTERNATIVE_PORTS[2]}
export REDIS_PORT=${ALTERNATIVE_PORTS[3]}

# Write to temp file for sourcing by deploy script
cat > /tmp/careservice_ports.env << EOF
WEB_PORT=${WEB_PORT}
BACKEND_PORT=${BACKEND_PORT}
POSTGRES_PORT=${POSTGRES_PORT}
REDIS_PORT=${REDIS_PORT}
EOF

if [ $CONFLICTS_FOUND -eq 1 ]; then
    print_warning "Port conflicts detected - alternative ports assigned"
    print_info "Ports will be: Web=$WEB_PORT, Backend=$BACKEND_PORT, DB=$POSTGRES_PORT, Redis=$REDIS_PORT"
else
    print_success "All required ports are available!"
fi

echo ""
