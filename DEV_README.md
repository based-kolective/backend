# Kolective Backend - Docker Development Setup

This setup provides a complete Docker-based development environment with hot reloading and cron job monitoring.

## Prerequisites

- Docker and Docker Compose installed
- Git (for version control)

## Quick Start

### On Windows:
```bash
# Start development environment
./dev.bat up

# View logs and monitor cron jobs
./dev.bat logs

# Check cron status specifically
./dev.bat cron
```

### On Linux/macOS:
```bash
# Make script executable
chmod +x dev.sh

# Start development environment
./dev.sh up

# View logs and monitor cron jobs
./dev.sh logs

# Check cron status specifically
./dev.sh cron
```

## Development Commands

| Command | Description |
|---------|-------------|
| `up` | Build and start the development environment |
| `down` | Stop the development environment |
| `logs` | Show and follow application logs |
| `migrate` | Run database migrations |
| `reset` | Reset database (⚠️ destroys all data) |
| `studio` | Open Prisma Studio for database management |
| `cron` | Check cron task status and recent executions |
| `restart` | Restart the application service |
| `help` | Show available commands |

## Features

### 🔄 Hot Reloading
- Code changes are automatically detected and the app restarts
- No need to rebuild Docker images during development
- TypeScript compilation happens automatically

### ⏰ Cron Job Monitoring
- The scraper task runs every 10 seconds
- Enhanced logging shows cron execution status
- Use `./dev.bat cron` (Windows) or `./dev.sh cron` (Linux/macOS) to check recent cron activity

### 🗄️ Database Management
- PostgreSQL database runs in a separate container
- Automatic migration deployment on startup
- Prisma Studio available for database inspection
- Easy database reset for testing

### 🐛 Debugging Support
- Debug port (9229) exposed for VS Code debugging
- Detailed logging for troubleshooting
- Real-time log streaming

## Environment Configuration

The script automatically creates a `.env` file with default values:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/kolective_dev?schema=public"
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email@example.com
```

**Important:** Update the Twitter credentials in `.env` with your actual values.

## Cron Job Details

The scraper task is configured to run every 10 seconds with the following features:

- **Automatic execution**: Starts immediately when the application boots
- **Error handling**: Catches and logs any errors during execution
- **Completion waiting**: Ensures previous execution completes before starting new one
- **Detailed logging**: Timestamps and status messages for monitoring

### Monitoring Cron Jobs

To verify cron jobs are running:

1. **Check logs**: `./dev.bat logs` (Windows) or `./dev.sh logs` (Linux/macOS)
2. **Cron-specific logs**: `./dev.bat cron` (Windows) or `./dev.sh cron` (Linux/macOS)
3. **Look for these log messages**:
   - `ScraperTask initialized - Cron job will run every 10 seconds`
   - `[timestamp] Starting scheduled scraper task`
   - `[timestamp] Scraper task completed successfully`

## Troubleshooting

### Docker Issues
- Ensure Docker Desktop is running
- Check if ports 3000 and 5432 are available
- Try `docker system prune` if you encounter build issues

### Database Issues
- Run `./dev.bat migrate` or `./dev.sh migrate` to apply migrations
- Use `./dev.bat reset` or `./dev.sh reset` to completely reset the database
- Check database connection in logs

### Cron Not Running
- Check application logs for initialization messages
- Verify the ScraperTask is properly registered in AppModule
- Ensure ScheduleModule is imported in the application

### Hot Reloading Not Working
- Verify the volume mounts in docker-compose.dev.yml
- Check if file changes are detected in the logs
- Restart the development environment

## Development Workflow

1. **Start environment**: `./dev.bat up` or `./dev.sh up`
2. **Monitor logs**: `./dev.bat logs` or `./dev.sh logs`
3. **Make code changes**: Files are automatically watched
4. **Check cron activity**: `./dev.bat cron` or `./dev.sh cron`
5. **Database changes**: `./dev.bat migrate` or `./dev.sh migrate`
6. **Stop environment**: `./dev.bat down` or `./dev.sh down`

## Production Deployment

This development setup is separate from production. For production deployment, use the main `Dockerfile` and appropriate production configurations.

## VS Code Integration

For the best development experience with VS Code:

1. Install the Docker extension
2. Use the Remote-Containers extension to develop inside the container
3. Configure debugging with the exposed port 9229

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs with `./dev.bat logs` or `./dev.sh logs`
3. Ensure all prerequisites are installed
4. Verify Docker is running and accessible
