# Dashboard User Guide

Complete guide to using the Risk Churn Platform web dashboard.

## Table of Contents

- [Quick Start](#quick-start)
- [Dashboard Overview](#dashboard-overview)
- [Monitoring & Drift Detection](#monitoring--drift-detection)
- [Testing Predictions](#testing-predictions)
- [Model Management](#model-management)
- [Analytics & Insights](#analytics--insights)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Accessing the Dashboard

1. **Local Development:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000)

2. **Docker:**
   ```bash
   docker-compose up -d
   ```
   Open [http://localhost](http://localhost)

3. **Production:**
   Navigate to your deployed URL

### First Steps

1. Check the **Dashboard** page for system status
2. Review **Monitoring** for any active alerts
3. Try the **Predictions** page with sample data
4. Explore **Analytics** for customer insights

## Dashboard Overview

The main dashboard provides real-time visibility into your ML platform.

### System Status Cards

Four key status indicators at the top:

- **Platform Status**: Overall health (should show "healthy")
- **Model v1**: Production model status (Active/Inactive)
- **Model v2**: Candidate model status (Active/Inactive)
- **Routing Strategy**: Current deployment strategy (Shadow/Canary/Blue-Green)

🟢 **Green** = Healthy
🟡 **Yellow** = Warning
🔴 **Red** = Error

### Key Metrics

Four critical metrics displayed as cards:

1. **Total Requests**
   - Total predictions served
   - Percentage change vs last hour
   - Shows platform usage trends

2. **Model Agreement Rate**
   - How often v1 and v2 agree (in shadow mode)
   - Number of comparisons made
   - High agreement = models are similar

3. **Avg Prediction Latency**
   - Time taken to return predictions
   - Change vs baseline
   - Lower is better (target: <20ms)

4. **Model Accuracy**
   - Current model performance
   - Weekly trend
   - Target: >90%

### Charts

**Prediction Volume (Line Chart)**
- Shows predictions per minute over last 30 minutes
- Helps identify traffic patterns
- Spikes may indicate issues or campaigns

**Model Performance (Line Chart)**
- Compares v1 and v2 accuracy over time
- Weekly view
- Use to decide on model promotion

### Shadow Deployment Analysis

When running in shadow mode:

- **Total Comparisons**: Number of times both models ran
- **Avg Difference**: How different predictions are
- **Correlation**: Statistical correlation (1.0 = identical)
- **V2 Performance**: Whether v2 is outperforming v1

 **When to Promote**: If v2 shows consistently better performance

### Recent Activity

Chronological feed of important events:
- High-risk predictions detected
- Model performance updates
- System alerts
- Report generation

## Monitoring & Drift Detection

The monitoring page helps you detect and diagnose issues.

### Health Overview

Four cards showing:
- Model Health (overall status)
- Active Drift Alerts (number of features with drift)
- Avg Latency (request processing time)
- Prediction Accuracy (current performance)

### Drift Detection Tab

**What is Drift?**
Data drift occurs when incoming data distribution changes from training data. This degrades model performance.

**Feature Drift Chart**
- Bar chart showing p-value for each feature
- Color coding:
  - 🔴 Red (p < 0.05): Significant drift - **Action Required**
  - 🟡 Yellow (p < 0.1): Warning - **Monitor Closely**
  - 🟢 Green (p > 0.1): Normal

**Recent Drift Events Table**
- Timestamp of detection
- Feature name
- P-value (lower = more drift)
- Severity level
- Status (Drift Detected / Normal)

**Actions to Take:**
1. If red alerts appear, investigate data sources
2. Consider model retraining if multiple features drift
3. Check for upstream data pipeline changes

### Performance Metrics Tab

**Model Performance Chart**
- 24-hour view of accuracy, precision, recall
- All three should track together
- Sudden drops indicate issues

**Latency Distribution**
- Histogram showing request count by latency bucket
- Most requests should be in 5-15ms range
- Long tail indicates performance issues

**Latency Percentiles**
- P50: 50% of requests faster than this
- P95: 95% of requests faster than this
- P99: 99% of requests faster than this
- Monitor P95 and P99 for user experience

**Error Rate**
- Percentage of failed requests
- Should be < 0.1%
- Spikes indicate system issues

### Outlier Detection Tab

**What are Outliers?**
Unusual prediction requests that differ significantly from training data. May indicate:
- Data quality issues
- Adversarial inputs
- Edge cases

**Outlier Summary**
- Total requests analyzed
- Outliers detected
- Outlier rate (should be <1%)

**Recent Outlier Events**
- Request IDs of anomalous requests
- Anomaly scores (higher = more unusual)
- Investigate high-scoring outliers

## Testing Predictions

Interactive interface to test the churn prediction model.

### Using Sample Data

Three quick-load buttons:

1. **Low Risk Sample**
   - Loyal customer profile
   - High engagement, recent orders
   - Expected risk score: <40

2. **Medium Risk Sample**
   - Moderately engaged customer
   - Some warning signs
   - Expected risk score: 40-70

3. **High Risk Sample**
   - At-risk customer profile
   - Low engagement, long time since order
   - Expected risk score: >70

### Manual Input

Fill in all 21 customer features across 5 categories:

** Customer Demographics & Tenure**
- Customer Age: Days since first purchase
- Account Age: Days since account creation

** Purchase Behavior**
- Total Orders: Lifetime order count
- Total Revenue: Customer lifetime value ($)
- Avg Order Value: Average spend per order ($)
- Days Since Last Order: Recency metric
- Order Frequency: Orders per month

** Engagement Metrics**
- Website Visits (30d): Site visits in last month
- Email Open Rate: 0-1 (0.7 = 70%)
- Cart Abandonment Rate: 0-1 (lower is better)
- Product Views (30d): Products viewed in last month

** Customer Service**
- Total Support Tickets: All-time tickets
- Open Support Tickets: Currently open
- Returns Count: Number of returns
- Refunds Count: Number of refunds

** Product & Payment Preferences**
- Favorite Category: Most purchased
- Discount Usage Rate: 0-1
- Premium Product Rate: 0-1
- Payment Method: Primary method
- Shipping Method: Preferred shipping
- Failed Payment Count: Failed attempts

### Understanding Results

**Risk Score (0-100)**
- Displayed prominently with color coding
- 0-40: Low Risk (Green)
- 40-70: Medium Risk (Yellow)
- 70-100: High Risk (Red)

**Churn Probability**
- Percentage likelihood customer will churn
- Directly correlates with risk score

**Model Version**
- Which model generated the prediction (v1/v2)
- Useful for comparing model behavior

**Latency**
- Time taken to generate prediction
- Should be < 20ms

**Request ID**
- Unique identifier for this prediction
- Use for debugging or audit trails

### Recommendations

Automatic retention strategies based on risk level:

**High Risk (70-100)**
- [WARNING] Immediate action required
-  Provide special offers
- Personal outreach recommended

**Medium Risk (40-70)**
- 📧 Re-engagement campaigns
- 🎁 Loyalty program enrollment
- Monitor closely

**Low Risk (0-40)**
- [OK] Maintain current engagement
- ⭐ Upsell opportunities
- Continue regular communication

## Model Management

Control and monitor model deployments.

### Current Deployment Strategy

Three possible strategies:

**Shadow Mode**
- v2 runs alongside v1 without affecting users
- All production traffic goes to v1
- v2 predictions compared for analysis
- **Use when**: Testing new model safely

**Canary Mode**
- Small percentage of traffic goes to v2
- Majority still uses v1
- Gradually increase v2 traffic if performing well
- **Use when**: Ready to test v2 in production

**Blue-Green Mode**
- Full switch between model versions
- Instant rollback capability
- All-or-nothing deployment
- **Use when**: Confident in v2 performance

### Model Comparison Cards

**Model v1 (Production)**
- Current production model
- Request count and traffic %
- Specifications: Random Forest, 21 features
- Historical accuracy: 89.5%

**Model v2 (Candidate)**
- New model being tested
- Request count in shadow/canary mode
- Specifications: Gradient Boosting, 21 features
- Current accuracy: 91.2%

### Shadow Analysis Metrics

**Total Comparisons**
- Number of times both models ran on same input
- More comparisons = more confidence

**Agreement Rate**
- % of times v1 and v2 agree
- High agreement (>90%) = models are similar
- Low agreement = investigate differences

**Avg Difference**
- Average absolute difference in predictions
- Should be small (<5%)

**Correlation**
- Statistical correlation between predictions
- 1.0 = perfect correlation
- >0.9 = strong correlation

**Performance Comparison**
- Visual bars showing v1 better vs v2 better
- Count of predictions where each model performed better
- If v2 better > v1 better, consider promotion

### Deployment Actions

**[WARNING] Important**: Both actions require confirmation

**Promote v2 to Production**
1. Click "Promote v2" button
2. Confirm in dialog
3. v2 becomes production model
4. v1 becomes backup
5. Verify in deployment history

**Rollback to v1**
1. Click "Rollback to v1" button
2. Confirm in dialog
3. v1 restored as production
4. Use if v2 shows issues
5. Verify system returns to normal

### Deployment History

Chronological log showing:
- Timestamp of deployment
- Action taken
- Strategy used
- Status (Success/Failed)
- User who initiated

Use for:
- Audit trail
- Debugging deployment issues
- Understanding system changes

## Analytics & Insights

Deep dive into customer behavior and model insights.

### Time Range Selection

Toggle between:
- **Last 24 Hours**: Real-time view
- **Last 7 Days**: Weekly trends (default)
- **Last 30 Days**: Monthly patterns

### Key Insights Cards

Four automated insights:

**High Risk Customers**
- Percentage and count
- Requires immediate attention
- Focus retention efforts here

**Engagement Decline**
- Trend in website visits
- Early warning indicator
- Address with campaigns

**Top Retention Factor**
- Most important feature for predictions
- Usually "Days Since Last Order"
- Optimize this metric

**Revenue at Risk**
- Total LTV of high-risk customers
- Business impact of churn
- Justifies retention spend

### Churn Risk Distribution (Pie Chart)

Shows percentage of customers in each risk category:
- 🟢 Low Risk (0-40)
- 🟡 Medium Risk (40-70)
- 🔴 High Risk (70-100)

**Healthy Distribution**: Majority in low risk

### Feature Importance (Bar Chart)

Horizontal bars showing which features most influence predictions:
- Longer bar = more important
- Top 7 features displayed
- Use to prioritize data quality

**Typical Top Features:**
1. Days since last order
2. Total revenue
3. Order frequency
4. Email open rate
5. Cart abandonment rate

### Customer Segments Table

Four key segments with metrics:

**Champions**
- High value, low churn risk
- Strategy: Reward loyalty, upsell

**Loyal Customers**
- Consistent purchasers
- Strategy: Exclusive offers

**At Risk**
- Declining engagement
- Strategy: Win-back campaigns

**Hibernating**
- Dormant customers
- Strategy: Re-activation

For each segment:
- Customer count
- Average revenue
- Churn rate
- Recommended strategy

### Top 10 At-Risk Customers

List of highest-risk customers with:
- Customer ID
- Risk score (color-coded)
- Lifetime value
- Days since last order
- Quick action buttons:
  - **Contact**: Initiate outreach
  - **Offer**: Send special promotion

**Use this for:**
- Daily retention workflow
- Prioritizing outreach
- Saving high-value customers

### Category & Payment Analysis

**Customer Categories (Doughnut Chart)**
- Distribution across product categories
- Identify popular categories
- Tailor marketing by category

**Payment Methods (Doughnut Chart)**
- Preferred payment methods
- Credit cards typically dominant
- Optimize checkout for popular methods

## Common Tasks

### Daily Monitoring Routine

1. **Check Dashboard** (2 min)
   - Verify all systems green
   - Review key metrics
   - Note any anomalies

2. **Review Monitoring** (3 min)
   - Check for drift alerts
   - Verify latency acceptable
   - Address any outliers

3. **Analytics Quick Check** (2 min)
   - Review key insights
   - Check top at-risk customers
   - Plan retention actions

### Weekly Analysis

1. **Model Performance Review** (10 min)
   - Compare v1 vs v2 trends
   - Review shadow analysis
   - Decide on promotion/rollback

2. **Drift Investigation** (15 min)
   - Analyze features with drift
   - Identify root causes
   - Plan mitigation

3. **Customer Segments** (10 min)
   - Review segment health
   - Update retention strategies
   - Calculate ROI of interventions

### Model Deployment Workflow

**Deploying New Model (v2):**

1. **Shadow Phase** (1-2 weeks)
   - Enable shadow mode
   - Monitor agreement rate
   - Analyze performance metrics
   - Goal: v2 shows improvement

2. **Canary Phase** (3-7 days)
   - Start with 10% traffic to v2
   - Monitor closely for issues
   - Gradually increase to 50%
   - Goal: No degradation

3. **Promotion** (when ready)
   - Review all metrics
   - Confirm v2 > v1
   - Click "Promote v2"
   - Monitor for 24 hours

4. **Rollback** (if needed)
   - If issues detected
   - Click "Rollback to v1"
   - Investigate v2 problems
   - Return to shadow testing

### Testing Predictions

**Scenario Testing:**

1. Load "High Risk Sample"
2. Click "Get Prediction"
3. Verify risk score >70
4. Check recommendations make sense
5. Repeat for medium and low risk

**Edge Case Testing:**

1. Enter extreme values
2. Test with minimal data
3. Try invalid ranges
4. Ensure graceful handling

**Model Comparison:**

1. Test same customer data
2. Note which model served
3. If in shadow mode, both run
4. Compare agreement

## Troubleshooting

### Dashboard Not Loading

**Symptoms**: White screen or errors

**Solutions**:
1. Check API is running: `curl http://localhost:8000/health`
2. Verify REACT_APP_API_URL in `.env`
3. Check browser console for errors
4. Clear browser cache
5. Restart frontend: `npm start`

### No Data Displaying

**Symptoms**: Empty charts/tables

**Solutions**:
1. Verify backend has processed requests
2. Check API connectivity
3. Make test prediction via API
4. Refresh dashboard
5. Check time range selection

### Predictions Failing

**Symptoms**: Error message on prediction

**Solutions**:
1. Verify all 21 fields filled
2. Check value ranges (0-1 for rates)
3. Ensure API is healthy
4. Check backend logs
5. Try sample data first

### High Latency Shown

**Symptoms**: Latency >100ms

**Solutions**:
1. Check backend server resources
2. Verify database connection
3. Review Kafka health
4. Check network latency
5. Scale up if needed

### Drift Alerts Not Clearing

**Symptoms**: Persistent red drift alerts

**Solutions**:
1. Verify data pipeline fixed
2. May need model retraining
3. Check if drift is real change
4. Adjust drift thresholds if needed
5. Consult data science team

### Model Promotion Failed

**Symptoms**: Error on promote/rollback

**Solutions**:
1. Check API logs for details
2. Verify model files exist
3. Ensure permissions correct
4. Try again after backend restart
5. Manual deployment if needed

## Best Practices

### Performance

- Keep dashboard open in dedicated tab
- Refresh automatically every 5 seconds
- Use time range filters to limit data
- Close unused tabs

### Security

- Don't share API keys
- Use HTTPS in production
- Implement authentication
- Audit deployment actions
- Regular security reviews

### Operations

- Document all model deployments
- Set up alerts for critical metrics
- Regular drift monitoring
- Weekly performance reviews
- Maintain deployment runbooks

### Data Quality

- Monitor outlier rates
- Investigate drift causes
- Validate input data
- Track feature importance changes
- Regular data audits

## Getting Help

### Documentation

- Frontend README: `frontend/README.md`
- API Documentation: `http://localhost:8000/docs`
- Main README: `README.md`

### Support

- GitHub Issues: Report bugs

### Learning Resources

- Machine Learning Monitoring (MLOps)
- Data Drift Detection
- A/B Testing Best Practices
- Customer Churn Prediction
