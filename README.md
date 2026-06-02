# Kaleidoskop — Интернет магазин с интеграцией с 1С

![Django](https://img.shields.io/badge/Django-blue)
![DRF](https://img.shields.io/badge/REST%20API-Yes-green)
![Python](https://img.shields.io/badge/Python-3.12+-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-lightgrey)
![Minio](https://img.shields.io/badge/MinIO-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.2-orange)
![Celery](https://img.shields.io/badge/Celery-5.5.2-green)
![Nginx](https://img.shields.io/badge/Nginx-green)
![aiogram](https://img.shields.io/badge/aiogram-3.26.0-blue)

**Kaleidoskop-site** — это репозиторий для интернет-магазина для компании "Калейдоскоп". Он реализован на базе монолитной архитектуры и фреймворка Django Rest Framework, для работы также был разработан модуль для 1С Предприятия 8.3 11 редакции, без которого работа приложения не возможна.

---

## ✨ Ключевые возможности

### 🔄 Интеграция с 1С Предприятие
- **Двусторонняя синхронизация** данных между Kaleidoskop и 1С через REST API
- Автоматический обмен: заказы, товарные позиции, номенклатура, остатки

### 📱 Работа с Telegram
- **Telegram Bot** для уведомлений
- Уведомления о статусе обработки заказов

### 💾 Архитектура хранения
- **MinIO (S3-compatible)** — основное хранилище для медиаконтента
- **PostgreSQL** — relational data
- **Redis** — caching
- **RabbitMQ** — message queue + Celery для асинхронных задач + 

### 📦 Основные функциональные модули

| Модуль | Описание |
|--------|----------|
| **Items** | Управление товарами с фото, категориями, branding |
| **Orders** | Заказы клиентов из Telegram/интерфейса |
| **Cart Service** | Корзина и товары в заказе |
| **Categories** | Структура каталогов (баннеры, бренды) |
| **Remains** | Инвентаризация и остатки |
| **Orders & Orders** | Полный жизненный цикл заказа (create → process → cancel) |
| **Integration Service** | Связка с 1C через REST API |
| **User Management** | Авторизация, куки-токены, RBAC |

---

## 🛠️ Технологии

### Backend Stack
- **Django 4.2** — основной framework
- **drf-yasg** — OpenAPI/Swagger документация (`/swagger/`)
- **Celery** — async task processing
- **Django Storages + MinIO** — S3 объектное хранилище

### Данные & Cache
- **PostgreSQL 17** — Основная база данных
- **Redis 6.4** — Кэширование
- **RabbitMQ 4.2** — Очередь сообщения
- **MinIO** — S3 для файловых данных

### Интеграции
- **1C Enterprise REST API** — интеграция с удаленными системами
- **Telegram Bot API** — уведомления
- **SMTP Gmail** — email рассылки
- **Yomoney**  - Биллинг

---

## 🚀 Быстрый старт

### Локальный запуск (Docker) - данные берутся только из 1С

```bash
# Клонировать репозиторий и скопировать .env.example в .env
git clone https://github.com/wedyza/kaleidoskop-site
cd kaleidoskop-site
cp .env.example .env
cp .env.example kaleidoskop/kaleidoskop/.env

# Запустить все сервисы
docker-compose up -d

# Приложение доступно по https://localhost (без указания порта 443)
# Swagger документация: https://localhost/api/swagger/
# MinIO управленческая панель: http://localhost:9001/
# Также необходимо установить модуль для 1C
```
## 📡 API Endpoints

| Путь | Описание |
|------|----------|
| `https://localhost/api/swagger/` | OpenAPI документация и интерфейс |
| `https://localhost/` | Основной endpoint приложения |
---



| Service | Port | Role |
|---------|------|------|
| `nginx` / `app` | 443 | Django API + SSL termination (основной endpoint) |
| `celery` | — | Async task processor |
| `db` | 5432 | PostgreSQL |
| `redis` | 6379 | Cache |
| `rabbitmq` | 5672, 15672 | Message queue management |
| `minio` | 9000/9001 | S3-compatible object storage |
| `telegram` | — | Notification bot |
| `frontend` | — | Static files mount |

