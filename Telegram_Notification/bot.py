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
import random
import string
import json
from rabbitmq import RabbitMQ
import threading

load_dotenv()

TOKEN = getenv("BOT_TOKEN")


characters = string.digits
dp = Dispatcher()

loop = asyncio.get_event_loop()

def _done(f: asyncio.Future):
    try:
        f.result()
    except Exception as e:
        print("ERROR IN new_order_notification:", repr(e))


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
    print('Removing session')
    print(session)
    session["session"].remove(chat_id)
    print(session)
    write_session(session)


async def new_order_notification(chat_id, data): # Потом доделать
    global bot
    body = f"Поступил новый заказ! \nЕго номер: {html.code(data["code"])}, дата и время создания: {data["created_at"]}\n\nФИО контрагента: {data["user"]["last_name"]} {data["user"]["first_name"]} {data["user"]["middle_name"] if not data["user"]["middle_name"] is None else ""} \nВид доставки: {data["delivery_type"]}.\n\n Можно уже проверять заказ прямо в 1С! Код: {html.code(data["code"])}"
    await bot.send_message(chat_id, body)


r = redis.StrictRedis(
        host='redis',  # из Endpoint
        port=6379,  # из Endpoint
        decode_responses=True
    )

def callback(ch, method, properties, body):
    body_json = json.loads(body.decode())
    action = body_json["action"]

    if action == "new_session":
        paste_session(body_json["message"])
    elif action == "new_order":
        session = read_session()
        for chat_id in session["session"]:
            fut = asyncio.run_coroutine_threadsafe(
                new_order_notification(chat_id, json.loads(body_json["message"])),
                loop
            )
            fut.add_done_callback(_done)

        # print("тут мы отправляем сообщение с заказом пользователям")

@dp.message(Command('disable'))
async def dysable_notifications(message: Message) -> None:
    try:
        remove_session(message.chat.id)
    except:
        # await message.answer("")
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
    rabbitmq = RabbitMQ('rabbitmq')
    rabbitmq.consume("notifications", callback=callback)

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))


async def main() -> None:
    global bot, loop
    loop = asyncio.get_running_loop()
    print("MAIN LOOP:", loop)
    threading.Thread(target=launch_consumer, daemon=True).start()
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())