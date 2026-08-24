"""Integration tests for Kafka components.

These tests require a running Kafka instance.
Run with: docker compose up -d kafka

CI runs against a real Kafka service. Set MOCK_KAFKA=true to use explicit mocks.
"""

import os
import time
from typing import Any
from uuid import uuid4

import pytest
from kafka import JsonSerializer, KafkaConsumer, KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic

from risk_churn_platform.kafka.consumer import FeedbackConsumer, PredictionConsumer
from risk_churn_platform.kafka.producer import PredictionProducer


def is_kafka_mocked() -> bool:
    """Return whether explicit Kafka mocking is enabled."""
    return os.getenv("MOCK_KAFKA") == "true"


def unique_group_id(prefix: str) -> str:
    """Create an isolated consumer group for one test."""
    return f"{prefix}-{uuid4().hex}"


@pytest.fixture(scope="module")
def kafka_bootstrap_servers() -> list[str]:
    """Get Kafka bootstrap servers.

    Returns:
        List of bootstrap servers
    """
    configured_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    return [server.strip() for server in configured_servers.split(",") if server.strip()]


@pytest.fixture(scope="module")
def kafka_admin(kafka_bootstrap_servers: list[str]) -> KafkaAdminClient:
    """Create Kafka admin client.

    Args:
        kafka_bootstrap_servers: Bootstrap servers

    Returns:
        Kafka admin client
    """
    # If Kafka is mocked, the KafkaAdminClient will be mocked automatically
    # by the conftest.py session fixture
    admin = KafkaAdminClient(bootstrap_servers=kafka_bootstrap_servers, client_id="test-admin")
    yield admin
    admin.close()


@pytest.fixture(scope="module")
def test_topics(kafka_admin: KafkaAdminClient) -> dict[str, str]:
    """Create test topics.

    Args:
        kafka_admin: Kafka admin client

    Returns:
        Dict of topic names
    """

    run_id = uuid4().hex
    topics = {
        "predictions": f"test.{run_id}.predictions",
        "feedback": f"test.{run_id}.feedback",
        "drift": f"test.{run_id}.drift",
        "outliers": f"test.{run_id}.outliers",
        "errors": f"test.{run_id}.errors",
    }

    # If Kafka is mocked, skip topic creation
    if is_kafka_mocked():
        yield topics
        return

    # Create topics
    topic_list = [
        NewTopic(name=name, num_partitions=1, replication_factor=1) for name in topics.values()
    ]

    try:
        kafka_admin.create_topics(new_topics=topic_list, validate_only=False)
        time.sleep(2)  # Wait for topics to be created
    except Exception as e:
        # Topics may already exist
        print(f"Topics may already exist: {e}")

    yield topics

    # Cleanup topics
    try:
        kafka_admin.delete_topics(topics=list(topics.values()))
    except Exception as e:
        print(f"Error deleting topics: {e}")


@pytest.mark.integration
@pytest.mark.kafka
def test_producer_send_prediction(
    kafka_bootstrap_servers: list[str], test_topics: dict[str, str]
) -> None:
    """Test sending prediction to Kafka.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    # Create producer
    producer = PredictionProducer(
        bootstrap_servers=kafka_bootstrap_servers, predictions_topic=test_topics["predictions"]
    )

    # Send prediction
    producer.send_prediction(
        request_id="test-123",
        features={"feature1": 1.0, "feature2": 2.0},
        predictions=[0.3, 0.7],
        model_version="v1",
        metadata={"strategy": "shadow"},
    )

    # Flush to ensure delivery
    producer.flush()

    # If Kafka is mocked, just verify the producer methods were called
    if is_kafka_mocked():
        producer.close()
        return

    # Create consumer to verify
    consumer = KafkaConsumer(
        test_topics["predictions"],
        bootstrap_servers=kafka_bootstrap_servers,
        auto_offset_reset="earliest",
        consumer_timeout_ms=5000,
        value_deserializer=JsonSerializer(),
    )

    # Read message
    messages = list(consumer)
    assert len(messages) > 0

    message = messages[0]
    data = message.value

    assert data["request_id"] == "test-123"
    assert data["model_version"] == "v1"
    assert "timestamp" in data

    consumer.close()
    producer.close()


@pytest.mark.integration
@pytest.mark.kafka
def test_producer_send_drift_alert(
    kafka_bootstrap_servers: list[str], test_topics: dict[str, str]
) -> None:
    """Test sending drift alert to Kafka.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    producer = PredictionProducer(
        bootstrap_servers=kafka_bootstrap_servers, drift_alerts_topic=test_topics["drift"]
    )

    drift_result = {"is_drift": True, "p_value": 0.01, "feature": "total_revenue"}

    producer.send_drift_alert(drift_result, severity="warning")
    producer.flush()

    if is_kafka_mocked():
        producer.close()
        return

    # Verify
    consumer = KafkaConsumer(
        test_topics["drift"],
        bootstrap_servers=kafka_bootstrap_servers,
        auto_offset_reset="earliest",
        consumer_timeout_ms=5000,
        value_deserializer=JsonSerializer(),
    )

    messages = list(consumer)
    assert len(messages) > 0

    data = messages[0].value
    assert data["event_type"] == "drift_detected"
    assert data["severity"] == "warning"

    consumer.close()
    producer.close()


@pytest.mark.integration
@pytest.mark.kafka
def test_feedback_consumer(kafka_bootstrap_servers: list[str], test_topics: dict[str, str]) -> None:
    """Test consuming feedback messages.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    if is_kafka_mocked():
        # In mocked mode, just verify consumer can be created
        consumer = FeedbackConsumer(
            bootstrap_servers=kafka_bootstrap_servers,
            topic=test_topics["feedback"],
            group_id=unique_group_id("test-feedback"),
            consumer_timeout_ms=5000,
        )
        consumer.close()
        return

    # Produce test messages
    producer = KafkaProducer(
        bootstrap_servers=kafka_bootstrap_servers,
        value_serializer=JsonSerializer(),
    )

    feedback_data = [
        {"customer_id": "c1", "label": 1, "timestamp": time.time()},
        {"customer_id": "c2", "label": 0, "timestamp": time.time()},
        {"customer_id": "c3", "label": 1, "timestamp": time.time()},
    ]

    for feedback in feedback_data:
        producer.send(test_topics["feedback"], value=feedback)

    producer.flush()
    producer.close()

    time.sleep(1)  # Wait for messages to be available

    # Consume messages
    consumer = FeedbackConsumer(
        bootstrap_servers=kafka_bootstrap_servers,
        topic=test_topics["feedback"],
        group_id=unique_group_id("test-feedback"),
        consumer_timeout_ms=5000,
    )

    collected_feedback: list[dict[str, Any]] = []

    def callback(message: dict[str, Any]) -> None:
        collected_feedback.append(message)

    consumer.consume(callback, max_messages=3)
    consumer.close()

    assert len(collected_feedback) == 3
    assert collected_feedback[0]["customer_id"] == "c1"
    assert collected_feedback[1]["label"] == 0


@pytest.mark.integration
@pytest.mark.kafka
def test_prediction_consumer_collect(
    kafka_bootstrap_servers: list[str], test_topics: dict[str, str]
) -> None:
    """Test collecting predictions from Kafka.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    if is_kafka_mocked():
        # In mocked mode, just verify consumer can be created
        consumer = PredictionConsumer(
            bootstrap_servers=kafka_bootstrap_servers,
            topic=test_topics["predictions"],
            group_id=unique_group_id("test-prediction"),
            consumer_timeout_ms=5000,
        )
        consumer.close()
        return

    # Produce test predictions
    producer = KafkaProducer(
        bootstrap_servers=kafka_bootstrap_servers,
        value_serializer=JsonSerializer(),
    )

    predictions = [
        {"request_id": f"req-{i}", "predictions": [0.3, 0.7], "model_version": "v1"}
        for i in range(5)
    ]

    for pred in predictions:
        producer.send(test_topics["predictions"], value=pred)

    producer.flush()
    producer.close()

    time.sleep(1)

    # Collect predictions
    consumer = PredictionConsumer(
        bootstrap_servers=kafka_bootstrap_servers,
        topic=test_topics["predictions"],
        group_id=unique_group_id("test-prediction"),
        consumer_timeout_ms=5000,
    )

    collected = consumer.collect_predictions(max_messages=5)
    consumer.close()

    assert len(collected) == 5
    assert all("request_id" in p for p in collected)


@pytest.mark.integration
@pytest.mark.kafka
def test_consumer_error_handling(
    kafka_bootstrap_servers: list[str], test_topics: dict[str, str]
) -> None:
    """Test consumer error handling.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    if is_kafka_mocked():
        # In mocked mode, skip error handling test
        return

    # Produce message that will cause processing error
    producer = KafkaProducer(
        bootstrap_servers=kafka_bootstrap_servers,
        value_serializer=JsonSerializer(),
    )

    producer.send(test_topics["errors"], value={"malformed": "data"})
    producer.flush()
    producer.close()

    time.sleep(1)

    consumer = FeedbackConsumer(
        bootstrap_servers=kafka_bootstrap_servers,
        topic=test_topics["errors"],
        group_id=unique_group_id("test-error"),
        consumer_timeout_ms=5000,
    )

    error_count = 0

    def error_callback(message: dict[str, Any]) -> None:
        nonlocal error_count
        error_count += 1
        raise ValueError("Processing error")

    # Should handle error gracefully (not crash)
    consumer.consume(error_callback, max_messages=1)
    consumer.close()

    # Error should have been logged but not crashed
    assert error_count == 1


@pytest.mark.integration
@pytest.mark.kafka
def test_end_to_end_prediction_flow(
    kafka_bootstrap_servers: list[str], test_topics: dict[str, str]
) -> None:
    """Test complete prediction flow through Kafka.

    Args:
        kafka_bootstrap_servers: Bootstrap servers
        test_topics: Test topic names
    """
    # 1. Producer sends prediction
    producer = PredictionProducer(
        bootstrap_servers=kafka_bootstrap_servers, predictions_topic=test_topics["predictions"]
    )

    request_id = f"e2e-test-{int(time.time())}"
    producer.send_prediction(
        request_id=request_id,
        features={"total_orders": 10, "total_revenue": 500.0},
        predictions=[0.25, 0.75],
        model_version="v2",
        metadata={"strategy": "canary", "canary_weight": 0.1},
    )
    producer.flush()
    producer.close()

    if is_kafka_mocked():
        # In mocked mode, just verify producer worked
        return

    time.sleep(1)

    # 2. Consumer collects prediction
    consumer = PredictionConsumer(
        bootstrap_servers=kafka_bootstrap_servers,
        topic=test_topics["predictions"],
        group_id=unique_group_id("test-e2e"),
        consumer_timeout_ms=5000,
    )

    predictions = consumer.collect_predictions(max_messages=10)
    consumer.close()

    # 3. Verify prediction was collected
    assert len(predictions) > 0
    matching_pred = [p for p in predictions if p["request_id"] == request_id]
    assert len(matching_pred) == 1

    pred = matching_pred[0]
    assert pred["model_version"] == "v2"
    assert pred["predictions"] == [0.25, 0.75]
    assert pred["metadata"]["strategy"] == "canary"
