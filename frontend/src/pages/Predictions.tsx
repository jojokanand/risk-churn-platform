import React, { useState } from 'react';
import { makePrediction, PredictionRequest, PredictionResponse } from '../services/api';
import './Predictions.css';

const Predictions: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    customer_age_days: 365,
    account_age_days: 400,
    total_orders: 15,
    total_revenue: 1500.0,
    avg_order_value: 100.0,
    days_since_last_order: 30,
    order_frequency: 1.5,
    website_visits_30d: 25,
    email_open_rate: 0.65,
    cart_abandonment_rate: 0.25,
    product_views_30d: 50,
    support_tickets_total: 2,
    support_tickets_open: 0,
    returns_count: 1,
    refunds_count: 0,
    favorite_category: 'Electronics',
    discount_usage_rate: 0.40,
    premium_product_rate: 0.30,
    payment_method: 'Credit Card',
    shipping_method: 'Standard',
    failed_payment_count: 0,
  });

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.includes('.') ? parseFloat(value) : parseInt(value, 10) || value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await makePrediction(formData);
      setPrediction(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = (scenario: 'high-risk' | 'medium-risk' | 'low-risk') => {
    if (scenario === 'high-risk') {
      setFormData({
        customer_age_days: 90,
        account_age_days: 100,
        total_orders: 2,
        total_revenue: 150.0,
        avg_order_value: 75.0,
        days_since_last_order: 120,
        order_frequency: 0.2,
        website_visits_30d: 2,
        email_open_rate: 0.15,
        cart_abandonment_rate: 0.85,
        product_views_30d: 5,
        support_tickets_total: 5,
        support_tickets_open: 2,
        returns_count: 3,
        refunds_count: 2,
        favorite_category: 'Other',
        discount_usage_rate: 0.90,
        premium_product_rate: 0.05,
        payment_method: 'Debit Card',
        shipping_method: 'Standard',
        failed_payment_count: 3,
      });
    } else if (scenario === 'medium-risk') {
      setFormData({
        customer_age_days: 180,
        account_age_days: 200,
        total_orders: 8,
        total_revenue: 800.0,
        avg_order_value: 100.0,
        days_since_last_order: 45,
        order_frequency: 0.8,
        website_visits_30d: 12,
        email_open_rate: 0.45,
        cart_abandonment_rate: 0.45,
        product_views_30d: 25,
        support_tickets_total: 2,
        support_tickets_open: 0,
        returns_count: 1,
        refunds_count: 0,
        favorite_category: 'Clothing',
        discount_usage_rate: 0.60,
        premium_product_rate: 0.20,
        payment_method: 'Credit Card',
        shipping_method: 'Express',
        failed_payment_count: 1,
      });
    } else {
      setFormData({
        customer_age_days: 730,
        account_age_days: 800,
        total_orders: 45,
        total_revenue: 6500.0,
        avg_order_value: 144.4,
        days_since_last_order: 7,
        order_frequency: 3.5,
        website_visits_30d: 40,
        email_open_rate: 0.85,
        cart_abandonment_rate: 0.15,
        product_views_30d: 80,
        support_tickets_total: 1,
        support_tickets_open: 0,
        returns_count: 0,
        refunds_count: 0,
        favorite_category: 'Electronics',
        discount_usage_rate: 0.25,
        premium_product_rate: 0.65,
        payment_method: 'Credit Card',
        shipping_method: 'Express',
        failed_payment_count: 0,
      });
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: '#f56565' };
    if (score >= 40) return { level: 'Medium', color: '#ecc94b' };
    return { level: 'Low', color: '#48bb78' };
  };

  return (
    <div className="predictions-page">
      <div className="page-header">
        <h2 className="page-title">Test Predictions</h2>
        <div className="sample-buttons">
          <button className="btn btn-secondary" onClick={() => loadSampleData('low-risk')}>
            Load Low Risk Sample
          </button>
          <button className="btn btn-secondary" onClick={() => loadSampleData('medium-risk')}>
            Load Medium Risk Sample
          </button>
          <button className="btn btn-secondary" onClick={() => loadSampleData('high-risk')}>
            Load High Risk Sample
          </button>
        </div>
      </div>

      <div className="predictions-grid">
        {/* Input Form */}
        <div className="card form-card">
          <h3 className="card-title">Customer Information</h3>
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-section">
              <h4 className="form-section-title">Customer Demographics & Tenure</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Age (days)</label>
                  <input
                    type="number"
                    name="customer_age_days"
                    value={formData.customer_age_days}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Age (days)</label>
                  <input
                    type="number"
                    name="account_age_days"
                    value={formData.account_age_days}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Purchase Behavior</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Orders</label>
                  <input
                    type="number"
                    name="total_orders"
                    value={formData.total_orders}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Revenue ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_revenue"
                    value={formData.total_revenue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Avg Order Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="avg_order_value"
                    value={formData.avg_order_value}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Days Since Last Order</label>
                  <input
                    type="number"
                    name="days_since_last_order"
                    value={formData.days_since_last_order}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Order Frequency (per month)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="order_frequency"
                    value={formData.order_frequency}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Engagement Metrics</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Website Visits (30d)</label>
                  <input
                    type="number"
                    name="website_visits_30d"
                    value={formData.website_visits_30d}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Open Rate (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="email_open_rate"
                    value={formData.email_open_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cart Abandonment Rate (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cart_abandonment_rate"
                    value={formData.cart_abandonment_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Product Views (30d)</label>
                  <input
                    type="number"
                    name="product_views_30d"
                    value={formData.product_views_30d}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Customer Service</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Support Tickets</label>
                  <input
                    type="number"
                    name="support_tickets_total"
                    value={formData.support_tickets_total}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Open Support Tickets</label>
                  <input
                    type="number"
                    name="support_tickets_open"
                    value={formData.support_tickets_open}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Returns Count</label>
                  <input
                    type="number"
                    name="returns_count"
                    value={formData.returns_count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Refunds Count</label>
                  <input
                    type="number"
                    name="refunds_count"
                    value={formData.refunds_count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Product & Payment Preferences</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Favorite Category</label>
                  <select
                    name="favorite_category"
                    value={formData.favorite_category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Books">Books</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Usage Rate (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="discount_usage_rate"
                    value={formData.discount_usage_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Premium Product Rate (0-1)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="premium_product_rate"
                    value={formData.premium_product_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shipping Method</label>
                  <select
                    name="shipping_method"
                    value={formData.shipping_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Overnight">Overnight</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Failed Payment Count</label>
                  <input
                    type="number"
                    name="failed_payment_count"
                    value={formData.failed_payment_count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Predicting...' : 'Get Prediction'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="results-section">
          {error && (
            <div className="alert alert-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {prediction && (
            <>
              <div className="card result-card">
                <h3 className="card-title">Prediction Result</h3>
                <div className="result-main">
                  <div className="risk-score-display">
                    <div className="risk-score-label">Churn Risk Score</div>
                    <div
                      className="risk-score-value"
                      style={{ color: getRiskLevel(prediction.risk_score).color }}
                    >
                      {prediction.risk_score.toFixed(1)}
                    </div>
                    <div
                      className="risk-level"
                      style={{ backgroundColor: getRiskLevel(prediction.risk_score).color }}
                    >
                      {getRiskLevel(prediction.risk_score).level} Risk
                    </div>
                  </div>

                  <div className="result-details">
                    <div className="result-item">
                      <span className="result-label">Churn Probability:</span>
                      <span className="result-value">
                        {(prediction.churn_probability * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Model Version:</span>
                      <span className="result-value">{prediction.model_version}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Routing Strategy:</span>
                      <span className="result-value">{prediction.strategy}</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Latency:</span>
                      <span className="result-value">{prediction.latency_ms.toFixed(2)}ms</span>
                    </div>
                    <div className="result-item">
                      <span className="result-label">Request ID:</span>
                      <span className="result-value">
                        <code>{prediction.request_id.substring(0, 8)}...</code>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card recommendations-card">
                <h3 className="card-title">Recommendations</h3>
                <div className="recommendations-list">
                  {prediction.risk_score >= 70 && (
                    <>
                      <div className="recommendation-item high">
                        <span className="recommendation-icon">[WARN]️</span>
                        <div className="recommendation-text">
                          <strong>Immediate Action Required</strong>
                          <p>Customer shows high churn risk. Consider immediate retention campaign.</p>
                        </div>
                      </div>
                      <div className="recommendation-item high">
                        <span className="recommendation-icon">[REVENUE]</span>
                        <div className="recommendation-text">
                          <strong>Special Offer</strong>
                          <p>Provide personalized discount or exclusive benefits.</p>
                        </div>
                      </div>
                    </>
                  )}
                  {prediction.risk_score >= 40 && prediction.risk_score < 70 && (
                    <>
                      <div className="recommendation-item medium">
                        <span className="recommendation-icon">📧</span>
                        <div className="recommendation-text">
                          <strong>Re-engagement Campaign</strong>
                          <p>Send targeted email campaign to increase engagement.</p>
                        </div>
                      </div>
                      <div className="recommendation-item medium">
                        <span className="recommendation-icon">🎁</span>
                        <div className="recommendation-text">
                          <strong>Loyalty Program</strong>
                          <p>Invite to loyalty program or offer rewards points.</p>
                        </div>
                      </div>
                    </>
                  )}
                  {prediction.risk_score < 40 && (
                    <>
                      <div className="recommendation-item low">
                        <span className="recommendation-icon">✅</span>
                        <div className="recommendation-text">
                          <strong>Maintain Engagement</strong>
                          <p>Customer shows low churn risk. Continue regular communication.</p>
                        </div>
                      </div>
                      <div className="recommendation-item low">
                        <span className="recommendation-icon">⭐</span>
                        <div className="recommendation-text">
                          <strong>Upsell Opportunity</strong>
                          <p>Good candidate for premium products or services.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {!prediction && !error && (
            <div className="card placeholder-card">
              <div className="placeholder-content">
                <div className="placeholder-icon" aria-hidden="true">◎</div>
                <h3>Make a Prediction</h3>
                <p>Fill in the customer information and click "Get Prediction" to see the churn risk analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
