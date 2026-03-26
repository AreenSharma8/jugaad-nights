# Deployment Guide

## Local Development Deployment

### Prerequisites
- Node.js v20+
- npm or yarn
- PostgreSQL 15+
- Redis 7+

### Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update .env with your database credentials
   ```

3. **Start Services**
   ```bash
   # Start PostgreSQL (ensure it's running)
   # Start Redis (ensure it's running)
   
   # Start Backend
   npm run start:dev
   ```

4. **Access the Application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/health

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Start All Services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL database
   - Redis cache
   - NestJS backend API

2. **Verify Services**
   ```bash
   docker-compose ps
   docker-compose logs backend
   ```

3. **Access Services**
   - Backend API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs
   - Database: postgres://postgres:postgres@localhost:5432/jugaad_nights
   - Redis: redis://localhost:6379

4. **Stop Services**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

```bash
# Build image
cd backend
docker build -t jugaad-nights-backend:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=postgres_host \
  -e REDIS_HOST=redis_host \
  --name jugaad-backend \
  jugaad-nights-backend:latest
```

## Production Deployment

### Azure Container Services (Recommended)

1. **Azure Container Registry**
   ```bash
   # Login to ACR
   az acr login --name <registry_name>
   
   # Build and push image
   docker build -t <registry>.azurecr.io/jugaad-backend:latest .
   docker push <registry>.azurecr.io/jugaad-backend:latest
   ```

2. **Azure App Service**
   ```bash
   # Create App Service Plan
   az appservice plan create \
     --name jugaad-plan \
     --resource-group jugaad-rg \
     --sku B2 --is-linux
   
   # Create App Service
   az webapp create \
     --resource-group jugaad-rg \
     --plan jugaad-plan \
     --name jugaad-api \
     --deployment-container-image-name <registry>.azurecr.io/jugaad-backend:latest
   ```

3. **Environment Variables**
   ```bash
   az webapp config appsettings set \
     --resource-group jugaad-rg \
     --name jugaad-api \
     --settings \
     DB_HOST=<db-host> \
     DB_PORT=5432 \
     DB_USERNAME=<username> \
     DB_PASSWORD=<password> \
     DB_NAME=jugaad_nights \
     REDIS_HOST=<redis-host> \
     REDIS_PORT=6379 \
     NODE_ENV=production \
     APP_PORT=3000
   ```

### Azure Database for PostgreSQL

```bash
# Create database server
az postgres flexible-server create \
  --resource-group jugaad-rg \
  --name jugaad-db \
  --admin-user dbadmin \
  --admin-password <password> \
  --database jugaad_nights
```

### Azure Cache for Redis

```bash
# Create Redis cache
az redis create \
  --resource-group jugaad-rg \
  --name jugaad-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

## Database Migration

### Initialize Database

1. **Run Migrations**
   ```bash
   npm run typeorm migration:run
   ```

2. **Seed Initial Data**
   ```bash
   npm run seed
   ```

### Backup & Restore

```bash
# Backup PostgreSQL
pg_dump -U postgres -h localhost jugaad_nights > backup.sql

# Restore from backup
psql -U postgres -h localhost jugaad_nights < backup.sql
```

## Monitoring & Logging

### Health Checks

- Application Health: `GET /health`
- Database Health: Monitored in migrations
- Redis Health: Checked on connection

### Logging

Logs are output to console and stored in Docker container logs.

```bash
# View logs
docker-compose logs -f backend
```

### Performance Monitoring

- Monitor database query times
- Cache hit rates in Redis
- API response times via Swagger metrics

## Backup Strategy

### Database Backups

1. **Automated Backups** (Azure)
   - Daily backups with 7-day retention
   - Geo-redundant storage

2. **Manual Backups**
   ```bash
   # Local backup
   pg_dump -U postgres jugaad_nights > backup_$(date +%Y%m%d).sql
   ```

### Code Backups

- Git repository with main, staging, production branches
- Docker image registry for version control

## Rollback Procedure

### Container Rollback

```bash
# Stop current version
docker-compose down

# Pull previous image
docker image pull <registry>/jugaad-backend:previous-version

# Update docker-compose.yml image version
# Start with previous version
docker-compose up -d
```

### Database Rollback

```bash
# Revert migration
npm run typeorm migration:revert

# Or restore from backup
psql jugaad_nights < backup_previous.sql
```

## Security Checklist

- [ ] Environment variables configured securely
- [ ] Database passwords stored in secrets manager
- [ ] HTTPS enabled in production
- [ ] CORS configured for allowed origins
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Regular security updates applied
- [ ] Database backups encrypted
- [ ] Access logs monitored
- [ ] JWT tokens configured with expiration

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL connection
psql -h localhost -U postgres -d jugaad_nights

# Check logs
docker-compose logs postgres
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -h localhost ping

# Check logs
docker-compose logs redis
```

### Application Issues

```bash
# Check application logs
docker-compose logs backend

# Rebuild and restart
docker-compose up -d --build backend
```

## Maintenance

### Regular Tasks

- Weekly: Review error logs
- Monthly: Database optimization
- Quarterly: Security updates
- Annually: Disaster recovery drills

### Scaling

For high-traffic scenarios:
- Use load balancer (Azure Load Balancer)
- Implement read replicas for database
- Use Redis cluster for caching
- Configure auto-scaling groups

---

For detailed API documentation, refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
