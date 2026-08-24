"""
Kafka Producer Service for Synthetic Data

Sends generated customer data to Kafka topics for real-time processing.
"""

import logging
import time

from kafka import DefaultSerializer, JsonSerializer, KafkaProducer
from kafka.errors import KafkaError

from .synthetic_data_generator import SyntheticDataGenerator

logger = logging.getLogger(__name__)


class KafkaProducerService:
    """Service to produce synthetic customer data to Kafka."""

    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        topic: str = "ml.predictions",
        generator: SyntheticDataGenerator | None = None,
    ):
        """
        Initialize Kafka producer service.

        Args:
            bootstrap_servers: Kafka bootstrap servers
            topic: Kafka topic to send data to
            generator: Data generator instance (creates new one if None)
        """
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.generator = generator or SyntheticDataGenerator()

        # Initialize Kafka producer
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=JsonSerializer(),
            key_serializer=DefaultSerializer(),
            acks="all",  # Wait for all replicas
            retries=3,
            max_in_flight_requests_per_connection=1,
        )

        logger.info(f"Kafka producer initialized: {bootstrap_servers} -> {topic}")

    def send_customer(self, customer: dict, key: str | None = None) -> bool:
        """
        Send a single customer record to Kafka.

        Args:
            customer: Customer data dictionary
            key: Optional partition key

        Returns:
            True if sent successfully, False otherwise
        """
        try:
            future = self.producer.send(self.topic, value=customer, key=key)
            # Block until send completes
            record_metadata = future.get(timeout=10)
            logger.debug(
                f"Sent to {record_metadata.topic}:{record_metadata.partition}@{record_metadata.offset}"
            )
            return True
        except KafkaError as e:
            logger.error(f"Failed to send customer data: {e}")
            return False

    def send_batch(self, customers: list[dict], keys: list[str] | None = None) -> int:
        """
        Send a batch of customer records to Kafka.

        Args:
            customers: List of customer data dictionaries
            keys: Optional list of partition keys

        Returns:
            Number of successfully sent records
        """
        success_count = 0

        for i, customer in enumerate(customers):
            key = keys[i] if keys and i < len(keys) else None
            if self.send_customer(customer, key):
                success_count += 1

        # Flush to ensure all messages are sent
        self.producer.flush()
        logger.info(f"Sent {success_count}/{len(customers)} customers to Kafka")
        return success_count

    def stream_customers(
        self,
        rate_per_minute: int = 60,
        duration_minutes: int | None = None,
        risk_distribution: dict[str, float] | None = None,
        drift_progression: bool = False,
    ) -> None:
        """
        Stream customers continuously to Kafka.

        Args:
            rate_per_minute: Number of customers to send per minute
            duration_minutes: How long to stream (None for infinite)
            risk_distribution: Distribution of risk levels
            drift_progression: If True, gradually introduce drift over time
        """
        interval = 60.0 / rate_per_minute  # Seconds between sends
        start_time = time.time()
        count = 0

        logger.info(
            f"Starting customer stream: {rate_per_minute}/min for {duration_minutes or 'infinite'} minutes"
        )

        try:
            while True:
                # Check if duration exceeded
                if duration_minutes:
                    elapsed_minutes = (time.time() - start_time) / 60
                    if elapsed_minutes >= duration_minutes:
                        break

                    # Update drift if progression is enabled
                    if drift_progression:
                        drift_factor = min(1.0, elapsed_minutes / duration_minutes)
                        self.generator.set_drift(drift_factor, direction=1)

                # Generate and send customer
                customer = self.generator.generate_customer()
                customer["stream_id"] = count
                customer["timestamp"] = time.time()

                self.send_customer(customer, key=f"customer_{count}")
                count += 1

                if count % 10 == 0:
                    logger.info(f"Streamed {count} customers")

                # Wait for next interval
                time.sleep(interval)

        except KeyboardInterrupt:
            logger.info("Stream interrupted by user")
        finally:
            logger.info(f"Stream completed. Total customers sent: {count}")
            self.close()

    def simulate_lifecycle_stream(
        self, num_customers: int = 10, days_per_customer: int = 180, speed_factor: int = 60
    ) -> None:
        """
        Simulate multiple customer lifecycles showing risk progression.

        Args:
            num_customers: Number of customers to simulate
            days_per_customer: Days in each lifecycle
            speed_factor: How many days to simulate per real second (60 = 1 day/sec)
        """
        logger.info(
            f"Simulating {num_customers} customer lifecycles ({days_per_customer} days each)"
        )

        for customer_num in range(num_customers):
            customer_id = f"lifecycle_{customer_num}"
            snapshots = self.generator.simulate_customer_lifecycle(customer_id, days_per_customer)

            logger.info(
                f"Streaming lifecycle for customer {customer_id} ({len(snapshots)} snapshots)"
            )

            for snapshot in snapshots:
                self.send_customer(snapshot, key=customer_id)
                # Speed up simulation
                time.sleep(1.0 / speed_factor)

        self.producer.flush()
        logger.info(
            f"Lifecycle simulation complete. {num_customers * len(snapshots)} snapshots sent"
        )
        self.close()

    def generate_drift_scenario(self, duration_minutes: int = 30) -> None:
        """
        Generate data showing gradual drift over time.

        Starts with normal distribution, then gradually shifts to high-risk customers.

        Args:
            duration_minutes: Duration of the drift scenario
        """
        logger.info(f"Starting drift scenario for {duration_minutes} minutes")

        start_time = time.time()
        count = 0
        rate_per_minute = 60

        interval = 60.0 / rate_per_minute

        while (time.time() - start_time) / 60 < duration_minutes:
            elapsed_minutes = (time.time() - start_time) / 60
            progress = elapsed_minutes / duration_minutes

            # Gradually shift distribution toward high risk
            risk_distribution = {
                "low": max(0.1, 0.5 - progress * 0.4),
                "medium": 0.3,
                "high": min(0.6, 0.2 + progress * 0.4),
            }

            # Apply drift to generator
            self.generator.set_drift(progress, direction=1)

            # Generate and send
            customer = self.generator.generate_customer()
            customer["drift_progress"] = round(progress, 2)
            customer["timestamp"] = time.time()

            self.send_customer(customer, key=f"drift_{count}")
            count += 1

            if count % 50 == 0:
                logger.info(
                    f"Drift progress: {progress*100:.1f}% | Sent {count} customers | "
                    f"Distribution: L{risk_distribution['low']:.1f} "
                    f"M{risk_distribution['medium']:.1f} H{risk_distribution['high']:.1f}"
                )

            time.sleep(interval)

        logger.info(f"Drift scenario complete. Total customers: {count}")
        self.close()

    def close(self) -> None:
        """Close the Kafka producer."""
        if self.producer:
            self.producer.flush()
            self.producer.close()
            logger.info("Kafka producer closed")
