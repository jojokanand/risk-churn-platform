# Risk/Churn Scoring Platform

[![CI/CD Pipeline](https://github.com/jojokanand/risk-churn-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jojokanand/risk-churn-platform/actions/workflows/ci.yml)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code style: Black](https://img.shields.io/badge/code%20style-Black-000000.svg)](https://github.com/psf/black)

A production-style MLOps platform for risk and churn prediction, demonstrating model routing, drift detection, monitoring, and automated retraining with Seldon Core.

## Features

### Interactive Web Dashboard
- **Real-time Monitoring**: Live metrics, health status, and system performance
- **Drift Detection UI**: Visual feature drift analysis with p-value tracking
- **Prediction Testing**: Interactive interface to test churn predictions
- **Model Management**: Deploy, promote, and rollback models with one click
- **Analytics Dashboard**: Customer segments, feature importance, and insights
- **Responsive Design**: Works on desktop, tablet, and mobile

### Core Capabilities
- **Multi-Model Deployment**: Support for multiple model versions (v1, v2) with intelligent routing
- **REST & gRPC APIs**: V2 protocol support for high-performance inference
- **Feature Transformation Pipeline**: Automated preprocessing and feature engineering
- **Model Explainability**: SHAP and Alibi-based explanations for predictions

### Deployment Strategies
- **Shadow Deployment**: Run v2 alongside v1 without affecting production traffic
- **Canary Releases**: Gradually roll out new models with configurable traffic splitting
- **Blue-Green Deployment**: Instant switchover between model versions
- **Automated Rollback**: Quick reversion to previous version if issues detected

### Monitoring & Quality Assurance
- **Drift Detection**: Statistical drift detection using Alibi Detect (KS, MMD, Tabular)
- **Outlier Detection**: Isolation Forest and Mahalanobis distance-based outlier detection
- **Prometheus Metrics**: Comprehensive metrics for latency, throughput, and model performance
- **Grafana Dashboards**: Pre-built dashboards for visualization
- **Alerting System**: Configurable alerts for drift, outliers, and performance degradation

### Async Processing & Retraining
- **Kafka Integration**: Async mirroring of requests for offline evaluation
- **Feedback Loop**: Collect ground truth labels for continuous learning
- **Automated Retraining**: Scheduled or trigger-based model retraining
- **Performance Validation**: Automatic quality gates before deployment

## Architecture

```mermaid
graph TD
    A[Ingress REST/gRPC] --> B[Feature Transformer]
    B --> C[Model Router]

    C --> C1[Shadow Strategy]
    C --> C2[Canary Strategy]
    C --> C3[Blue-Green Strategy]

    C1 --> D1[Model v1]
    C1 --> D2[Model v2]
    C2 --> D1
    C2 --> D2
    C3 --> D1
    C3 --> D2

    D1 --> E[Explainer SHAP]
    D2 --> E

    E --> F[Kafka Event Stream<br/>predictions, drift, etc]

    F --> G1[Drift Detector]
    F --> G2[Outlier Detector]

    G1 --> H[Alert Manager]
    G2 --> H

    H --> I[Retraining Loop]

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D1 fill:#e8f5e9
    style D2 fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fff9c4
    style G1 fill:#ffebee
    style G2 fill:#ffebee
    style H fill:#fce4ec
    style I fill:#e0f2f1
```

## Quick Start

**For detailed guides, see the [docs](docs/) folder:**
- [Quick Start Guide](docs/QUICK_START.md) - Get running in 5 minutes
- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment instructions
- [Dashboard Guide](docs/DASHBOARD_GUIDE.md) - Web UI user manual
- [Data Generator Guide](docs/DATA_GENERATOR.md) - Synthetic data generation
- [Real Data Integration](docs/REAL_DATA_INTEGRATION.md) - Using real e-commerce dataset
- [Blog Post](docs/BLOG_POST.md) - Project story and technical deep dive

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Kubernetes cluster (for production)
- uv (Python package installer)

### Local Development

1. **Clone and setup**:
```bash
git clone https://github.com/jojokanand/risk-churn-platform.git
cd risk-churn-platform
```

2. **Install dependencies**:
```bash
# Create virtual environment
uv venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows

# Install dependencies
uv pip install -e ".[dev]"
```

3. **Install pre-commit hooks**:
```bash
pre-commit install
```

4. **Start full platform with Docker Compose**:
```bash
docker-compose up -d
```

This starts:
- **Frontend Dashboard** (http://localhost)
- **Backend API** (http://localhost:8000)
- Kafka & Zookeeper
- Redis
- Prometheus & Grafana
- API service

5. **Run tests**:
```bash
pytest tests/ -v --cov=src
```

### Making Predictions

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "customer_age_days": 730,
    "account_age_days": 365,
    "total_orders": 15,
    "total_revenue": 1250.50,
    "avg_order_value": 83.37,
    "days_since_last_order": 45,
    "order_frequency": 0.5,
    "website_visits_30d": 8,
    "email_open_rate": 0.35,
    "cart_abandonment_rate": 0.45,
    "product_views_30d": 25,
    "support_tickets_total": 2,
    "support_tickets_open": 0,
    "returns_count": 1,
    "refunds_count": 0,
    "favorite_category": "Electronics",
    "discount_usage_rate": 0.40,
    "premium_product_rate": 0.25,
    "payment_method": "Credit Card",
    "shipping_method": "Standard",
    "failed_payment_count": 0
  }'
```

### Get Explanation

```bash
curl -X POST http://localhost:8000/explain \
  -H "Content-Type: application/json" \
  -d '{
    "customer_age_days": 730,
    "account_age_days": 365,
    "total_orders": 15,
    "total_revenue": 1250.50,
    "avg_order_value": 83.37,
    "days_since_last_order": 45,
    "order_frequency": 0.5,
    "website_visits_30d": 8,
    "email_open_rate": 0.35,
    "cart_abandonment_rate": 0.45,
    "product_views_30d": 25,
    "support_tickets_total": 2,
    "support_tickets_open": 0,
    "returns_count": 1,
    "refunds_count": 0,
    "favorite_category": "Electronics",
    "discount_usage_rate": 0.40,
    "premium_product_rate": 0.25,
    "payment_method": "Credit Card",
    "shipping_method": "Standard",
    "failed_payment_count": 0
  }'
```

## Deployment

### Kubernetes with Seldon Core

1. **Install Seldon Core**:
```bash
kubectl create namespace seldon-system
kubectl apply -f https://github.com/SeldonIO/seldon-core/releases/download/v1.18.0/seldon-core.yaml
```

2. **Create namespace and deploy infrastructure**:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/kafka-deployment.yaml
kubectl apply -f k8s/monitoring-deployment.yaml
```

3. **Deploy model with shadow mode** (for initial testing):
```bash
kubectl apply -f k8s/seldon-deployment-shadow.yaml
```

4. **After validation, switch to canary**:
```bash
kubectl apply -f k8s/seldon-deployment-canary.yaml
```

5. **Deploy monitoring services**:
```bash
kubectl apply -f k8s/drift-detector-deployment.yaml
```

### Release Strategy

#### Phase 1: Shadow Deployment (Week 1-2)
- Deploy v2 in shadow mode
- v1 serves all production traffic
- v2 runs in parallel, predictions logged but not returned
- Monitor prediction differences and performance

```bash
# Check shadow analysis
curl http://localhost:8000/router/shadow-analysis
```

#### Phase 2: Canary Release (Week 3-4)
- Start with 10% traffic to v2
- Monitor metrics, error rates, latency
- Gradually increase to 25%, 50%, 75%

```bash
# Current metrics
curl http://localhost:8000/router/metrics
```

#### Phase 3: Full Rollout
- If all metrics are good, promote v2 to 100%

```bash
curl -X POST http://localhost:8000/router/promote-v2
```

#### Emergency Rollback
```bash
curl -X POST http://localhost:8000/router/rollback
```

## Configuration

Configuration is managed in [config/config.yaml](config/config.yaml). Key settings:

```yaml
router:
  strategy: "shadow"  # shadow, canary, blue-green
  canary_weight: 0.1  # 10% traffic to v2

monitoring:
  drift_detection:
    enabled: true
    threshold: 0.05

  outlier_detection:
    enabled: true
    contamination: 0.1

retraining:
  enabled: true
  schedule: "0 2 * * 0"  # Weekly at 2 AM
  min_samples: 10000
  performance_threshold: 0.85
```

## Monitoring

### Prometheus Metrics
- `predictions_total`: Total predictions by model version and status
- `prediction_latency_seconds`: Prediction latency histogram
- `drift_detected_total`: Drift detection events
- `outliers_detected_total`: Outlier detection events

### Grafana Dashboards

Access Grafana at `http://localhost:3000` (default credentials: admin/admin)

Pre-built dashboards include:
- Model Performance Overview
- Drift Detection Metrics
- Traffic Distribution (Canary)
- Shadow Deployment Analysis

### Kafka Topics

- `ml.predictions`: All prediction events
- `ml.drift-alerts`: Drift detection alerts
- `ml.outliers`: Outlier detection events
- `ml.feedback`: Ground truth labels for retraining

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_models.py -v

# Run integration tests
pytest tests/integration/ -v
```

## Retraining

The platform supports automated retraining:

1. **Feedback Collection**: Ground truth labels collected via Kafka
2. **Performance Monitoring**: Track model degradation over time
3. **Automated Trigger**: Retraining triggered when:
   - Sufficient feedback samples collected (min_samples)
   - Performance drops below threshold
   - Manual trigger via API

4. **Quality Gates**: New models deployed only if they meet performance threshold

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and pre-commit hooks
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Support

For questions, bug reports, or feature requests, open a [GitHub issue](https://github.com/jojokanand/risk-churn-platform/issues). Additional guides are available in the [`docs/`](docs/) directory.
