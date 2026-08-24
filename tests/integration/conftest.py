"""Pytest configuration for integration tests."""

import os
import sys
from unittest.mock import MagicMock, Mock


def is_kafka_mocked() -> bool:
    """Return whether explicit Kafka mocking is enabled."""
    return os.getenv("MOCK_KAFKA") == "true"


# Apply mocking only when explicitly requested
if is_kafka_mocked():
    # Create mock producer
    mock_producer = MagicMock()
    mock_producer.send.return_value = MagicMock()
    mock_producer.flush.return_value = None
    mock_producer.close.return_value = None

    # Create mock consumer
    mock_consumer = MagicMock()
    mock_consumer.__iter__ = Mock(return_value=iter([]))
    mock_consumer.close.return_value = None

    # Create mock admin
    mock_admin = MagicMock()
    mock_admin.create_topics.return_value = None
    mock_admin.delete_topics.return_value = None
    mock_admin.close.return_value = None

    # Create mock Kafka module
    kafka_mock = MagicMock()
    kafka_mock.KafkaProducer = MagicMock(return_value=mock_producer)
    kafka_mock.KafkaConsumer = MagicMock(return_value=mock_consumer)

    # Create mock kafka.admin module
    kafka_admin_mock = MagicMock()
    kafka_admin_mock.KafkaAdminClient = MagicMock(return_value=mock_admin)
    kafka_admin_mock.NewTopic = MagicMock

    # Create mock kafka.errors module
    kafka_errors_mock = MagicMock()
    kafka_errors_mock.KafkaError = Exception
    kafka_errors_mock.NoBrokersAvailable = type("NoBrokersAvailable", (Exception,), {})

    # Create mock aiokafka module
    aiokafka_mock = MagicMock()
    aiokafka_mock.AIOKafkaProducer = MagicMock(return_value=mock_producer)
    aiokafka_mock.AIOKafkaConsumer = MagicMock(return_value=mock_consumer)

    # Inject mocks into sys.modules
    sys.modules["kafka"] = kafka_mock
    sys.modules["kafka.admin"] = kafka_admin_mock
    sys.modules["kafka.errors"] = kafka_errors_mock
    sys.modules["aiokafka"] = aiokafka_mock


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "kafka: mark test as requiring Kafka")
