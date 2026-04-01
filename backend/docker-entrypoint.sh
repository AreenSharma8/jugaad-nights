#!/bin/bash

# Docker entrypoint script for NestJS development
# This script handles cleanup and graceful startup

set -e

echo "🚀 Starting NestJS Backend Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: dist/ folder already exists from build stage
# npm run start:dev will rebuild it with watch mode as files change

# Start NestJS in watch mode
echo "✨ Starting NestJS development server with watch mode..."
echo ""
exec npm run start:dev
