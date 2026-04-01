#!/bin/bash

# ============================================================================
# BUILD.SH - Docker Build Script
# ============================================================================
# This script builds Docker images for the Jugaad Nights application stack.
# It handles building images for both backend and frontend components.
# 
# Usage:
#   ./build.sh              - Build all images
#   ./build.sh backend      - Build only backend image
#   ./build.sh frontend     - Build only frontend image
#   ./build.sh clean        - Remove all application images
# 
# Environment:
#   DOCKER_BUILDKIT: Enable BuildKit for faster builds (enabled by default)
# ============================================================================

set -e  # Exit on any error

# ========== COLOR CODES FOR OUTPUT ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
# Application name and version
APP_NAME="jugaad-nights"
REGISTRY="${DOCKER_REGISTRY:-localhost}"
BACKEND_IMAGE="${REGISTRY}/${APP_NAME}-backend:latest"
FRONTEND_IMAGE="${REGISTRY}/${APP_NAME}-frontend:latest"

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
  echo -e "${BLUE}ℹ $1${NC}"
}

# ========== BUILD FUNCTIONS ==========

# Build backend image
build_backend() {
  print_header "Building Backend Image"
  
  # Check if Dockerfile exists
  if [ ! -f "backend/Dockerfile" ]; then
    print_error "backend/Dockerfile not found"
    return 1
  fi
  
  print_info "Building: $BACKEND_IMAGE"
  docker build \
    --file backend/Dockerfile \
    --target development \
    --tag "$BACKEND_IMAGE" \
    --build-arg NODE_ENV=development \
    backend/
  
  print_success "Backend image built successfully"
}

# Build frontend image
build_frontend() {
  print_header "Building Frontend Image"
  
  # Check if Dockerfile exists
  if [ ! -f "Dockerfile.frontend" ]; then
    print_error "Dockerfile.frontend not found"
    return 1
  fi
  
  print_info "Building: $FRONTEND_IMAGE"
  docker build \
    --file Dockerfile.frontend \
    --tag "$FRONTEND_IMAGE" \
    --build-arg VITE_API_URL=http://localhost:3000/api \
    --build-arg VITE_API_BASE_URL=http://localhost:3000 \
    .
  
  print_success "Frontend image built successfully"
}

# Clean up images
clean_images() {
  print_header "Cleaning Up Docker Images"
  
  print_warning "Removing images..."
  
  # Remove images if they exist
  docker rmi "$BACKEND_IMAGE" 2>/dev/null || true
  docker rmi "$FRONTEND_IMAGE" 2>/dev/null || true
  
  print_success "Cleanup completed"
}

# Build all images
build_all() {
  print_header "Building All Images for $APP_NAME"
  
  # Enable Docker BuildKit for faster builds
  export DOCKER_BUILDKIT=1
  
  print_info "Using BuildKit for optimized builds"
  
  # Build backend
  if ! build_backend; then
    print_error "Failed to build backend image"
    return 1
  fi
  
  # Build frontend
  if ! build_frontend; then
    print_error "Failed to build frontend image"
    return 1
  fi
  
  print_success "All images built successfully!"
  print_info "Next step: Run './start.sh' to start the containers"
}

# ========== MAIN SCRIPT ==========

main() {
  # Check if Docker is installed
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
  fi
  
  # Check if docker daemon is running
  if ! docker ps > /dev/null 2>&1; then
    print_error "Docker daemon is not running"
    exit 1
  fi
  
  # Parse command line arguments
  case "${1:-all}" in
    backend)
      build_backend
      ;;
    frontend)
      build_frontend
      ;;
    clean)
      clean_images
      ;;
    all)
      build_all
      ;;
    *)
      echo "Usage: $0 [all|backend|frontend|clean]"
      echo ""
      echo "Commands:"
      echo "  all       - Build all images (default)"
      echo "  backend   - Build only backend image"
      echo "  frontend  - Build only frontend image"
      echo "  clean     - Remove all application images"
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
