import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './Monitoring.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DriftEvent {
  timestamp: string;
  feature: string;
  p_value: number;
  severity: 'low' | 'medium' | 'high';
  is_drift: boolean;
}

interface OutlierEvent {
  timestamp: string;
  count: number;
  percentage: number;
}

const Monitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drift' | 'performance' | 'outliers'>('drift');
  const [loading, setLoading] = useState(false);

  // Mock drift events
  const [driftEvents] = useState<DriftEvent[]>([
    {
      timestamp: '2024-01-07 10:30:00',
      feature: 'total_revenue',
      p_value: 0.01,
      severity: 'high',
      is_drift: true,
    },
    {
      timestamp: '2024-01-07 09:15:00',
      feature: 'order_frequency',
      p_value: 0.03,
      severity: 'medium',
      is_drift: true,
    },
    {
      timestamp: '2024-01-07 08:00:00',
      feature: 'cart_abandonment_rate',
      p_value: 0.08,
      severity: 'low',
      is_drift: false,
    },
  ]);

  // Feature drift chart
  const driftChartData = {
    labels: [
      'total_revenue',
      'order_frequency',
      'avg_order_value',
      'days_since_last_order',
      'website_visits_30d',
    ],
    datasets: [
      {
        label: 'P-Value',
        data: [0.01, 0.03, 0.12, 0.08, 0.15],
        backgroundColor: (context: any) => {
          const value = context.raw;
          if (value < 0.05) return 'rgba(245, 101, 101, 0.8)';
          if (value < 0.1) return 'rgba(236, 201, 75, 0.8)';
          return 'rgba(72, 187, 120, 0.8)';
        },
        borderColor: (context: any) => {
          const value = context.raw;
          if (value < 0.05) return 'rgb(245, 101, 101)';
          if (value < 0.1) return 'rgb(236, 201, 75)';
          return 'rgb(72, 187, 120)';
        },
        borderWidth: 1,
      },
    ],
  };

  // Model performance over time
  const performanceData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Accuracy',
        data: Array.from({ length: 24 }, () => 0.88 + Math.random() * 0.08),
        borderColor: 'rgb(66, 153, 225)',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Precision',
        data: Array.from({ length: 24 }, () => 0.85 + Math.random() * 0.1),
        borderColor: 'rgb(159, 122, 234)',
        backgroundColor: 'rgba(159, 122, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Recall',
        data: Array.from({ length: 24 }, () => 0.86 + Math.random() * 0.08),
        borderColor: 'rgb(72, 187, 120)',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Latency distribution
  const latencyData = {
    labels: ['0-5ms', '5-10ms', '10-15ms', '15-20ms', '20-25ms', '>25ms'],
    datasets: [
      {
        label: 'Request Count',
        data: [320, 580, 420, 180, 80, 20],
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
        borderColor: 'rgb(66, 153, 225)',
        borderWidth: 1,
      },
    ],
  };

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#f56565';
      case 'medium':
        return '#ecc94b';
      case 'low':
        return '#48bb78';
      default:
        return '#cbd5e0';
    }
  };

  return (
    <div className="monitoring-page">
      <div className="simulation-notice">
        <strong>Simulated monitoring data.</strong> This view demonstrates drift
        detection, model performance, and outlier-monitoring workflows using a
        seeded dataset.
      </div>
      {/* Health Overview */}
      <div className="health-overview">
        <div className="health-card">
          <div className="health-icon healthy" aria-hidden="true">✓</div>
          <div className="health-info">
            <div className="health-label">Model Health</div>
            <div className="health-status">Healthy</div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon warning" aria-hidden="true">!</div>
          <div className="health-info">
            <div className="health-label">Active Drift Alerts</div>
            <div className="health-status">2</div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon info" aria-hidden="true">↗</div>
          <div className="health-info">
            <div className="health-label">Avg Latency</div>
            <div className="health-status">12.4ms</div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-icon healthy" aria-hidden="true">◎</div>
          <div className="health-info">
            <div className="health-label">Prediction Accuracy</div>
            <div className="health-status">91.2%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="monitoring-tabs">
        <button
          className={`tab-btn ${activeTab === 'drift' ? 'active' : ''}`}
          onClick={() => setActiveTab('drift')}
        >
          Drift Detection
        </button>
        <button
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Metrics
        </button>
        <button
          className={`tab-btn ${activeTab === 'outliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliers')}
        >
          Outlier Detection
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'drift' && (
          <div className="drift-tab">
            <div className="card">
              <div className="card-title">Feature Drift Analysis</div>
              <div className="chart-container">
                <Bar data={driftChartData} options={chartOptions} />
              </div>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{ background: '#f56565' }}></span>
                  High Risk (p &lt; 0.05)
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ background: '#ecc94b' }}></span>
                  Warning (p &lt; 0.1)
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{ background: '#48bb78' }}></span>
                  Normal
                </span>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Recent Drift Events</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Feature</th>
                    <th>P-Value</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {driftEvents.map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.timestamp}</td>
                      <td><code>{event.feature}</code></td>
                      <td>{event.p_value.toFixed(3)}</td>
                      <td>
                        <span
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(event.severity) }}
                        >
                          {event.severity}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            event.is_drift ? 'error' : 'healthy'
                          }`}
                        >
                          {event.is_drift ? 'Drift Detected' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-tab">
            <div className="card">
              <div className="card-title">Model Performance Over Time</div>
              <div className="chart-container-large">
                <Line data={performanceData} options={chartOptions} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">Prediction Latency Distribution</div>
              <div className="chart-container">
                <Bar data={latencyData} options={chartOptions} />
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-box">
                <div className="metric-label">P50 Latency</div>
                <div className="metric-value">8.2ms</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">P95 Latency</div>
                <div className="metric-value">18.5ms</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">P99 Latency</div>
                <div className="metric-value">24.8ms</div>
              </div>
              <div className="metric-box">
                <div className="metric-label">Error Rate</div>
                <div className="metric-value">0.02%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outliers' && (
          <div className="outliers-tab">
            <div className="card">
              <div className="card-title">Outlier Detection Status</div>
              <div className="outlier-summary">
                <div className="outlier-stat">
                  <div className="outlier-label">Total Requests Analyzed</div>
                  <div className="outlier-value">24,582</div>
                </div>
                <div className="outlier-stat">
                  <div className="outlier-label">Outliers Detected</div>
                  <div className="outlier-value">127</div>
                </div>
                <div className="outlier-stat">
                  <div className="outlier-label">Outlier Rate</div>
                  <div className="outlier-value">0.52%</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Recent Outlier Events</div>
              <div className="alert alert-info">
                Outlier detection helps identify unusual prediction requests that may indicate data quality issues or adversarial inputs.
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Request ID</th>
                    <th>Anomaly Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-01-07 10:45:12</td>
                    <td><code>req-8a7f2c3d</code></td>
                    <td>0.92</td>
                    <td><span className="status-badge error">High Anomaly</span></td>
                  </tr>
                  <tr>
                    <td>2024-01-07 10:32:45</td>
                    <td><code>req-3b9e1f7a</code></td>
                    <td>0.78</td>
                    <td><span className="status-badge warning">Medium Anomaly</span></td>
                  </tr>
                  <tr>
                    <td>2024-01-07 10:15:33</td>
                    <td><code>req-5c2d8e4b</code></td>
                    <td>0.65</td>
                    <td><span className="status-badge warning">Medium Anomaly</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
