---
layout: default
title: Documentation
---

# Risk/Churn Scoring Platform Documentation

Welcome to the documentation for the Risk/Churn Scoring Platform, a production-style MLOps reference implementation for customer risk and churn prediction.

## Quick Navigation

### 🚀 Getting Started

<div class="doc-card">
  <h3><a href="QUICK_START">Quick Start Guide</a></h3>
  <p>Get the platform running in under 5 minutes. Perfect for first-time users.</p>
  <ul>
    <li>One-command deployment</li>
    <li>Access dashboard and API</li>
    <li>Run your first prediction</li>
  </ul>
</div>

### 📊 Using the Platform

<div class="doc-card">
  <h3><a href="DASHBOARD_GUIDE">Dashboard Guide</a></h3>
  <p>Complete guide to the web-based monitoring dashboard.</p>
  <ul>
    <li>System status monitoring</li>
    <li>Testing predictions</li>
    <li>Model management</li>
    <li>Drift detection UI</li>
  </ul>
</div>

### 🎲 Data Generation

<div class="doc-card">
  <h3><a href="DATA_GENERATOR">Synthetic Data Generator</a></h3>
  <p>Generate realistic customer data for testing and demonstration.</p>
  <ul>
    <li>Three risk levels (low, medium, high)</li>
    <li>Feature drift simulation</li>
    <li>Customer lifecycle tracking</li>
    <li>Kafka streaming integration</li>
  </ul>
</div>

<div class="doc-card">
  <h3><a href="REAL_DATA_INTEGRATION">Real Data Integration</a></h3>
  <p>Work with the included real e-commerce dataset.</p>
  <ul>
    <li>2.7M real customer events</li>
    <li>Data preprocessing pipeline</li>
    <li>Feature engineering</li>
    <li>Model training on real data</li>
  </ul>
</div>

### 🚢 Deployment

<div class="doc-card">
  <h3><a href="DEPLOYMENT">Deployment Guide</a></h3>
  <p>Explore local and Kubernetes deployment patterns using Docker, Kubernetes, and Seldon Core.</p>
  <ul>
    <li>Docker Compose deployment</li>
    <li>Kubernetes with Seldon Core</li>
    <li>A/B testing strategies</li>
    <li>Monitoring and alerting</li>
  </ul>
</div>

### 📝 Additional Resources

<div class="doc-card">
  <h3><a href="BLOG_POST">Technical Deep Dive</a></h3>
  <p>Comprehensive project overview and technical details.</p>
  <ul>
    <li>Architecture overview</li>
    <li>Design decisions</li>
    <li>Implementation details</li>
    <li>Lessons learned</li>
  </ul>
</div>

## Platform Overview

The Risk/Churn Scoring Platform demonstrates:

- **Churn Prediction**: Predict customer churn risk with ML models
- **A/B Testing**: Shadow deployment, canary releases, blue-green deployment
- **Drift Detection**: Automatic detection of data and model drift
- **Real-time Monitoring**: Dashboards, metrics, and alerts
- **Data Generation**: Synthetic and real data for development and testing

## Key Features

### Interactive Web Dashboard
- Real-time system monitoring
- Live metrics and health status
- Prediction testing interface
- Model management controls
- Drift detection visualization

### Multi-Model Deployment
- Support for multiple model versions
- Intelligent routing (shadow, canary, blue-green)
- Automated rollback capabilities
- Performance comparison

### Data Pipeline
- Synthetic data generator (3 risk levels, drift simulation)
- Real e-commerce dataset (2.7M events)
- Kafka streaming integration
- Feature transformation pipeline

### Operational Tooling
- Docker Compose for local development
- Kubernetes and Seldon Core reference manifests
- Prometheus metrics and Grafana dashboard configuration
- Automated unit, integration, lint, and security checks

## Technology Stack

- **Backend**: FastAPI, Python 3.11+
- **Frontend**: React, Nginx
- **Data**: Kafka, Redis, PostgreSQL
- **Monitoring**: Prometheus, Grafana
- **ML**: scikit-learn, SHAP, Alibi
- **Deployment**: Docker, Kubernetes, Seldon Core

## Quick Links

- [GitHub Repository](https://github.com/jyothsnakanand/risk-churn-platform)
- [API Documentation](http://localhost:8000/docs) (when running locally)
- [Dashboard](http://localhost) (when running locally)
- [Prometheus](http://localhost:9090) (when running locally)
- [Grafana](http://localhost:3000) (when running locally)

## Support

For issues and questions:
- [GitHub Issues](https://github.com/jyothsnakanand/risk-churn-platform/issues)
- [Documentation](https://github.com/jyothsnakanand/risk-churn-platform/tree/main/docs)

---

<style>
.doc-card {
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f6f8fa;
}

.doc-card h3 {
  margin-top: 0;
  color: #0366d6;
}

.doc-card h3 a {
  text-decoration: none;
}

.doc-card h3 a:hover {
  text-decoration: underline;
}

.doc-card ul {
  margin-bottom: 0;
}
</style>
