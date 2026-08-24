"""Database models for feedback storage."""

from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

Base = declarative_base()


class PredictionFeedback(Base):  # type: ignore[misc,valid-type]
    """Store prediction feedback for model retraining.

    Stores both predictions and ground truth labels for evaluating
    model performance and retraining.
    """

    __tablename__ = "prediction_feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(100), unique=True, nullable=False, index=True)

    # Customer features (JSON for flexibility)
    features = Column(JSON, nullable=False)

    # Prediction metadata
    predicted_probability = Column(Float, nullable=False)
    predicted_label = Column(Integer, nullable=False)  # 0 or 1
    risk_score = Column(Float, nullable=False)
    model_version = Column(String(20), nullable=False, index=True)
    routing_strategy = Column(String(20), nullable=False)

    # Ground truth (filled in later)
    actual_label = Column(Integer, nullable=True)  # 0 or 1
    feedback_timestamp = Column(DateTime, nullable=True)

    # Timestamps
    prediction_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Additional information
    latency_ms = Column(Float, nullable=True)
    extra_info = Column(JSON, nullable=True)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return (
            f"<PredictionFeedback(id={self.id}, request_id={self.request_id}, "
            f"predicted={self.predicted_label}, actual={self.actual_label})>"
        )


class ModelPerformance(Base):  # type: ignore[misc,valid-type]
    """Track model performance metrics over time."""

    __tablename__ = "model_performance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_version = Column(String(20), nullable=False, index=True)
    routing_strategy = Column(String(20), nullable=False)

    # Time period
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)

    # Metrics
    total_predictions = Column(Integer, nullable=False)
    predictions_with_feedback = Column(Integer, nullable=False)

    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)

    # Latency
    avg_latency_ms = Column(Float, nullable=True)
    p95_latency_ms = Column(Float, nullable=True)
    p99_latency_ms = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return (
            f"<ModelPerformance(model={self.model_version}, "
            f"f1={self.f1_score:.3f if self.f1_score else 'N/A'})>"
        )


class DriftEvent(Base):  # type: ignore[misc,valid-type]
    """Store drift detection events."""

    __tablename__ = "drift_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(100), unique=True, nullable=False)

    # Drift details
    drift_detected = Column(Boolean, nullable=False)
    drift_method = Column(String(20), nullable=False)  # ks, mmd, tabular
    p_value = Column(Float, nullable=True)
    drift_score = Column(Float, nullable=True)

    # Affected features
    affected_features = Column(JSON, nullable=True)
    feature_statistics = Column(JSON, nullable=True)

    # Window info
    reference_window_start = Column(DateTime, nullable=True)
    reference_window_end = Column(DateTime, nullable=True)
    test_window_start = Column(DateTime, nullable=True)
    test_window_end = Column(DateTime, nullable=True)

    # Severity and action
    severity = Column(String(20), nullable=False)  # info, warning, error, critical
    action_taken = Column(String(50), nullable=True)  # alert_sent, retrain_triggered, etc.
    resolved = Column(Boolean, default=False)

    # Timestamps
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return (
            f"<DriftEvent(id={self.id}, detected={self.drift_detected}, "
            f"p_value={self.p_value})>"
        )


class OutlierEvent(Base):  # type: ignore[misc,valid-type]
    """Store outlier detection events."""

    __tablename__ = "outlier_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(100), unique=True, nullable=False)
    request_id = Column(String(100), nullable=True, index=True)

    # Outlier details
    is_outlier = Column(Boolean, nullable=False)
    outlier_score = Column(Float, nullable=False)
    outlier_method = Column(String(30), nullable=False)  # isolation_forest, mahalanobis

    # Features that contributed to outlier
    features = Column(JSON, nullable=False)
    outlier_features = Column(JSON, nullable=True)  # Top features

    # Action
    severity = Column(String(20), nullable=False)
    action_taken = Column(String(50), nullable=True)
    flagged_for_review = Column(Boolean, default=False)

    # Timestamps
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return f"<OutlierEvent(id={self.id}, score={self.outlier_score:.3f})>"


class RetrainingJob(Base):  # type: ignore[misc,valid-type]
    """Track model retraining jobs."""

    __tablename__ = "retraining_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(100), unique=True, nullable=False)

    # Job details
    model_version = Column(String(20), nullable=False)
    trigger = Column(String(50), nullable=False)  # scheduled, drift_detected, manual
    status = Column(String(20), nullable=False, index=True)  # pending, running, completed, failed

    # Training data
    training_samples = Column(Integer, nullable=True)
    validation_samples = Column(Integer, nullable=True)

    # Results
    metrics = Column(JSON, nullable=True)  # accuracy, f1, etc.
    ready_for_deployment = Column(Boolean, nullable=True)
    deployed = Column(Boolean, default=False)

    # Paths
    model_path = Column(String(255), nullable=True)
    config_path = Column(String(255), nullable=True)

    # Error info
    error_message = Column(Text, nullable=True)
    error_traceback = Column(Text, nullable=True)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return (
            f"<RetrainingJob(id={self.job_id}, status={self.status}, "
            f"model={self.model_version})>"
        )


class APIKey(Base):  # type: ignore[misc,valid-type]
    """Store API keys for authentication."""

    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key_id = Column(String(50), unique=True, nullable=False, index=True)
    key_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA256

    # Metadata
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    owner = Column(String(100), nullable=True)

    # Permissions
    permissions = Column(JSON, nullable=False)  # ["predict", "admin", "monitor"]
    rate_limit = Column(Integer, nullable=False, default=1000)  # Requests per hour

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    revoked_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True, index=True)
    last_used_at = Column(DateTime, nullable=True)

    # Usage tracking
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)

    def __repr__(self) -> str:
        """String representation.

        Returns:
            String representation
        """
        return f"<APIKey(key_id={self.key_id}, name={self.name}, active={self.is_active})>"


# Database engine and session factory
def create_db_engine(database_url: str, **kwargs):
    """Create database engine.

    Args:
        database_url: Database connection URL
        **kwargs: Additional engine arguments

    Returns:
        SQLAlchemy engine
    """
    return create_engine(database_url, **kwargs)


def create_db_session(engine) -> Session:
    """Create database session.

    Args:
        engine: SQLAlchemy engine

    Returns:
        Database session
    """
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def init_db(engine) -> None:
    """Initialize database (create tables).

    Args:
        engine: SQLAlchemy engine
    """
    Base.metadata.create_all(bind=engine)
