import json
import time
import logging

import requests.exceptions
from environs import Env

import requests
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

logging.basicConfig(
    level=logging.DEBUG,
    filename="telegram_bot.log",
    format="%(asctime)s - %(module)s - %(levelname)s - %(funcName)s: %(lineno)d - %(message)s",
    datefmt='%H:%M:%S',
)

env = Env()
env.read_env()

API_TOKEN = env.str("BOT_TOKEN")
TG_SECRET_KEY = env.str("TG_SECRET_KEY")

bot = telebot.TeleBot(API_TOKEN, parse_mode='html')


# Keyboards
def confirm_call():
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton("Принять вызов",
                                    callback_data="confirm_call"))
    return markup


def categories_kb(categories: list):
    markup = InlineKeyboardMarkup()

    for category in categories:
        markup.add(InlineKeyboardButton(
            category['name'],
            callback_data=f"category:{category['pk']}")
        )

    markup.add(InlineKeyboardButton('Закрыть ❌',
                                    callback_data='close_categories'))

    return markup


def dish_kb(dishes: list, number_page: int, category_pk: int):
    markup = InlineKeyboardMarkup()

    if len(dishes) > 5:
        dishes_paginator = []
        temp_list = []
        counter = 0
        for dish in dishes:
            if counter < 5:
                temp_list.append(dish)
                counter += 1
            else:
                dishes_paginator.append(temp_list)
                temp_list = [dish]
                counter = 1
        if len(dishes) % 5 != 0:
            last_dishes = len(dishes) % 5
            dishes_paginator.append(dishes[-last_dishes:])

        page_dish = dishes_paginator[number_page]

        for dish in page_dish:
            name_dish = '✅' + dish['name'] if dish['available'] else dish['name']
            markup.add(InlineKeyboardButton(name_dish,
                                            callback_data=f"dish:{number_page}"
                                                          f":{dish['pk']}:"
                                                          f"{category_pk}"))
        if number_page == 0:
            markup.row(
                InlineKeyboardButton(text='Закрыть ❌',
                                     callback_data='close_dishes'),
                InlineKeyboardButton(text='Вперёд',
                                     callback_data=f'next_dishes:{number_page}:{category_pk}')
            )
        elif number_page == (len(dishes) - 1):
            markup.row(
                InlineKeyboardButton(text='Назад',
                                     callback_data=f'previous_dishes:'
                                                   f'{number_page}:'
                                                   f'{category_pk}'),
                InlineKeyboardButton(text='Закрыть ❌',
                                     callback_data='close_dishes')
            )
        else:
            markup.row(
                InlineKeyboardButton(text='Назад',
                                     callback_data=f'previous_dishes:'
                                                   f'{number_page}:'
                                                   f'{category_pk}'),
                InlineKeyboardButton(text='Закрыть ❌',
                                     callback_data='close_dishes'),
                InlineKeyboardButton(text='Вперёд',
                                     callback_data=f'next_dishes:{number_page}:'
                                                   f'{category_pk}')
            )

    else:
        page_dish = dishes

        for dish in page_dish:
            name_dish = '✅' + dish['name'] if dish['available'] else dish['name']

            markup.add(InlineKeyboardButton(name_dish,
                                            callback_data=f"dish:{number_page}"
                                                          f":{dish['pk']}:"
                                                          f"{category_pk}"))
        markup.add(InlineKeyboardButton('Закрыть ❌',
                                        callback_data="close_dishes"))
    return markup


@bot.message_handler(func=lambda message: message.chat.type == 'private',
                     commands=['start'])
def send_welcome(message):
    try:
        bot.send_message(message.chat.id, f'Здравсвтуйте, '
                                          f'{message.from_user.full_name}!')
        bot.send_chat_action(message.chat.id, 'typing')
        time.sleep(1.5)
        bot.send_message(message.chat.id, f'Для того, чтобы начать пользоваться'
                                          f' ботом вам нужно добавить его в чат.')
        bot.send_chat_action(message.chat.id, 'typing')
        time.sleep(2.5)
        bot.send_message(message.chat.id, f'В нём бот будет отображаться '
                                          f'сообщения с вызовом официанта, а также заказы '
                                          f'клиентов. Кроме того, вызывая команду '
                                          f'/residue_control персонал может управлять наличием '
                                          f'блюд, которые будут отображаться в меню клиента')
        time.sleep(1)
        bot.send_chat_action(message.chat.id, 'typing')
        time.sleep(5)
        bot.send_message(message.chat.id, f'После добавления бота в '
                                          f'чат он отправит вам его ID. '
                                          f'Этот ID Вам нужно привязать к вашему заведению. '
                                          f'Для этого Вам нужно открыть <u>личный кабинет</u>, '
                                          f'выбрать <u>заведение</u>, и вставить его в поле '
                                          f'<u>"ID телеграм чата"</u>, в '
                                          f'разделе <u>"Личная информация"</u>')
        time.sleep(1)
        bot.send_chat_action(message.chat.id, 'typing')
        time.sleep(6)
        bot.send_message(message.chat.id, '<i>Спасибо, что пользуетесь '
                                          'нашим сервисом, хорошей работы!</i>')
        logging.info(f'Отправка приветственного сообщению '
                     f'пользователю{message.from_user.full_name}'
                     f'(id: {message.from_user.id})')
    except BaseException as error:
        bot.send_message(message.chat.id, 'Упс... Что-то пошло не так))')
        logging.error(f'Ошибка при отправке приветственного сообщению '
                     f'пользователю{message.from_user.full_name}'
                     f'(id: {message.from_user.id}). Текст ошибки: {error}')


@bot.message_handler(content_types=['new_chat_members'])
def add_bot_to_chat(message):
    try:
        user_id = message.new_chat_members[0].id
        if user_id == 1859426720:
            bot.send_message(message.chat.id, f"ID вашего чата: <code>"
                                              f"{str(message.chat.id)[1:]}</code>.\n\n"
                                              f"Перейдите в <u>личный кабинет</u>, "
                                              f"в раздел <u>\"Личная информация</u>\""
                                              f" и вставьте в поле <u>\"ID телеграм"
                                              f" чата\"</u> полученный ID")
            bot.send_message(message.chat.id, f"<b>Кроме этого, добавьте бота"
                                              f" в администраторы, чтобы он мог "
                                              f"выполнять необходимые для него функции!</b>")
    except BaseException as error:
        bot.send_message(message.chat.id, "Упс... Что-то пошло не так))")
        logging.error(f'Ошибка при отправке сообщения об добавлении в чат(id: {message.chat.id}). Текст ошибки: {error}')


def call_waiter(chat_id: int, number_table: int):
    try:
        message = f'<u>Вызов официанта</u>\n<b>Столик: {number_table}</b>'
        message_waiter = bot.send_message(chat_id, message,
                                          reply_markup=confirm_call())

        bot.pin_chat_message(chat_id, message_waiter.message_id)
        bot.delete_message(chat_id, (message_waiter.message_id + 1))
        logging.info(f'Вызов официнта. (id чата: {chat_id})')
    except telebot.apihelper.ApiTelegramException as error:
        bot.send_message(chat_id, '<b>Добавьте бота в администраторы!</b>')
        logging.warning(
            f'Вызов официнта. Пользователь не добавил бота в админы(id чата: {chat_id}). Текст ошибки: {error}\n\n')
    except BaseException as error:
        logging.error(
            f'Вызов официнта. Неведомая ошибка(id чата: {chat_id}). Текст ошибки: {error}\n\n')


def custom_button(chat_id: int, number_table: int,
                  title_button: str, text_button: str):
    try:
        message = f'<u>Нажатие кнопки:</u> <i>{title_button}</i>\n' \
                  f'<b>Столик:</b> {number_table}\n\n' \
                  f'<b>Текст кнопки:</b> {text_button}'
        message_button = bot.send_message(chat_id, message,
                                          reply_markup=confirm_call())

        bot.pin_chat_message(chat_id, message_button.message_id)
        bot.delete_message(chat_id, (message_button.message_id + 1))
    except telebot.apihelper.ApiTelegramException as error:
        bot.send_message(chat_id, '<b>Добавьте бота в администраторы!</b>')
        logging.warning(
            f'Нажатие на кнопку. Пользователь не добавил бота в админы(id чата: {chat_id}). Текст ошибки: {error}')
    except BaseException as error:
        logging.error(
            f'Нажатие на кнопку. Неведомая ошибка(id чата: {chat_id}). Текст ошибки: {error}')


def new_order(chat_id: int, number_table: int, dishes: list,
              price: int, serve_dishes: str):
    try:
        # Формирую сообщение
        message_header = f'<u>Новый заказ</u>\n<b>Столик:</b> {number_table}\n\n'

        message_dishes = ''
        for dish in dishes:
            message_dishes += f"<b>{dish['name']}</b>: {dish['number_dish']}\n"

        message_price = f"\n<b>Стоимость заказа:</b> {price} руб.\n"
        if serve_dishes == 'all':
            message_serve = f"<i>Подавать когда всё будет готово</i>"
        else:
            message_serve = f"<i>Подавать по мере готовности</i>"

        # Собираю его в кучу
        full_message = message_header + message_dishes + \
                       message_price + message_serve

        message_order = bot.send_message(chat_id, full_message,
                                         reply_markup=confirm_call())
        bot.pin_chat_message(chat_id, message_order.message_id)
        # Удаляю сообщение о закреплении предыдущего сообщения.
        bot.delete_message(chat_id, (message_order.message_id + 1))
    except telebot.apihelper.ApiTelegramException as error:
        bot.send_message(chat_id, '<b>Добавьте бота в администраторы!</b>')
        logging.warning(
            f'Новый заказ. Пользователь не добавил бота в админы(id чата: {chat_id}). Текст ошибки: {error}')
    except BaseException as error:
        logging.error(
            f'Новый заказ. Неведомая ошибка(id чата: {chat_id}). Текст ошибки: {error}')


def check_group(chat_id: int):
    try:
        bot.send_message(chat_id, 'Бот успешно подключён к чату!')
        return True
    except telebot.apihelper.ApiTelegramException as error:
        logging.warning(
            f'Отправка сообщения с успешным подключением бота к чату. Пользователь ввёл неверный id чата(id чата: {chat_id}). Текст ошибки: {error}')
        return False
    except BaseException as error:
        logging.error(
            f'Отправка сообщения с успешным подключением бота к чату. Неведомая ошибка(id чата: {chat_id}). Текст ошибки: {error}')
        return False


@bot.message_handler(
    func=lambda message: message.chat.type in ['group', 'supergroup'],
    commands=['residue_control'])
def residue_control(message):
    try:
        bot.delete_message(message.chat.id, message.message_id)
        r = requests.post(
            'https://letseat.su/client_page/telegram/get_categories',
            data={'id_chat': message.chat.id, 'secret_key': TG_SECRET_KEY})
        list_categories = json.loads(r.text)['categories']
        bot.send_message(message.chat.id, 'Выберите категорию блюда:',
                         reply_markup=categories_kb(list_categories))
    except telebot.apihelper.ApiTelegramException as error:
        bot.send_message(message.chat.id, '<b>Чтобы воспользоваться этой '
                                          'функцией назначьте бота '
                                          'администратором!</b>')
        logging.warning(
            f'Вызов меню контроля остатоков. Пользователь не добавил бота в админы(id чата: {message.chat.id}). Текст ошибки: {error}')
    except requests.exceptions.ConnectionError as error:
        bot.send_message(message.chat.id, 'Сбой соединения:( Попробуйте ещё раз')
        logging.error(
            f'Вызов меню контроля остатоков. Что-то пошло не так(id чата: {message.chat.id}). Текст ошибки: {error}')


@bot.message_handler(
    func=lambda message: message.chat.type in ['group', 'supergroup'])
def delete_messages(message):
    bot.delete_message(message.chat.id, message.message_id)


@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):

    if call.data == "confirm_call":
        bot.answer_callback_query(call.id)
        try:
            send_message = call.message.text + \
                           f'\n\n<b>Обслуживает:</b> {call.from_user.full_name}'
            bot.edit_message_text(send_message, call.message.chat.id,
                                  call.message.message_id)
            bot.unpin_chat_message(call.message.chat.id,
                                   call.message.message_id)
        except telebot.apihelper.ApiTelegramException:
            bot.send_message(call.message.chat.id,
                             '<b>Назначьте бота администратором!</b>')
    elif call.data in ['close_dishes', 'close_categories']:
        bot.answer_callback_query(call.id)
        bot.delete_message(call.message.chat.id,
                           call.message.message_id)
    elif call.data[:8] == 'category':
        # try:
        bot.answer_callback_query(call.id)
        category_pk = call.data.split(':')[1]
        r = requests.post(
            'https://letseat.su/client_page/telegram/get_dishes',
            data={'category_pk': category_pk, 'secret_key': TG_SECRET_KEY})
        list_dishes = json.loads(r.text)['dishes']
        bot.edit_message_text('Выберите блюдо:', call.message.chat.id,
                              call.message.message_id,
                              reply_markup=dish_kb(list_dishes, 0,
                                                   int(category_pk)))
        # except requests.exceptions.ConnectionError:
        #     bot.send_message(call.message.chat.id,
        #                      'Сбой соединения:( Попробуйте ещё раз')
    elif call.data[:11] == 'next_dishes':
        try:
            bot.answer_callback_query(call.id)
            number_page = int(call.data.split(':')[1])
            category_pk = int(call.data.split(':')[2])
            next_page = number_page + 1
            r = requests.post(
                'https://letseat.su/client_page/telegram/get_dishes',
                data={'category_pk': category_pk, 'secret_key': TG_SECRET_KEY})
            list_dishes = json.loads(r.text)['dishes']
            bot.edit_message_reply_markup(call.message.chat.id,
                                          call.message.message_id,
                                          reply_markup=dish_kb(
                                              list_dishes, next_page
                                          ))
        except requests.exceptions.ConnectionError:
            bot.send_message(call.message.chat.id,
                             'Сбой соединения:( Попробуйте ещё раз')
    elif call.data[:15] == 'previous_dishes':
        try:
            bot.answer_callback_query(call.id)
            number_page = int(call.data.split(':')[1])
            category_pk = int(call.data.split(':')[2])
            next_page = number_page - 1
            r = requests.post(
                'https://letseat.su/client_page/telegram/get_dishes',
                data={'category_pk': category_pk, 'secret_key': TG_SECRET_KEY})
            list_dishes = json.loads(r.text)['dishes']
            bot.edit_message_reply_markup(call.message.chat.id,
                                          call.message.message_id,
                                          reply_markup=dish_kb(
                                              list_dishes, next_page
                                          ))
        except requests.exceptions.ConnectionError:
            bot.send_message(call.message.chat.id,
                             'Сбой соединения:( Попробуйте ещё раз')
    elif call.data[:4] == 'dish':
            try:
                bot.answer_callback_query(call.id)
                number_page = int(call.data.split(':')[1])
                dish_pk = call.data.split(':')[2]
                category_pk = int(call.data.split(':')[3])
                r = requests.post(
                    'https://letseat.su/client_page/telegram/edit_dish',
                    data={'category_pk': category_pk, 'dish_pk': dish_pk,
                          'secret_key': TG_SECRET_KEY})

                list_dishes = json.loads(r.text)['dishes']

                bot.edit_message_reply_markup(call.message.chat.id,
                                              call.message.message_id,
                                              reply_markup=dish_kb(
                                                  list_dishes, number_page,
                                                  category_pk
                                              ))
            except requests.exceptions.ConnectionError:
                bot.send_message(call.message.chat.id, 'Сбой соединения:( Попробуйте ещё раз')


if __name__ == '__main__':
    # bot.polling()
    # Use none_stop flag let polling will not stop when get new message occur error.
    print('Бот запущен!')
    logging.info('\n\nБОТ ЗАПУЩЕН!\n\n')
    bot.polling(none_stop=True)

    while True:  # Don't let the main Thread end.
        pass
