FROM python:3.12

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt --no-cache-dir  

COPY __init__.py .env bot.py rabbitmq.py config.json ./