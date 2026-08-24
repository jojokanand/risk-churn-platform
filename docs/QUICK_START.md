---
layout: default
title: Quick Start Guide
nav_order: 1
---

# Quick Start Guide
{: .no_toc }

Get the Risk Churn Platform running in under 5 minutes!
{: .fs-6 .fw-300 }

## Prerequisites

- [OK] Docker Desktop installed and **running**
- [OK] 8GB+ RAM available
- [OK] Ports 80, 8000 available

## Installation

### 1. One-Command Deploy

```bash
./deploy.sh
```

**That's it!** The script will:
- [OK] Build all Docker images
- [OK] Start all services
- [OK] Display access URLs

### 2. Access the Dashboard

Open your browser to:
- **Dashboard**: http://localhost
- **API Docs**: http://localhost:8000/docs

## First Steps

### Explore the Dashboard

1. **Dashboard Page** - View system status and metrics
   - Check that all services are healthy (green)
   - Review key metrics

2. **Predictions Page** - Test the ML model
   - Click "Load Low Risk Sample"
   - Click "Get Prediction"
   - See the risk score and recommendations

3. **Monitoring Page** - Check model health
   - View drift detection
   - Check performance metrics

4. **Model Management** - See deployment status
   - View model comparison
   - Check shadow analysis

5. **Analytics** - Explore customer insights
   - Review churn distribution
   - See feature importance

### Test a Prediction via API

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "customer_age_days": 365,
    "account_age_days": 400,
    "total_orders": 15,
    "total_revenue": 1500,
    "avg_order_value": 100,
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
    "discount_usage_rate": 0.4,
    "premium_product_rate": 0.3,
    "payment_method": "Credit Card",
    "shipping_method": "Standard",
    "failed_payment_count": 0
  }'
```

## Essential Commands

### Start/Stop

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# Restart a service
docker compose restart api
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f api
```

### Check Status

```bash
# Service status
docker compose ps

# Resource usage
docker stats
```

## Common Issues

### Issue: Port 80 in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or use different port in docker compose.yml
ports:
  - "8080:80"  # Access at http://localhost:8080
```

### Issue: Docker not running
```bash
# Start Docker Desktop
# Then run:
docker info

# If working, you should see Docker info
```

### Issue: Services not starting
```bash
# View logs for errors
docker compose logs

# Rebuild everything
docker compose down
docker compose up -d --build
```

## What's Next?

1. **Read the full guides:**
   - [DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md) - Complete user manual
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide

2. **Explore features:**
   - Test different prediction scenarios
   - Monitor drift detection
   - Try model promotion/rollback

3. **Customize:**
   - Adjust environment variables
   - Configure alerts
   - Add new features

## Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost | - |
| **API** | http://localhost:8000 | - |
| **API Docs** | http://localhost:8000/docs | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin/admin |

## Get Help

-  Documentation: See `DASHBOARD_GUIDE.md`
-  Issues: Check logs with `docker compose logs -f`
-  Tips: All guides in repository root
-  Troubleshooting: See `DEPLOYMENT.md`

## Success!

You now have a fully functional ML platform with:
- [OK] Interactive web dashboard
- [OK] Real-time monitoring
- [OK] Model management
- [OK] Analytics & insights
- [OK] Docker-based local deployment workflow

Happy predicting!
