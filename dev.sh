#!/bin/bash

# Development script for Kolective Backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to build and start development environment
dev_up() {
    print_status "Building and starting development environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@db:5432/kolective_dev?schema=public"
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com
EOF
        print_warning "Please update .env file with your actual credentials"
    fi
    
    docker-compose -f docker-compose.dev.yml up --build -d
    print_success "Development environment started"
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 5
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.dev.yml exec app pnpm exec prisma migrate deploy
    
    print_success "Development environment is ready!"
    print_status "Application URL: http://localhost:3000"
    print_status "Database URL: postgresql://postgres:postgres@localhost:5432/kolective_dev"
}

# Function to stop development environment
dev_down() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development environment stopped"
}

# Function to show logs
dev_logs() {
    print_status "Showing logs..."
    docker-compose -f docker-compose.dev.yml logs -f app
}

# Function to run database migrations
dev_migrate() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.dev.yml exec app pnpm exec prisma migrate dev
    print_success "Migrations completed"
}

# Function to reset database
dev_reset() {
    print_warning "This will reset the database and all data will be lost!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose -f docker-compose.dev.yml exec app pnpm exec prisma migrate reset --force
        print_success "Database reset completed"
    else
        print_status "Database reset cancelled"
    fi
}

# Function to open Prisma Studio
dev_studio() {
    print_status "Opening Prisma Studio..."
    docker-compose -f docker-compose.dev.yml exec app pnpm exec prisma studio
}

# Function to check cron status
dev_cron_status() {
    print_status "Checking cron task status..."
    docker-compose -f docker-compose.dev.yml logs app | grep -E "(ScraperTask|handleCron|cron)" | tail -20
}

# Function to restart app service
dev_restart() {
    print_status "Restarting application..."
    docker-compose -f docker-compose.dev.yml restart app
    print_success "Application restarted"
}

# Function to show help
show_help() {
    echo "Kolective Backend Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  up          Build and start development environment"
    echo "  down        Stop development environment"
    echo "  logs        Show application logs"
    echo "  migrate     Run database migrations"
    echo "  reset       Reset database (WARNING: destroys all data)"
    echo "  studio      Open Prisma Studio"
    echo "  cron        Check cron task status"
    echo "  restart     Restart application service"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 up       # Start development environment"
    echo "  $0 logs     # Follow application logs"
    echo "  $0 cron     # Check if cron tasks are running"
}

# Main script logic
case "$1" in
    up)
        check_docker
        dev_up
        ;;
    down)
        dev_down
        ;;
    logs)
        dev_logs
        ;;
    migrate)
        dev_migrate
        ;;
    reset)
        dev_reset
        ;;
    studio)
        dev_studio
        ;;
    cron)
        dev_cron_status
        ;;
    restart)
        dev_restart
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
