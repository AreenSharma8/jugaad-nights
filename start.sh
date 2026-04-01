#!/bin/bash

# ============================================================================
# START.SH - Docker Compose Startup Script
# ============================================================================
# This script starts the complete Jugaad Nights application stack using
# Docker Compose. It handles building images, starting services, and running
# database migrations.
#
# Usage:
#   ./start.sh              - Start the full stack
#   ./start.sh build        - Build and start the stack
#   ./start.sh stop         - Stop all running containers
#   ./start.sh restart      - Restart the stack
#   ./start.sh logs         - View logs from all services
#   ./start.sh clean        - Stop and remove all containers
#
# Services Started:
#   - PostgreSQL: Database on port 5432
#   - Redis: Cache server on port 6379
#   - Backend API: NestJS on port 3000
#   - Frontend: React/Vite on port 8080
# ============================================================================

set -e  # Exit on any error

# ========== COLOR CODES FOR OUTPUT ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
APP_NAME="jugaad-nights"
COMPOSE_FILE="docker-compose.yml"

# ========== HELPER FUNCTIONS ==========

# Print colored header
print_header() {
  echo -e "${BLUE}==========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}==========================================${NC}"
}

# Print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Print warning message
print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Print info message
print_info() {
  echo -e "${CYAN}ℹ $1${NC}"
}

# ========== DOCKER COMPOSE FUNCTIONS ==========

# Check if Docker Compose file exists
check_compose_file() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "$COMPOSE_FILE not found in current directory"
    exit 1
  fi
}

# Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    # Fallback to docker compose (newer syntax)
    COMPOSE_CMD="docker compose"
  else
    COMPOSE_CMD="docker-compose"
  fi
}

# Build images if needed
build_images() {
  print_header "Building Docker Images"
  
  if [ -f "build.sh" ]; then
    print_info "Running build.sh..."
    bash build.sh all
    print_success "Images built successfully"
  else
    print_warning "build.sh not found, using docker-compose build"
    $COMPOSE_CMD build --pull
    print_success "Images built via docker-compose"
  fi
}

# Start all services
start_services() {
  print_header "Starting Services"
  
  print_info "Starting containers with docker-compose..."
  $COMPOSE_CMD up -d
  
  print_success "Services started"
  
  # Wait for services to be ready
  print_info "Waiting for services to be healthy..."
  
  # Function to check if service is healthy
  check_health() {
    local service=$1
    local timeout=$2
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
      if $COMPOSE_CMD ps "$service" | grep -q "healthy"; then
        return 0
      elif $COMPOSE_CMD ps "$service" | grep -q "Up"; then
        # Service is up, might be waiting for dependencies
        elapsed=$((elapsed + 5))
        sleep 5
        continue
      fi
      
      elapsed=$((elapsed + 5))
      sleep 5
    done
    
    return 1
  }
  
  # Check services
  print_info "Checking PostgreSQL..."
  if check_health "postgres" 60; then
    print_success "PostgreSQL is healthy"
  else
    print_warning "PostgreSQL health check timeout - it may still be starting"
  fi
  
  print_info "Checking Redis..."
  if check_health "redis" 60; then
    print_success "Redis is healthy"
  else
    print_warning "Redis health check timeout - it may still be starting"
  fi
  
  print_info "Checking Backend..."
  if check_health "backend" 120; then
    print_success "Backend is healthy"
  else
    print_warning "Backend health check timeout - it may still be starting"
  fi
  
  print_info "Checking Frontend..."
  if check_health "frontend" 120; then
    print_success "Frontend is healthy"
  else
    print_warning "Frontend health check timeout - it may still be starting"
  fi
}

# Show service URLs
show_urls() {
  print_header "Service URLs"
  echo -e "${CYAN}Frontend:${NC}        http://localhost:8080"
  echo -e "${CYAN}Backend API:${NC}     http://localhost:3000"
  echo -e "${CYAN}API Docs:${NC}        http://localhost:3000/api/docs"
  echo -e "${CYAN}Database:${NC}        localhost:5432"
  echo -e "${CYAN}Redis:${NC}           localhost:6379"
}

# Show logs
show_logs() {
  print_header "Service Logs"
  
  if [ -n "$1" ]; then
    # Show logs for specific service
    $COMPOSE_CMD logs -f "$1"
  else
    # Show logs for all services
    $COMPOSE_CMD logs -f
  fi
}

# Stop services
stop_services() {
  print_header "Stopping Services"
  
  print_info "Stopping and removing containers..."
  $COMPOSE_CMD down
  
  print_success "Services stopped"
}

# Restart services
restart_services() {
  print_header "Restarting Services"
  
  stop_services
  sleep 2
  start_services
  show_urls
}

# Clean up everything
clean_all() {
  print_header "Cleaning Up Everything"
  
  print_warning "This will remove all containers, volumes, and networks"
  read -p "Are you sure? (yes/no): " -r
  echo
  
  if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Stopping services..."
    $COMPOSE_CMD down -v --remove-orphans
    
    print_success "Cleanup completed"
  else
    print_info "Cleanup cancelled"
  fi
}

# Check service status
status_services() {
  print_header "Service Status"
  
  $COMPOSE_CMD ps
  
  echo ""
  print_info "Service Health:"
  echo ""
  
  $COMPOSE_CMD ps --format "table {{.Service}}\t{{.Status}}"
}

# ========== MAIN SCRIPT ==========

main() {
  # Check prerequisites
  check_docker
  check_compose_file
  
  # Parse command line arguments
  case "${1:-start}" in
    start)
      build_images
      start_services
      show_urls
      print_success "Jugaad Nights is running!"
      ;;
    build)
      build_images
      start_services
      show_urls
      ;;
    stop)
      stop_services
      ;;
    restart)
      restart_services
      ;;
    logs)
      show_logs "${2:-}"
      ;;
    status)
      status_services
      ;;
    clean)
      clean_all
      ;;
    *)
      echo "Usage: $0 [start|build|stop|restart|logs|status|clean]"
      echo ""
      echo "Commands:"
      echo "  start   - Build and start all services (default)"
      echo "  build   - Build images and start services"
      echo "  stop    - Stop all running containers"
      echo "  restart - Restart all services"
      echo "  logs    - View service logs (optionally: logs [service])"
      echo "  status  - Show service status"
      echo "  clean   - Stop and remove all containers and volumes"
      echo ""
      echo "Service Names: postgres, redis, backend, frontend"
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
