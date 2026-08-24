import React, { useState, useEffect } from 'react';
import {
  getRouterMetrics,
  getShadowAnalysis,
  promoteV2,
  rollbackToV1,
  RouterMetrics,
  ShadowAnalysis,
} from '../services/api';
import './ModelManagement.css';

const ModelManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<RouterMetrics | null>(null);
  const [shadowAnalysis, setShadowAnalysis] = useState<ShadowAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsData, shadowData] = await Promise.all([
        getRouterMetrics(),
        getShadowAnalysis(),
      ]);
      setMetrics(metricsData);
      setShadowAnalysis(shadowData);
      setLoading(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch data' });
      setLoading(false);
    }
  };

  const handlePromoteV2 = async () => {
    if (!window.confirm('Are you sure you want to promote v2 to production?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await promoteV2();
      setMessage({ type: 'success', text: result.message });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to promote v2' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Are you sure you want to rollback to v1?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await rollbackToV1();
      setMessage({ type: 'success', text: result.message });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to rollback' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const v1Percentage =
  metrics && metrics.total_requests > 0
    ? ((metrics.v1_requests / metrics.total_requests) * 100).toFixed(1)
    : '0.0';

  const v2Percentage =
    metrics && metrics.total_requests > 0
      ? ((metrics.v2_requests / metrics.total_requests) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="model-management-page">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button className="alert-close" onClick={() => setMessage(null)}>
            ×
          </button>
        </div>
      )}
      <div className="demo-notice">
        <strong>Local deployment demonstration.</strong> Request counts, routing
        strategy, and deployment actions are live for this session. Model metadata
        and deployment history are seeded reference data.
      </div>

      {/* Current Strategy */}
      <div className="card">
        <h3 className="card-title">Current Deployment Strategy</h3>
        <div className="strategy-display">
          <div className="strategy-badge">{metrics?.strategy || 'Unknown'}</div>
          <p className="strategy-description">
            {metrics?.strategy === 'shadow' &&
              'Model v2 runs alongside v1 for comparison without affecting production traffic.'}
            {metrics?.strategy === 'canary' &&
              `Model v2 receives ${(metrics.canary_weight * 100).toFixed(0)}% of production traffic for testing.`}
            {metrics?.strategy === 'blue-green' &&
              'Full traffic switch between model versions for zero-downtime deployment.'}
          </p>
        </div>
      </div>

      {/* Model Comparison */}
      <div className="models-grid">
        <div className="model-card model-v1">
          <div className="model-header">
            <h3 className="model-title">Model v1</h3>
            <span className="model-badge production">Production</span>
          </div>
          <div className="model-stats">
            <div className="stat">
              <div className="stat-label">Requests</div>
              <div className="stat-value">{metrics?.v1_requests.toLocaleString() || '0'}</div>
              <div className="stat-percentage">{v1Percentage}% of traffic</div>
            </div>
            <div className="stat">
              <div className="stat-label">Status</div>
              <div className="stat-value">
                <span className="status-badge healthy">Active</span>
              </div>
            </div>
          </div>
          <div className="model-info">
            <div className="info-row">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Algorithm:</span>
              <span className="info-value">Random Forest</span>
            </div>
            <div className="info-row">
              <span className="info-label">Features:</span>
              <span className="info-value">21</span>
            </div>
            <div className="info-row">
              <span className="info-label">Accuracy:</span>
              <span className="info-value">89.5%</span>
            </div>
          </div>
        </div>

        <div className="model-card model-v2">
          <div className="model-header">
            <h3 className="model-title">Model v2</h3>
            <span className="model-badge candidate">Candidate</span>
          </div>
          <div className="model-stats">
            <div className="stat">
              <div className="stat-label">Requests</div>
              <div className="stat-value">{metrics?.v2_requests.toLocaleString() || '0'}</div>
              <div className="stat-percentage">{v2Percentage}% of traffic</div>
            </div>
            <div className="stat">
              <div className="stat-label">Status</div>
              <div className="stat-value">
                <span className="status-badge info">Shadow</span>
              </div>
            </div>
          </div>
          <div className="model-info">
            <div className="info-row">
              <span className="info-label">Version:</span>
              <span className="info-value">2.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Algorithm:</span>
              <span className="info-value">Gradient Boosting</span>
            </div>
            <div className="info-row">
              <span className="info-label">Features:</span>
              <span className="info-value">21</span>
            </div>
            <div className="info-row">
              <span className="info-label">Accuracy:</span>
              <span className="info-value">91.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shadow Analysis */}
      {shadowAnalysis && shadowAnalysis.total_comparisons > 0 && (
        <div className="card">
          <h3 className="card-title">Shadow Deployment Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-item">
              <div className="analysis-icon">[TEST]</div>
              <div className="analysis-content">
                <div className="analysis-label">Total Comparisons</div>
                <div className="analysis-value">
                  {shadowAnalysis.total_comparisons.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">[OK]</div>
              <div className="analysis-content">
                <div className="analysis-label">Agreement Rate</div>
                <div className="analysis-value">
                  {(shadowAnalysis.agreement_rate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">[DATA]</div>
              <div className="analysis-content">
                <div className="analysis-label">Avg Difference</div>
                <div className="analysis-value">
                  {(shadowAnalysis.avg_difference * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">[TARGET]</div>
              <div className="analysis-content">
                <div className="analysis-label">Correlation</div>
                <div className="analysis-value">{shadowAnalysis.correlation.toFixed(3)}</div>
              </div>
            </div>
          </div>

          <div className="performance-comparison">
            <div className="comparison-bar">
              <div className="bar-label">V1 Better</div>
              <div className="bar-container">
                <div
                  className="bar-fill v1"
                  style={{
                    width: `${
                      (shadowAnalysis.v1_better /
                        (shadowAnalysis.v1_better + shadowAnalysis.v2_better)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="bar-value">{shadowAnalysis.v1_better}</div>
            </div>
            <div className="comparison-bar">
              <div className="bar-label">V2 Better</div>
              <div className="bar-container">
                <div
                  className="bar-fill v2"
                  style={{
                    width: `${
                      (shadowAnalysis.v2_better /
                        (shadowAnalysis.v1_better + shadowAnalysis.v2_better)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="bar-value">{shadowAnalysis.v2_better}</div>
            </div>
          </div>

          {shadowAnalysis.v2_better > shadowAnalysis.v1_better && (
            <div className="alert alert-success">
              Model v2 is showing better performance than v1 in shadow testing. Consider promoting to production.
            </div>
          )}
        </div>
      )}

      {/* Deployment Actions */}
      <div className="card">
        <h3 className="card-title">Deployment Actions</h3>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon" aria-hidden="true">↑</div>
            <h4 className="action-title">Promote v2 to Production</h4>
            <p className="action-description">
              Switch production traffic to model v2. Current v1 will become the backup.
            </p>
            <button
              className="btn btn-success"
              onClick={handlePromoteV2}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Promote v2'}
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon" aria-hidden="true">↶</div>
            <h4 className="action-title">Rollback to v1</h4>
            <p className="action-description">
              Revert production traffic to model v1. Use this if issues are detected with v2.
            </p>
            <button
              className="btn btn-danger"
              onClick={handleRollback}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Rollback to v1'}
            </button>
          </div>
        </div>
      </div>

      {/* Deployment History */}
      <div className="card">
        <h3 className="card-title">Deployment History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Strategy</th>
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2024-01-07 10:00:00</td>
              <td>Switched to Shadow Mode</td>
              <td><span className="strategy-tag shadow">Shadow</span></td>
              <td><span className="status-badge healthy">Success</span></td>
              <td>system</td>
            </tr>
            <tr>
              <td>2024-01-06 15:30:00</td>
              <td>Deployed Model v2</td>
              <td><span className="strategy-tag shadow">Shadow</span></td>
              <td><span className="status-badge healthy">Success</span></td>
              <td>admin</td>
            </tr>
            <tr>
              <td>2024-01-05 09:15:00</td>
              <td>Deployed Model v1</td>
              <td><span className="strategy-tag production">Production</span></td>
              <td><span className="status-badge healthy">Success</span></td>
              <td>admin</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelManagement;
