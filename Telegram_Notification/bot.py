import asyncio
import logging
import sys
from os import getenv
from dotenv import load_dotenv

from aiogram import Bot, Dispatcher, html, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder

import redis
import pika
import random
import string
import json
from rabbitmq import RabbitMQ
import threading

load_dotenv()

TOKEN = getenv("BOT_TOKEN")

characters = string.digits
dp = Dispatcher()

def read_session():
    with open('config.json', 'r') as f:
        return json.load(f)


def write_session(data):
    with open('config.json', 'w') as f:
        json.dump(data, f)


def paste_session(chat_id):
    sessions = read_session()
    if chat_id not in sessions["session"]:
        sessions["session"].append(chat_id)
    write_session(sessions)
    

def remove_session(chat_id):
    session = read_session()
    session["session"].remove(chat_id)
    write_session(session)


r = redis.StrictRedis(
        host='localhost',  # из Endpoint
        port=6379,  # из Endpoint
        decode_responses=True
    )


def callback(ch, method, properties, body):
    body_json = json.loads(body.decode())
    action = body_json["action"]

    if action == "new_session":
        paste_session(body_json["message"])
    elif action == "new_order":
        print("тут мы отправляем сообщение с заказом пользователям")

@dp.message(Command('disable'))
async def dysable_notifications(message: Message) -> None:
    try:
        remove_session(message.chat.id)
    except:
        pass
    await message.answer("Успешно удалили вас, больше вы не будете получать уведомления")

@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(text="Создать код сессии", callback_data="session_create"))
    await message.answer(f"Привет, {html.bold(message.from_user.full_name)}! Для начала работы необходимо подтвердить начало сессии у администратора. Для этого нажмите на кнопку ниже и сообщите администратору ваш код сессии", reply_markup=builder.as_markup())


@dp.callback_query(lambda c: c.data == 'session_create')
async def session_create_event(callback_query: CallbackQuery):
    if str(callback_query.message.chat.id) in read_session()["session"]:
        await callback_query.message.answer(f"Ваша сессия уже активна, невозможно создать новую!")
        return

    session_code = "".join(random.choice(characters) for _ in range(9))

    r.set(session_code, f"{callback_query.message.chat.id}", 300)
    await callback_query.message.answer(f"Код сессии: {html.code(session_code)} | Действителен в течении 5 минут")

def launch_consumer():
    rabbitmq = RabbitMQ()
    rabbitmq.consume("notifications", callback=callback)



async def main() -> None:
    # Initialize Bot instance with default bot properties which will be passed to all API calls
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))

    # And the run events dispatching
    threading.Thread(target=launch_consumer, daemon=True).start()
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())