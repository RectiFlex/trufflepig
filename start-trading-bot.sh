#!/bin/bash

# TrufflePig Trading Bot Startup Script
# This script starts all components needed for the trading bot

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Cleanup function
cleanup() {
    log "Cleaning up processes..."
    pkill -f "elizaos" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    
    # Kill processes on specific ports
    lsof -ti:3000,3001,3002,5173 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    
    success "Cleanup completed"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    # Check if psql is available for database operations
    if ! command -v psql &> /dev/null; then
        warning "psql not found. Database operations may fail."
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        warning ".env file not found. Make sure environment variables are properly configured."
    fi
    
    success "Prerequisites check completed"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Check if database exists and tables are present
    if psql -d elizaos_development -c "SELECT 1 FROM agents LIMIT 1;" 2>/dev/null; then
        success "Database tables already exist"
    else
        warning "Database tables not found. Attempting to apply migration..."
        
        # Try to apply migration
        if [ -f "node_modules/@elizaos/plugin-sql/drizzle/migrations/0000_snapshot.sql" ]; then
            log "Applying database migration..."
            psql -d elizaos_development -f node_modules/@elizaos/plugin-sql/drizzle/migrations/0000_snapshot.sql || {
                error "Failed to apply database migration"
                return 1
            }
            success "Database migration applied successfully"
        else
            warning "Migration file not found. Database may need manual setup."
        fi
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing/updating dependencies..."
    npm install || {
        error "Failed to install dependencies"
        exit 1
    }
    success "Dependencies installed successfully"
}

# Start backend
start_backend() {
    log "Starting ElizaOS backend..."
    
    # Export SSL bypass environment variable
    export NODE_TLS_REJECT_UNAUTHORIZED=0
    
    # Start backend in background
    npm run dev:ssl-bypass > backend.log 2>&1 &
    BACKEND_PID=$!
    
    log "Backend starting with PID: $BACKEND_PID (SSL bypass enabled)"
    
    # Wait for backend to be ready
    log "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/agents > /dev/null 2>&1; then
            success "Backend is ready on port 3000"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    error "Backend failed to start properly"
    return 1
}

# Start frontend
start_frontend() {
    log "Starting frontend..."
    
    # Start frontend in background
    npm run dev:frontend > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    log "Frontend starting with PID: $FRONTEND_PID"
    
    # Wait for frontend to be ready
    log "Waiting for frontend to be ready..."
    for i in {1..20}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            success "Frontend is ready on port 5173"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    error "Frontend failed to start properly"
    return 1
}

# Test agent connectivity
test_agents() {
    log "Testing agent connectivity..."
    
    # Get agents list
    AGENTS_RESPONSE=$(curl -s http://localhost:3000/api/agents 2>/dev/null)
    
    if echo "$AGENTS_RESPONSE" | grep -q "success"; then
        success "Agents API is responding"
        
        # Show agent status
        echo "$AGENTS_RESPONSE" | jq '.data.agents[] | {name: .name, characterName: .characterName, status: .status}' 2>/dev/null || {
            log "Agent details (raw): $AGENTS_RESPONSE"
        }
    else
        warning "Agents API not responding properly"
    fi
}

# Monitor processes
monitor_processes() {
    log "Monitoring running processes..."
    
    # Check backend
    if kill -0 $BACKEND_PID 2>/dev/null; then
        success "Backend process is running (PID: $BACKEND_PID)"
    else
        error "Backend process has stopped"
    fi
    
    # Check frontend
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        success "Frontend process is running (PID: $FRONTEND_PID)"
    else
        error "Frontend process has stopped"
    fi
}

# Main execution
main() {
    log "Starting TrufflePig Trading Bot..."
    log "============================================="
    
    # Handle Ctrl+C gracefully
    trap cleanup EXIT INT TERM
    
    # Cleanup any existing processes
    cleanup
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database || {
        warning "Database setup had issues, but continuing..."
    }
    
    # Start backend
    start_backend || {
        error "Failed to start backend"
        exit 1
    }
    
    # Start frontend
    start_frontend || {
        error "Failed to start frontend"
        exit 1
    }
    
    # Test connectivity
    test_agents
    
    # Show status
    log "============================================="
    success "TrufflePig Trading Bot is now running!"
    log "Backend: http://localhost:3000"
    log "Frontend: http://localhost:5173/degen-intel/"
    log "Backend logs: tail -f backend.log"
    log "Frontend logs: tail -f frontend.log"
    log "============================================="
    
    # Monitor processes
    monitor_processes
    
    # Keep script running and show live status
    log "Press Ctrl+C to stop all services"
    while true; do
        sleep 30
        log "Services are running. Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
        
        # Quick health check
        if ! curl -s http://localhost:3000/api/agents > /dev/null 2>&1; then
            warning "Backend health check failed"
        fi
        
        if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
            warning "Frontend health check failed"
        fi
    done
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        log "Stopping all services..."
        cleanup
        success "All services stopped"
        ;;
    "status")
        log "Checking service status..."
        if pgrep -f "elizaos" > /dev/null; then
            success "Backend is running"
        else
            error "Backend is not running"
        fi
        
        if pgrep -f "vite" > /dev/null; then
            success "Frontend is running"
        else
            error "Frontend is not running"
        fi
        ;;
    "restart")
        log "Restarting all services..."
        cleanup
        sleep 3
        main
        ;;
    "logs")
        log "Showing recent logs..."
        echo "=== Backend Logs ==="
        tail -n 20 backend.log 2>/dev/null || echo "No backend logs found"
        echo ""
        echo "=== Frontend Logs ==="
        tail -n 20 frontend.log 2>/dev/null || echo "No frontend logs found"
        ;;
    *)
        main
        ;;
esac 