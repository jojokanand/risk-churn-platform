# Deployment Guide

Complete guide to deploying the Risk Churn Platform with the web dashboard.

## Quick Deploy (Recommended)

### Prerequisites

[OK] **Required:**
- Docker Desktop installed and running
- docker compose installed
- 8GB+ RAM available
- Ports 80, 3000, 8000, 9090, 9092, 6379 available

[OK] **Optional:**
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### One-Command Deployment

```bash
./deploy.sh
```

This script will:
1. Check Docker is running
2. Stop any existing containers
3. Build all images (backend + frontend)
4. Start all services
5. Display access URLs

**Access the dashboard at:** http://localhost

## Manual Deployment

### Option 1: Docker Compose (Production)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd risk-churn-platform
```

2. **Start all services:**
```bash
docker compose up -d --build
```

3. **Verify services are running:**
```bash
docker compose ps
```

Expected output:
```
NAME                SERVICE             STATUS
frontend            frontend            running
api                 api                 running
kafka               kafka               running
zookeeper           zookeeper           running
redis               redis               running
prometheus          prometheus          running
grafana             grafana             running
```

4. **Access the dashboard:**
- Frontend: http://localhost
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

### Option 2: Local Development

**Backend:**
```bash
# Install dependencies
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Start infrastructure
docker compose up -d kafka redis prometheus

# Start API
uvicorn src.risk_churn_platform.api.rest_api:app --reload
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm start
```

Access at: http://localhost:3000

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Port 80 (Nginx)                      │
│              Frontend Dashboard (React)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               Port 8000 (FastAPI)                       │
│            Backend API (Python)                         │
└──┬────────────────┬────────────────┬────────────────┬───┘
   │                │                │                │
   ▼                ▼                ▼                ▼
┌────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ Kafka  │    │  Redis  │    │Prometheus│    │PostgreSQL│
│  9092  │    │  6379   │    │   9090   │    │  (opt)   │
└────────┘    └─────────┘    └──────────┘    └──────────┘
```

## Environment Configuration

### Backend Environment Variables

Create `.env` file:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=INFO
```

### Frontend Environment Variables

Create `frontend/.env`:
```env
# API URL
REACT_APP_API_URL=http://localhost:8000

# Optional: Debug mode
REACT_APP_DEBUG=false
```

## Health Checks

### Verify Backend API

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "models": {
    "v1": true,
    "v2": true
  }
}
```

### Verify Frontend

```bash
curl -I http://localhost
```

Expected: `HTTP/1.1 200 OK`

### Test Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "customer_age_days": 365,
    "account_age_days": 400,
    "total_orders": 15,
    "total_revenue": 1500.0,
    "avg_order_value": 100.0,
    "days_since_last_order": 30,
    "order_frequency": 1.5,
    "website_visits_30d": 25,
    "email_open_rate": 0.65,
    "cart_abandonment_rate": 0.25,
    "product_views_30d": 50,
    "support_tickets_total": 2,
    "support_tickets_open": 0,
    "returns_count": 1,
    "refunds_count": 0,
    "favorite_category": "Electronics",
    "discount_usage_rate": 0.40,
    "premium_product_rate": 0.30,
    "payment_method": "Credit Card",
    "shipping_method": "Standard",
    "failed_payment_count": 0
  }'
```

## Monitoring

### View Logs

**All services:**
```bash
docker compose logs -f
```

**Specific service:**
```bash
docker compose logs -f frontend
docker compose logs -f api
docker compose logs -f kafka
```

**Last 100 lines:**
```bash
docker compose logs --tail=100 api
```

### Check Resource Usage

```bash
docker stats
```

### Prometheus Metrics

Visit http://localhost:9090 and query:
- `predictions_total` - Total predictions
- `prediction_latency_seconds` - Latency metrics
- `up` - Service health

### Grafana Dashboards

1. Open http://localhost:3000
2. Login: admin / admin
3. Add Prometheus data source: http://prometheus:9090
4. Import dashboards from `k8s/` directory

## Troubleshooting

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution:**
```bash
# Find process using the port
sudo lsof -i :80

# Kill the process or stop the service
sudo kill -9 <PID>

# Or change the port in docker compose.yml
```

### Issue: Frontend Not Loading

**Symptoms:** White screen or connection refused

**Solutions:**
1. Check frontend container is running:
   ```bash
   docker compose ps frontend
   ```

2. Check frontend logs:
   ```bash
   docker compose logs frontend
   ```

3. Rebuild frontend:
   ```bash
   docker compose up -d --build frontend
   ```

4. Check nginx config:
   ```bash
   docker compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

### Issue: API Not Responding

**Symptoms:** 502 Bad Gateway or connection timeout

**Solutions:**
1. Check API health:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check API logs:
   ```bash
   docker compose logs api
   ```

3. Restart API:
   ```bash
   docker compose restart api
   ```

4. Check if models are loaded:
   ```bash
   docker compose exec api ls -la /app/models
   ```

### Issue: Kafka Connection Errors

**Symptoms:** Kafka producer/consumer errors in logs

**Solutions:**
1. Ensure Kafka is running:
   ```bash
   docker compose ps kafka zookeeper
   ```

2. Check Kafka logs:
   ```bash
   docker compose logs kafka
   ```

3. Restart Kafka:
   ```bash
   docker compose restart kafka zookeeper
   ```

4. Verify Kafka topics:
   ```bash
   docker compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

### Issue: Out of Memory

**Symptoms:** Containers crashing or system slow

**Solutions:**
1. Increase Docker memory limit:
   - Docker Desktop → Settings → Resources → Memory
   - Recommended: 8GB+

2. Stop unused containers:
   ```bash
   docker system prune -a
   ```

3. Monitor resource usage:
   ```bash
   docker stats
   ```

## Scaling

### Horizontal Scaling

**API Service:**
```bash
docker compose up -d --scale api=3
```

**Add load balancer** (nginx or traefik) to distribute traffic.

### Vertical Scaling

Update `docker compose.yml`:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 4G
      reservations:
        cpus: '1'
        memory: 2G
```

## Production Deployment

### Security Checklist

- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up authentication for dashboard
- [ ] Use secrets management (AWS Secrets Manager, Vault)
- [ ] Enable API key authentication
- [ ] Configure CORS properly
- [ ] Regular security updates
- [ ] Enable monitoring and alerting

### HTTPS Setup with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push images
        run: |
          docker build -t your-registry/api:latest .
          docker build -t your-registry/frontend:latest ./frontend
          docker push your-registry/api:latest
          docker push your-registry/frontend:latest

      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && docker compose pull && docker compose up -d'
```

### Database Persistence

Add PostgreSQL for production:
```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: risk_churn
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

## Backup and Recovery

### Backup Models

```bash
# Backup models directory
tar -czf models-backup-$(date +%Y%m%d).tar.gz models/

# Backup to S3
aws s3 cp models/ s3://your-bucket/models/ --recursive
```

### Backup Database

```bash
# PostgreSQL
docker compose exec postgres pg_dump -U admin risk_churn > backup.sql

# Restore
docker compose exec -T postgres psql -U admin risk_churn < backup.sql
```

### Disaster Recovery

1. **Stop services:**
   ```bash
   docker compose down
   ```

2. **Restore volumes:**
   ```bash
   docker volume create --name=models-volume
   tar -xzf models-backup.tar.gz -C /var/lib/docker/volumes/models-volume/_data
   ```

3. **Restart:**
   ```bash
   docker compose up -d
   ```

## Performance Tuning

### Nginx Optimization

```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Increase worker connections
events {
    worker_connections 2048;
}
```

### API Optimization

```python
# Enable uvicorn workers
uvicorn src.risk_churn_platform.api.rest_api:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --loop uvloop
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check dashboard metrics
- Verify backup completion

**Weekly:**
- Review performance metrics
- Update dependencies
- Test disaster recovery

**Monthly:**
- Security updates
- Capacity planning
- Cost optimization

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Verify health
curl http://localhost:8000/health
curl http://localhost
```

## Cost Optimization

### Resource Limits

Set resource limits to prevent over-allocation:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

### Use Spot Instances (AWS)

For non-critical workloads, use EC2 spot instances to save 70-90% on costs.

### Monitoring Costs

- Track resource usage with Prometheus
- Set up cost alerts
- Scale down during off-hours

## Support

### Get Help

- Documentation: `README.md`, `DASHBOARD_GUIDE.md`
- Logs: `docker compose logs -f`
- Health Check: `curl http://localhost:8000/health`
- GitHub Issues: Report bugs and request features

### Useful Commands

```bash
# Restart everything
docker compose restart

# Rebuild specific service
docker compose up -d --build api

# View resource usage
docker stats

# Clean up
docker compose down -v  # Warning: removes volumes
docker system prune -a  # Free up disk space

# Export logs
docker compose logs > logs.txt

# Check port usage
lsof -i :80
lsof -i :8000
```

## Next Steps

After successful deployment:

1. [OK] Access http://localhost
2. [OK] Explore all 5 dashboard pages
3. [OK] Test predictions with sample data
4. [OK] Review monitoring metrics
5. [OK] Set up alerts for your team
6. [OK] Plan retention campaigns based on insights

Happy deploying!
