"""Kafka consumer for feedback and retraining pipeline."""

from collections.abc import Callable
from typing import Any

import structlog
from kafka import DefaultSerializer, JsonSerializer, KafkaConsumer
from kafka.errors import KafkaError

logger = structlog.get_logger()


class FeedbackConsumer:
    """Consume feedback events for model retraining."""

    def __init__(
        self,
        bootstrap_servers: list[str],
        topic: str = "ml.feedback",
        group_id: str = "risk-churn-platform",
        auto_offset_reset: str = "earliest",
        consumer_timeout_ms: float = float("inf"),
    ) -> None:
        """Initialize Kafka consumer.

        Args:
            bootstrap_servers: List of Kafka broker addresses
            topic: Kafka topic to consume from
            group_id: Consumer group ID
            auto_offset_reset: Where to start reading messages
            consumer_timeout_ms: Stop iteration after this many idle milliseconds
        """
        self.topic = topic

        try:
            self.consumer = KafkaConsumer(
                topic,
                bootstrap_servers=bootstrap_servers,
                group_id=group_id,
                auto_offset_reset=auto_offset_reset,
                value_deserializer=JsonSerializer(),
                key_deserializer=DefaultSerializer(),
                enable_auto_commit=False,  # Manual commit for reliability
                consumer_timeout_ms=consumer_timeout_ms,
            )
            logger.info(
                "kafka_consumer_initialized",
                topic=topic,
                group_id=group_id,
                bootstrap_servers=bootstrap_servers,
            )
        except Exception as e:
            logger.error("kafka_consumer_init_failed", error=str(e))
            raise

    def consume(
        self,
        callback: Callable[[dict[str, Any]], None],
        max_messages: int | None = None,
    ) -> None:
        """Consume messages and process with callback.

        Args:
            callback: Function to process each message
            max_messages: Maximum number of messages to consume (None for infinite)
        """
        message_count = 0

        try:
            for message in self.consumer:
                try:
                    # Process message
                    callback(message.value)

                    # Commit offset
                    self.consumer.commit()

                except Exception as e:
                    logger.error(
                        "message_processing_failed",
                        error=str(e),
                        offset=message.offset,
                        partition=message.partition,
                    )
                message_count += 1
                if max_messages and message_count >= max_messages:
                    break

        except KeyboardInterrupt:
            logger.info("consumer_interrupted")
        except KafkaError as e:
            logger.error("kafka_consumer_error", error=str(e))
        finally:
            self.close()

    def close(self) -> None:
        """Close the consumer."""
        self.consumer.close()
        logger.info("kafka_consumer_closed")


class PredictionConsumer:
    """Consume prediction events for offline evaluation."""

    def __init__(
        self,
        bootstrap_servers: list[str],
        topic: str = "ml.predictions",
        group_id: str = "risk-churn-platform-eval",
        auto_offset_reset: str = "earliest",
        consumer_timeout_ms: float = float("inf"),
    ) -> None:
        """Initialize prediction consumer.

        Args:
            bootstrap_servers: List of Kafka broker addresses
            topic: Kafka topic to consume from
            group_id: Consumer group ID
            auto_offset_reset: Where to start reading messages
            consumer_timeout_ms: Stop iteration after this many idle milliseconds
        """
        self.topic = topic
        self.predictions_buffer: list[dict[str, Any]] = []
        self.buffer_size = 1000

        try:
            self.consumer = KafkaConsumer(
                topic,
                bootstrap_servers=bootstrap_servers,
                group_id=group_id,
                auto_offset_reset=auto_offset_reset,
                value_deserializer=JsonSerializer(),
                enable_auto_commit=True,
                consumer_timeout_ms=consumer_timeout_ms,
            )
            logger.info(
                "prediction_consumer_initialized",
                topic=topic,
                group_id=group_id,
            )
        except Exception as e:
            logger.error("prediction_consumer_init_failed", error=str(e))
            raise

    def collect_predictions(self, max_messages: int = 1000) -> list[dict[str, Any]]:
        """Collect predictions for offline evaluation.

        Args:
            max_messages: Maximum number of messages to collect

        Returns:
            List of prediction events
        """
        predictions = []

        try:
            for message in self.consumer:
                predictions.append(message.value)

                if len(predictions) >= max_messages:
                    break

            logger.info("predictions_collected", count=len(predictions))
            return predictions

        except Exception as e:
            logger.error("prediction_collection_failed", error=str(e))
            return predictions

    def close(self) -> None:
        """Close the consumer."""
        self.consumer.close()
        logger.info("prediction_consumer_closed")
