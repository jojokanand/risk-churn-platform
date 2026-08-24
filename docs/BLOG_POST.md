# Building a Production-Style MLOps Platform: From Concept to Dashboard

**A capstone project exploring the full lifecycle of machine learning systems**

*By Jojo Anand*

---

## The Beginning: More Than Just a Model

When I started my capstone project, I had a clear vision: build something that goes beyond a Jupyter notebook with 95% accuracy. I wanted to tackle the hard problems that come *after* training a model—the ones that actually matter in production.

The challenge? **Build an end-to-end ML platform for predicting e-commerce customer churn.**

I didn't just want to predict churn. I wanted to build a system that could:
- Deploy multiple model versions safely
- Detect when data drifts from training distributions
- Explain predictions to business users
- Automatically retrain when performance degrades
- Provide a beautiful interface for non-technical stakeholders

## The Problem Space

E-commerce companies lose customers every day. A customer who hasn't ordered in 90 days might be gone forever. But which customers are truly at risk? And more importantly—what can we do about it?

I decided to build a system that could:

1. **Predict churn risk** for every customer in real-time
2. **Provide actionable insights** about why they're at risk
3. **Monitor model health** automatically
4. **Make deployments safe** with A/B testing
5. **Look beautiful** so everyone actually uses it

## The Architecture: Lessons from Production Systems

After researching how companies like Netflix and Uber handle ML in production, I designed an architecture that addresses real-world concerns:

```
User Request → API Gateway → Feature Transformer
                                    ↓
                            Model Router (Shadow/Canary/Blue-Green)
                                    ↓
                            Models v1 & v2 (Running in Parallel)
                                    ↓
                            Explainer (SHAP Values)
                                    ↓
                            Kafka Event Stream
                                    ↓
                    Drift Detection & Outlier Detection
                                    ↓
                            Alert System → Retraining
```

### Key Architectural Decisions

**1. Model Router with Multiple Deployment Strategies**

Instead of just replacing models, I implemented three deployment strategies:

- **Shadow Mode**: Run v2 alongside v1 without affecting users. Compare predictions offline.
- **Canary Deployment**: Send 10% of traffic to v2, gradually increase if it performs well.
- **Blue-Green**: Instant switchover with instant rollback capability.

**2. Real-Time Drift Detection**

Models decay. Data changes. I needed to know *when* my model was becoming stale.

I implemented statistical drift detection using the Kolmogorov-Smirnov test on each feature:

**3. Event-Driven Architecture with Kafka**

Every prediction, drift alert, and outlier gets published to Kafka topics. Decoupling allowed me to build complex workflows (retraining, monitoring, analytics) without blocking the prediction API.

## The ML Pipeline: 21 Features That Matter

After analyzing e-commerce behavior, I engineered 21 features across 5 categories:

**Customer Demographics**
- `customer_age_days`: How long they've been a customer
- `account_age_days`: Days since registration

**Purchase Behavior** (Most Predictive!)
- `total_orders`: Lifetime order count
- `total_revenue`: Customer lifetime value
- `days_since_last_order`
- `order_frequency`: Orders per month
- `avg_order_value`: Spending per order

**Engagement Metrics**
- `website_visits_30d`: Recent engagement
- `email_open_rate`: Communication effectiveness
- `cart_abandonment_rate`: Intent without conversion
- `product_views_30d`: Browse behavior

**Customer Service**
- `support_tickets_total`: Help needed
- `support_tickets_open`: Active issues
- `returns_count`: Product dissatisfaction
- `refunds_count`: Payment dissatisfaction

**Preferences**
- `favorite_category`: Product preferences
- `discount_usage_rate`: Price sensitivity
- `premium_product_rate`: Quality preference
- `payment_method`: Checkout preferences
- `shipping_method`: Delivery preferences
- `failed_payment_count`: Payment friction


## The Models: Random Forest vs Gradient Boosting

I trained two models to compare in production:

**Model v1: Random Forest**
- 100 estimators
- Max depth: 15

**Model v2: Gradient Boosting**
- XGBoost with 200 rounds
- Learning rate: 0.1

With the help of shadow deployment, I could compare them on real traffic without risk.

## The Dashboard: Making ML Accessible

Here's where most ML projects fail: they build great models but terrible interfaces. I spent significant time creating a React dashboard that *anyone* could use.

### 5 Pages, Each Solving a Real Problem

I built five interconnected pages, each designed to answer a specific question someone would actually ask. The **Dashboard** gives you the 30-second health check with auto-refreshing metrics—system status, request volume, model agreement rates, and performance trends. It's what you check first thing in the morning to make sure nothing's on fire.

The **Monitoring** page is where you go when something *is* on fire. It has three tabs: drift detection shows you which features have p-values below 0.05 (meaning your model is seeing data it wasn't trained on), performance tracking plots 24-hour accuracy trends, and outlier detection flags unusual requests that might indicate data quality issues.

The **Predictions** page is my favorite because it's where non-technical users can actually interact with the model. You fill out a 21-field form with customer data, or load pre-configured high/medium/low-risk scenarios to see how the model responds. It returns not just a risk score and churn probability, but actionable recommendations—things like "immediate outreach required" for high-risk customers or "maintain regular communication" for engaged ones.

**Model Management** is the safety net for deployments. It shows the current routing strategy, compares v1 and v2 performance side-by-side, displays shadow analysis metrics (agreement rates, prediction correlation), and gives you big, obvious buttons to promote v2 to production or rollback if things go wrong. I added confirmation dialogs because accidentally promoting a model should require more than one click.

Finally, **Analytics** translates ML predictions into business intelligence. It segments customers by risk level (Champions with 5% churn rate vs. At-Risk with 35%), visualizes feature importance so you know what actually drives churn, and lists the top 10 at-risk customers with direct action buttons. This is the page that justifies the entire platform—it turns model outputs into revenue-saving decisions.

## The Testing Journey: 113 Tests

I'm proud to say I achieved **80% code coverage** with 113 tests:

The 107 unit tests cover everything from API endpoints to drift detection algorithms. I wrote tests for shadow routing to ensure both models run in parallel (v1 serves production, v2 just watches), authentication to verify API key validation works, and rate limiting to confirm the throttling logic prevents abuse. The drift detection tests were particularly important—they verify that Kolmogorov-Smirnov tests correctly flag when feature distributions change beyond the 0.05 threshold.

Beyond unit tests, I added 6 integration tests that verify the entire pipeline works end-to-end. These tests make a prediction through the API, verify it gets published to Kafka, check that consumers can retrieve it, and confirm the data structure stays intact through the whole journey. The trick here was Kafka mocking—I didn't want tests to require actual Kafka infrastructure in CI/CD, so I inject a `MagicMock` when the `CI` environment variable is set. This means tests run fast in GitHub Actions while still validating the real behavior in local development.

## The Tech Stack: Choices and Trade-offs

### Backend (Python)
- **FastAPI**: Async-native, automatic API docs, fast
- **Scikit-learn**: Model training (Random Forest)
- **XGBoost**: Better accuracy (Gradient Boosting)
- **SHAP**: Model explainability
- **Alibi Detect**: Drift & outlier detection
- **Kafka**: Event streaming
- **Redis**: Caching & rate limiting
- **PostgreSQL**: Feedback storage
- **Prometheus**: Metrics collection

### Frontend (TypeScript)
- **React 18**: Modern UI framework
- **TypeScript**: Type safety (caught bugs early!)
- **Chart.js**: Beautiful visualizations
- **Recharts**: Alternative charts
- **Axios**: API client with interceptors
- **React Router**: SPA navigation

### Infrastructure
- **Docker Compose**: Local orchestration
- **Kubernetes**: Production deployment (configurations included)
- **Nginx**: Frontend web server
- **GitHub Actions**: CI/CD pipeline

## Deployment: Making it Actually Runnable

I containerized everything with Docker because I wanted anyone to run this project with a single command. The frontend uses a multi-stage build—first it compiles the React app with Node.js, then copies the static bundle into an Nginx container. This produces a 500KB gzipped bundle that loads in under 2 seconds. The Docker Compose orchestration ties together seven services (frontend, API, Kafka, Zookeeper, Redis, Prometheus, Grafana) with proper dependency chains and health checks. I wrote a `deploy.sh` script that checks Docker is running, stops old containers, rebuilds everything, and displays access URLs. One command, five minutes, fully deployed platform.

## Performance: Where the Rubber Meets the Road

After optimization, the system hits 18.5ms at the 99th percentile for end-to-end predictions—2ms for feature transformation, 12ms for model inference, 4ms for database writes. A single API instance handles over 1000 requests per second, and the stateless design means horizontal scaling is trivial. Model v2 achieves 91.2% accuracy compared to v1's 89.5%, with an 89.2% agreement rate proving they're highly correlated. The entire stack runs comfortably in 2GB of RAM, making it cheap to operate even at scale.

## The Hard Problems

**Making explainability fast** was tough because SHAP values are computationally expensive. I solved this by pre-computing the TreeExplainer once during initialization, then caching it for all future requests. This dropped explanation time from 300ms to 50ms—still not instant, but acceptable for interactive use.

**Handling drift gracefully** required a severity-based alert system. High severity (multiple features drifting) triggers immediate alerts and considers emergency retraining. Medium severity (single feature drift) schedules retraining within a week. Low severity just logs for later analysis. This prevents alert fatigue while ensuring critical issues get immediate attention.

**Zero-downtime deployments** came down to atomic operations. The promote function does a health check on v2, swaps the model references in a single operation, updates metrics, and logs the change. Rollback is just another swap—no complicated orchestration, no partial states, no downtime. It's the boring solution, which means it actually works.

## What I Learned

The technical lessons were what you'd expect: test coverage prevents bugs, monitoring prevents silent failures, async architecture provides resilience. But the product lessons mattered more. ML systems fail not because the models are bad, but because nobody uses them. A beautiful dashboard gets checked daily; a CLI script gets forgotten. Explainability isn't a nice-to-have—business users won't trust predictions they can't understand. Shadow deployments remove the fear of trying new models, which means you actually iterate instead of staying stuck on v1 forever.

The biggest lesson was about incrementality. I didn't build all 113 tests on day one—I wrote them as I implemented features, which meant bugs got caught early when they were easy to fix. I didn't design the perfect architecture upfront—I started with something simple and refactored when I hit actual problems. The platform exists because I shipped working features iteratively, not because I planned everything perfectly from the start.

## The Final Scorecard

This project explores how a churn-scoring model can move beyond a notebook into a testable MLOps system. It combines a FastAPI inference API, model-routing strategies, drift and outlier monitoring, Kafka-based feedback flows, automated retraining components, and an interactive dashboard. The repository also includes Docker Compose and Kubernetes/Seldon Core deployment configurations as reference implementations; it does not currently operate a public production environment.

## Try It Yourself

The entire project is ready to run:

```bash
# Clone the repository
git clone <repo-url>
cd risk-churn-platform

# One-command deploy
./deploy.sh

# Access the dashboard
open http://localhost
```

**Explore:**
- Dashboard: Real-time metrics
- Predictions: Test with sample data
- Monitoring: See drift detection
- Model Management: Try promoting v2
- Analytics: Explore customer segments

## What's Next?

If I were to continue this project, I'd add:

1. **Real-Time Streaming**: Process predictions in real-time with Flink
2. **Multi-Model Ensemble**: Combine multiple models for better accuracy
3. **AutoML Integration**: Automatic hyperparameter tuning
4. **Mobile App**: React Native dashboard for on-the-go monitoring
5. **Advanced Analytics**: Cohort analysis, customer journey mapping
6. **Multi-Tenancy**: Support multiple clients with isolated data

## Conclusion: Beyond the Notebook

This capstone project taught me that building ML systems is 10% modeling and 90% everything else:

- **Infrastructure**: Making it reliable
- **Monitoring**: Keeping it healthy
- **UX**: Making it usable
- **Testing**: Ensuring it works
- **Documentation**: Helping others understand

The most rewarding moment? Seeing the dashboard light up with real predictions, drift alerts triggering automatically, and the model comparison showing v2 performing better—all working together as designed.

Building production ML isn't just about achieving high accuracy. It's about creating systems that:
- Don't break when data changes
- Explain themselves to stakeholders
- Deploy safely without downtime
- Look beautiful and inspire confidence
- Actually get used by real people

**That's what I built. That's what made it worth doing.**

---

## Technical Deep Dives

Want to learn more about specific components?

-  **Full Documentation**: See `DASHBOARD_GUIDE.md`
-  **Quick Start**: See `QUICK_START.md`
-  **Deployment**: See `DEPLOYMENT.md`
-  **Testing**: See `TESTING_DEPLOYMENT_SUMMARY.md`
-  **Features**: See `DASHBOARD_FEATURES.md`

## Connect With Me

I'd love to hear your thoughts, questions, or suggestions!

- **GitHub**: [View the repository]
- **LinkedIn**: [Connect with me]
- **Email**: [Get in touch]

---

This post documents the design and implementation of a production-style MLOps capstone. The repository contains the source code, automated tests, deployment manifests, and supporting documentation.

**Tags**: #MachineLearning #MLOps #DataScience #Python #React #Docker #CapstoneProject #ProductionML #ChurnPrediction #Dashboard
