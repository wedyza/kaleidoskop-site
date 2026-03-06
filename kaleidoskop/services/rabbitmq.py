import pika
import json
import time
import logging
from django.conf import settings


class RabbitMQ:
    def __init__(self):
        self.user = settings.RABBIT_MQ_USER
        self.password = settings.RABBIT_MQ_PASSWORD
        self.host = settings.RABBIT_MQ_HOST
        self.port = 5672
        self.connection = None
        self.channel = None
        self.queue_name = "notifications"
        self.logger = logging.getLogger(__name__)
        self.connect()

    def connect(self):
        """Создает новое подключение с retry логикой"""
        max_retries = 5
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                credentials = pika.PlainCredentials(self.user, self.password)
                parameters = pika.ConnectionParameters(
                    host=self.host, 
                    port=self.port, 
                    credentials=credentials, 
                    heartbeat=600, 
                    blocked_connection_timeout=300, 
                    connection_attempts=3, 
                    retry_delay=5
                )
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()
                
                # Объявляем очередь как durable
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                
                self.logger.info("RabbitMQ connected successfully")
                return
                
            except pika.exceptions.AMQPConnectionError as e:
                self.logger.error(f"Failed to connect to RabbitMQ (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    self.logger.error("Max connection attempts reached")
                    raise

    def ensure_connection(self):
        """Проверяет и восстанавливает подключение если нужно"""
        if not self.connection or self.connection.is_closed:
            self.logger.warning("Connection lost, reconnecting...")
            self.connect()
            return True
        
        if not self.channel or self.channel.is_closed:
            self.logger.warning("Channel lost, recreating...")
            try:
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                return True
            except:
                self.logger.error("Failed to recreate channel, reconnecting...")
                self.connect()
                return True
        
        return False

    def close(self):
        if self.channel and not self.channel.is_closed:
            try:
                self.channel.close()
            except:
                pass
        if self.connection and not self.connection.is_closed:
            try:
                self.connection.close()
            except:
                pass

    def consume(self, queue_name, callback):
        if not self.channel:
            raise Exception("Connection is not established.")
        self.channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
        try:
            self.channel.start_consuming()
        except Exception as e:
            self.logger.error(f"Consume failed: {e}")
            raise

    def publish(self, action, message, additional_json={}):
        """Публикует сообщение с автоматическим восстановлением соединения"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Проверяем и восстанавливаем соединение
                self.ensure_connection()
                
                json_message = {
                    "action": action,
                    "message": message
                } | additional_json
                
                self.channel.basic_publish(
                    exchange='',
                    routing_key=self.queue_name,
                    body=json.dumps(json_message),
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # make message persistent
                    )
                )
                
                self.logger.debug(f"Published message: {json_message}")
                return True
                
            except pika.exceptions.AMQPConnectionError as e:
                self.logger.error(f"Connection error on publish attempt {attempt + 1}: {e}")
            except pika.exceptions.ChannelClosed as e:
                self.logger.error(f"Channel closed on publish attempt {attempt + 1}: {e}")
            except Exception as e:
                self.logger.error(f"Unexpected error on publish attempt {attempt + 1}: {e}")
                break
            
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
        
        self.logger.error("Failed to publish after all retries")
        raise Exception("Failed to publish message after retries")
