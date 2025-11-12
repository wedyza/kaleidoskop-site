import pika
import os
import json
from django.conf import settings

class RabbitMQ:
    
    def __init__(self):
        self.user = settings.RABBIT_MQ_USER
        self.password = settings.RABBIT_MQ_PASSWORD
        self.host = settings.RABBIT_MQ_HOST
        self.port = 5672
        self.connection = None
        self.queue_name = "notifications"
        self.channel = None
        print("generated rabbit mq connector")
        self.connect()

    def connect(self):
        credentials = pika.PlainCredentials(self.user, self.password)
        parameters = pika.ConnectionParameters(host=self.host, port=self.port, credentials=credentials)
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()

    def consume(self, queue_name, callback):
        if not self.channel:
            raise Exception("Connection is not established.")
        self.channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
        self.channel.start_consuming()

    def publish(self, action, message, additional_json = {}):
        if not self.channel:
            raise Exception("Connection is not established.")
        
        json_message = {
            "action": action,
            "message": message
        } | additional_json
        self.channel.basic_publish(exchange='',
                                   routing_key=self.queue_name,
                                   body=json.dumps(json_message),
                                   properties=pika.BasicProperties(
                                       delivery_mode=2,  # make message persistent
                                   ))