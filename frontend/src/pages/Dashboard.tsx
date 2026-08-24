import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  healthCheck,
  getRouterMetrics,
  getShadowAnalysis,
  HealthResponse,
  RouterMetrics,
  ShadowAnalysis,
} from '../services/api';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<RouterMetrics | null>(null);
  const [shadowAnalysis, setShadowAnalysis] = useState<ShadowAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated chart data for the local demonstration
  const [predictionData, setPredictionData] = useState({
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
    datasets: [
      {
        label: 'Predictions/min',
        data: [45, 52, 48, 61, 55, 58, 63],
        borderColor: 'rgb(66, 153, 225)',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const [accuracyData, setAccuracyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Model v1',
        data: [0.89, 0.91, 0.88, 0.92, 0.90, 0.89, 0.91],
        borderColor: 'rgb(72, 187, 120)',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Model v2',
        data: [0.90, 0.92, 0.91, 0.93, 0.92, 0.91, 0.93],
        borderColor: 'rgb(159, 122, 234)',
        backgroundColor: 'rgba(159, 122, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [healthData, metricsData, shadowData] = await Promise.all([
        healthCheck(),
        getRouterMetrics(),
        getShadowAnalysis(),
      ]);

      setHealth(healthData);
      setMetrics(metricsData);
      setShadowAnalysis(shadowData);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  const agreementRate =
  shadowAnalysis &&
  Number.isFinite(shadowAnalysis.agreement_rate) &&
  (shadowAnalysis.total_comparisons ?? 0) > 0
    ? `${(shadowAnalysis.agreement_rate * 100).toFixed(1)}%`
    : 'N/A';

  return (
    <div className="dashboard-page">
      {/* System Status */}
      <div className="status-section">
        <h3 className="section-title">System Status</h3>
        <div className="status-grid">
          <div className="status-card">
            <div className="status-icon healthy" aria-hidden="true">✓</div>
            <div className="status-content">
              <div className="status-label">Platform Status</div>
              <div className="status-value">{health?.status || 'Unknown'}</div>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon healthy" aria-hidden="true">✓</div>
            <div className="status-content">
              <div className="status-label">Model v1</div>
              <div className="status-value">
                {health?.models.v1 ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon healthy" aria-hidden="true">✓</div>
            <div className="status-content">
              <div className="status-label">Model v2</div>
              <div className="status-value">
                {health?.models.v2 ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon info" aria-hidden="true">⇄</div>
            <div className="status-content">
              <div className="status-label">Routing Strategy</div>
              <div className="status-value">{metrics?.strategy || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <h3 className="section-title">Key Metrics</h3>
        <div className="card-grid">
          <div className="metric-card">
            <div className="metric-label">Total Requests</div>
            <div className="metric-value">
              {metrics?.total_requests.toLocaleString() || '0'}
            </div>
            <div className="metric-change neutral">
              {(metrics?.total_requests ?? 0) > 0
                ? 'Requests processed since startup'
                : 'No requests recorded yet'}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Model Agreement Rate</div>
            <div className="metric-value">
              {agreementRate}
            </div>
            <div className="metric-change neutral">
              {shadowAnalysis?.total_comparisons || 0} comparisons
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Model v1 Requests</div>
            <div className="metric-value">
              {(metrics?.v1_requests ?? 0).toLocaleString()}
            </div>
            <div className="metric-change neutral">Primary-model traffic</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Model v2 Requests</div>
            <div className="metric-value">
              {(metrics?.v2_requests ?? 0).toLocaleString()}
            </div>
            <div className="metric-change neutral">Candidate-model traffic</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="charts-grid">
          <div className="card chart-card">
            <div className="card-title">Simulated Prediction Volume</div>
            <div className="chart-container">
              <Line data={predictionData} options={chartOptions} />
            </div>
          </div>

          <div className="card chart-card">
            <div className="card-title">Simulated Model Performance</div>
            <div className="chart-container">
              <Line data={accuracyData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison */}
      {shadowAnalysis && shadowAnalysis.total_comparisons > 0 && shadowAnalysis.total_comparisons !== undefined && (
        <div className="comparison-section">
          <h3 className="section-title">Shadow Deployment Analysis</h3>
          <div className="card">
            <div className="comparison-grid">
              <div className="comparison-item">
                <div className="comparison-label">Total Comparisons</div>
                <div className="comparison-value">
                  {shadowAnalysis.total_comparisons.toLocaleString()}
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-label">Avg Difference</div>
                <div className="comparison-value">
                  {(shadowAnalysis.avg_difference * 100).toFixed(2)}%
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-label">Correlation</div>
                <div className="comparison-value">
                  {shadowAnalysis.correlation.toFixed(3)}
                </div>
              </div>
              <div className="comparison-item">
                <div className="comparison-label">V2 Performance</div>
                <div className="comparison-value">
                  {shadowAnalysis.v2_better > shadowAnalysis.v1_better ? (
                    <span className="positive">Better</span>
                  ) : (
                    <span className="neutral">Similar</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Activity Feed */}
      <div className="activity-section">
        <h3 className="section-title">Simulated Activity Feed</h3>
        <div className="card">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon" aria-hidden="true">!</div>
              <div className="activity-content">
                <div className="activity-title">High-risk prediction detected</div>
                <div className="activity-time">2 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" aria-hidden="true">✓</div>
              <div className="activity-content">
                <div className="activity-title">Model v2 performing well</div>
                <div className="activity-time">15 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" aria-hidden="true">≡</div>
              <div className="activity-content">
                <div className="activity-title">Daily metrics report generated</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
