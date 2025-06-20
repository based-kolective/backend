#!/bin/bash

# Kolective Backend - Complete Development Setup
# This script sets up everything needed for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    Kolective Backend Development                 ║"
    echo "║                         Setup Complete                          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

print_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Setup environment
setup_environment() {
    print_section "Setting Up Environment"
    
    if [ ! -f .env ]; then
        print_warning "Creating .env file from template..."
        cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@db:5432/kolective_dev?schema=public"
TWITTER_USERNAME=your_username_here
TWITTER_PASSWORD=your_password_here
TWITTER_EMAIL=your_email@example.com
EOF
        print_warning "Please update .env file with your actual Twitter credentials!"
        print_status "Opening .env file for editing..."
        
        # Try to open with common editors
        if command -v code &> /dev/null; then
            code .env
        elif command -v nano &> /dev/null; then
            nano .env
        elif command -v vim &> /dev/null; then
            vim .env
        else
            print_warning "Please manually edit .env file with your Twitter credentials"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Start development environment
start_development() {
    print_section "Starting Development Environment"
    
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_status "Running database migrations..."
    docker-compose -f docker-compose.dev.yml exec -T app pnpm exec prisma migrate deploy
    
    print_success "Development environment is ready!"
}

# Show development information
show_dev_info() {
    print_section "Development Information"
    
    echo -e "${GREEN}🚀 Application URLs:${NC}"
    echo "   • Main App: http://localhost:3000"
    echo "   • Health Check: http://localhost:3000/health"
    echo "   • API Endpoints: http://localhost:3000/tweets"
    echo ""
    
    echo -e "${GREEN}📊 Database:${NC}"
    echo "   • PostgreSQL: localhost:5432"
    echo "   • Database: kolective_dev"
    echo "   • Username: postgres"
    echo "   • Password: postgres"
    echo ""
    
    echo -e "${GREEN}⚙️ Development Commands:${NC}"
    echo "   • View logs: ./dev.sh logs"
    echo "   • Check cron: ./dev.sh cron"
    echo "   • Restart app: ./dev.sh restart"
    echo "   • Stop environment: ./dev.sh down"
    echo "   • Database studio: ./dev.sh studio"
    echo ""
    
    echo -e "${GREEN}🔄 Cron Jobs:${NC}"
    echo "   • Scraper runs every 10 seconds"
    echo "   • Check status with: ./dev.sh cron"
    echo "   • View in logs: ./dev.sh logs"
    echo ""
    
    echo -e "${GREEN}💻 VS Code Integration:${NC}"
    echo "   • Debug port: 9229"
    echo "   • File watching enabled"
    echo "   • Hot reload on save"
}

# Monitor cron for a few seconds to verify it's working
monitor_cron() {
    print_section "Verifying Cron Jobs"
    
    print_status "Monitoring cron execution for 30 seconds..."
    print_status "You should see scraper task messages every 10 seconds..."
    
    timeout 30s docker-compose -f docker-compose.dev.yml logs -f app | grep -E "(ScraperTask|handleCron|Starting scheduled|completed successfully)" || true
    
    print_success "Cron monitoring complete"
}

# Main setup function
main() {
    print_header
    
    check_prerequisites
    setup_environment
    start_development
    monitor_cron
    show_dev_info
    
    print_section "Setup Complete!"
    print_success "Your development environment is ready!"
    print_status "Run './dev.sh logs' to monitor the application"
    print_status "Press Ctrl+C to stop log monitoring when you're done"
    
    # Follow logs
    echo ""
    print_status "Following application logs (press Ctrl+C to stop)..."
    docker-compose -f docker-compose.dev.yml logs -f app
}

# Run main function
main
