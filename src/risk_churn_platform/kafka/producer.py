"""Kafka producer for async request mirroring."""

from typing import Any

import structlog
from kafka import DefaultSerializer, JsonSerializer, KafkaProducer
from kafka.errors import KafkaError

logger = structlog.get_logger()


class PredictionProducer:
    """Produce prediction events to Kafka for offline evaluation."""

    def __init__(
        self,
        bootstrap_servers: list[str],
        predictions_topic: str = "ml.predictions",
        drift_alerts_topic: str = "ml.drift-alerts",
        outliers_topic: str = "ml.outliers",
    ) -> None:
        """Initialize Kafka producer.

        Args:
            bootstrap_servers: List of Kafka broker addresses
            predictions_topic: Topic for prediction events
            drift_alerts_topic: Topic for drift alerts
            outliers_topic: Topic for outlier events
        """
        self.predictions_topic = predictions_topic
        self.drift_alerts_topic = drift_alerts_topic
        self.outliers_topic = outliers_topic

        try:
            self.producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=JsonSerializer(),
                key_serializer=DefaultSerializer(),
                acks="all",  # Wait for all replicas
                retries=3,
                max_in_flight_requests_per_connection=1,  # Ensure ordering
            )
            logger.info("kafka_producer_initialized", bootstrap_servers=bootstrap_servers)
        except Exception as e:
            logger.error("kafka_producer_init_failed", error=str(e))
            raise

    def send_prediction(
        self,
        request_id: str,
        features: dict[str, Any],
        predictions: list[float],
        model_version: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Send prediction event to Kafka.

        Args:
            request_id: Unique request identifier
            features: Input features
            predictions: Model predictions
            model_version: Version of model used
            metadata: Additional metadata
        """
        event = {
            "request_id": request_id,
            "features": features,
            "predictions": predictions,
            "model_version": model_version,
            "metadata": metadata or {},
            "timestamp": self._get_timestamp(),
        }

        try:
            future = self.producer.send(self.predictions_topic, key=request_id, value=event)
            future.add_callback(self._on_send_success)
            future.add_errback(self._on_send_error)
        except Exception as e:
            logger.error(
                "failed_to_send_prediction",
                request_id=request_id,
                error=str(e),
            )

    def send_drift_alert(
        self,
        drift_result: dict[str, Any],
        severity: str = "warning",
    ) -> None:
        """Send drift detection alert to Kafka.

        Args:
            drift_result: Drift detection results
            severity: Alert severity
        """
        event = {
            "event_type": "drift_detected",
            "severity": severity,
            "drift_result": drift_result,
            "timestamp": self._get_timestamp(),
        }

        try:
            future = self.producer.send(self.drift_alerts_topic, value=event)
            future.add_callback(self._on_send_success)
            future.add_errback(self._on_send_error)
        except Exception as e:
            logger.error("failed_to_send_drift_alert", error=str(e))

    def send_outlier_event(
        self,
        outlier_result: dict[str, Any],
        severity: str = "info",
    ) -> None:
        """Send outlier detection event to Kafka.

        Args:
            outlier_result: Outlier detection results
            severity: Alert severity
        """
        event = {
            "event_type": "outliers_detected",
            "severity": severity,
            "outlier_result": outlier_result,
            "timestamp": self._get_timestamp(),
        }

        try:
            future = self.producer.send(self.outliers_topic, value=event)
            future.add_callback(self._on_send_success)
            future.add_errback(self._on_send_error)
        except Exception as e:
            logger.error("failed_to_send_outlier_event", error=str(e))

    def flush(self) -> None:
        """Flush any pending messages."""
        self.producer.flush()

    def close(self) -> None:
        """Close the producer."""
        self.producer.close()
        logger.info("kafka_producer_closed")

    @staticmethod
    def _get_timestamp() -> float:
        """Get current timestamp.

        Returns:
            Current timestamp
        """
        import time

        return time.time()

    @staticmethod
    def _on_send_success(record_metadata: Any) -> None:
        """Callback for successful send.

        Args:
            record_metadata: Metadata from Kafka
        """
        logger.debug(
            "kafka_send_success",
            topic=record_metadata.topic,
            partition=record_metadata.partition,
            offset=record_metadata.offset,
        )

    @staticmethod
    def _on_send_error(exception: KafkaError) -> None:
        """Callback for send error.

        Args:
            exception: Kafka error
        """
        logger.error("kafka_send_error", error=str(exception))
