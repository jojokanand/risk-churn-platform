import React, { useState } from 'react';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Churn distribution
  const churnDistributionData = {
    labels: ['Low Risk (0-40)', 'Medium Risk (40-70)', 'High Risk (70-100)'],
    datasets: [
      {
        data: [62, 28, 10],
        backgroundColor: ['#48bb78', '#ecc94b', '#f56565'],
        borderColor: ['#38a169', '#d69e2e', '#e53e3e'],
        borderWidth: 2,
      },
    ],
  };

  // Feature importance
  const featureImportanceData = {
    labels: [
      'days_since_last_order',
      'total_revenue',
      'order_frequency',
      'email_open_rate',
      'cart_abandonment_rate',
      'website_visits_30d',
      'total_orders',
    ],
    datasets: [
      {
        label: 'Importance Score',
        data: [0.18, 0.15, 0.13, 0.11, 0.10, 0.09, 0.08],
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
        borderColor: 'rgb(66, 153, 225)',
        borderWidth: 1,
      },
    ],
  };

  // Category distribution
  const categoryData = {
    labels: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Other'],
    datasets: [
      {
        data: [32, 24, 18, 12, 9, 5],
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#00f2fe',
          '#43e97b',
        ],
      },
    ],
  };

  // Payment method distribution
  const paymentData = {
    labels: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'],
    datasets: [
      {
        data: [52, 28, 15, 5],
        backgroundColor: ['#4299e1', '#9f7aea', '#ed8936', '#48bb78'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="analytics-page">
      <div className="analytics-notice">
        <strong>Simulated analytics dataset.</strong> These insights and charts
        demonstrate the reporting workflow using seeded customer and prediction
        data. Time-range controls illustrate the available analysis views.
      </div>
      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button
          className={`range-btn ${timeRange === '24h' ? 'active' : ''}`}
          onClick={() => setTimeRange('24h')}
        >
          Last 24 Hours
        </button>
        <button
          className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
          onClick={() => setTimeRange('7d')}
        >
          Last 7 Days
        </button>
        <button
          className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
          onClick={() => setTimeRange('30d')}
        >
          Last 30 Days
        </button>
      </div>

      {/* Key Insights */}
      <div className="insights-section">
        <h3 className="section-title">Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon" aria-hidden="true">!</div>
            <div className="insight-content">
              <h4 className="insight-title">High Risk Customers</h4>
              <p className="insight-value">10%</p>
              <p className="insight-description">
                247 customers identified with high churn risk
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" aria-hidden="true">↘</div>
            <div className="insight-content">
              <h4 className="insight-title">Engagement Decline</h4>
              <p className="insight-value">↓ 15%</p>
              <p className="insight-description">
                Website visits decreased compared to last period
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" aria-hidden="true">◎</div>
            <div className="insight-content">
              <h4 className="insight-title">Top Retention Factor</h4>
              <p className="insight-value">Order Recency</p>
              <p className="insight-description">
                Days since last order is the strongest predictor
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" aria-hidden="true">$</div>
            <div className="insight-content">
              <h4 className="insight-title">Revenue at Risk</h4>
              <p className="insight-value">$127K</p>
              <p className="insight-description">
                Potential revenue loss from high-risk customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-section">
        <div className="charts-grid-analytics">
          <div className="card chart-card">
            <h3 className="card-title">Churn Risk Distribution</h3>
            <div className="chart-container">
              <Pie data={churnDistributionData} options={chartOptions} />
            </div>
            <div className="chart-summary">
              <p>Majority of customers (62%) are in the low-risk category</p>
            </div>
          </div>

          <div className="card chart-card">
            <h3 className="card-title">Feature Importance</h3>
            <div className="chart-container">
              <Bar
                data={featureImportanceData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                  scales: { x: { beginAtZero: true, max: 0.2 } },
                }}
              />
            </div>
            <div className="chart-summary">
              <p>Days since last order has the highest impact on predictions</p>
            </div>
          </div>

          <div className="card chart-card">
            <h3 className="card-title">Customer Categories</h3>
            <div className="chart-container">
              <Doughnut data={categoryData} options={chartOptions} />
            </div>
            <div className="chart-summary">
              <p>Electronics is the most popular category (32%)</p>
            </div>
          </div>

          <div className="card chart-card">
            <h3 className="card-title">Payment Methods</h3>
            <div className="chart-container">
              <Doughnut data={paymentData} options={chartOptions} />
            </div>
            <div className="chart-summary">
              <p>Credit cards are the preferred payment method (52%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="card">
        <h3 className="card-title">Customer Segments Analysis</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Count</th>
              <th>Avg Revenue</th>
              <th>Churn Rate</th>
              <th>Retention Strategy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Champions</strong></td>
              <td>420</td>
              <td>$2,450</td>
              <td><span className="status-badge healthy">5%</span></td>
              <td>Reward loyalty, upsell premium products</td>
            </tr>
            <tr>
              <td><strong>Loyal Customers</strong></td>
              <td>680</td>
              <td>$1,820</td>
              <td><span className="status-badge healthy">8%</span></td>
              <td>Exclusive offers, early access</td>
            </tr>
            <tr>
              <td><strong>At Risk</strong></td>
              <td>340</td>
              <td>$980</td>
              <td><span className="status-badge warning">35%</span></td>
              <td>Win-back campaigns, personalized discounts</td>
            </tr>
            <tr>
              <td><strong>Hibernating</strong></td>
              <td>180</td>
              <td>$520</td>
              <td><span className="status-badge error">72%</span></td>
              <td>Re-activation offers, product recommendations</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Top At-Risk Customers */}
      <div className="card">
        <h3 className="card-title">Top 10 At-Risk Customers</h3>
        <p className="card-description">
          Customers with the highest churn probability requiring immediate attention
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Risk Score</th>
              <th>Revenue (LTV)</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i}>
                <td><code>CUST-{1000 + i}</code></td>
                <td>
                  <div className="risk-score-mini" style={{
                    backgroundColor: `rgba(245, 101, 101, ${0.3 + i * 0.05})`
                  }}>
                    {(95 - i * 2).toFixed(1)}
                  </div>
                </td>
                <td>${(2500 - i * 150).toLocaleString()}</td>
                <td>{90 + i * 5} days ago</td>
                <td>
                  <button className="btn-action">Contact</button>
                  <button className="btn-action">Offer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
