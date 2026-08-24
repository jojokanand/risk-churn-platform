#!/bin/bash

# Risk Churn Platform - Deployment Script
# This script deploys the full platform including frontend dashboard

set -e  # Exit on error

echo "Risk Churn Platform - Deployment Script"
echo "==========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

echo "[OK] Docker is running"
echo ""

# Check if Docker Compose is available
if ! docker compose version > /dev/null 2>&1; then
    echo "[ERROR] Docker Compose is not available"
    echo "   Install or update Docker Desktop and try again"
    exit 1
fi

echo "[OK] Docker Compose is available"

echo ""

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start all services
echo ""
echo "Building and starting services..."
echo "   This may take a few minutes on first run..."
echo ""

docker compose up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
echo "==================="
docker compose ps

# Display access URLs
echo ""
echo "Deployment Complete!"
echo "======================="
echo ""
echo "Access URLs:"
echo "   * Frontend Dashboard: http://localhost"
echo "   * Backend API:        http://localhost:8000"
echo "   * API Documentation:  http://localhost:8000/docs"
echo "   * Prometheus:         http://localhost:9090"
echo "   * Grafana:            http://localhost:3000 (admin/admin)"
echo ""
echo "Quick Commands:"
echo "   * View logs:        docker compose logs -f"
echo "   * View API logs:    docker compose logs -f api"
echo "   * View frontend:    docker compose logs -f frontend"
echo "   * Stop services:    docker compose down"
echo "   * Restart:          docker compose restart"
echo ""
echo "Next Steps:"
echo "   1. Open http://localhost in your browser"
echo "   2. Explore the dashboard features"
echo "   3. Test predictions with sample data"
echo "   4. Monitor system health"
echo ""
