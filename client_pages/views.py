import asyncio
import json
import logging
import datetime
from environs import Env

from easy_thumbnails.files import get_thumbnailer
from dateutil.relativedelta import relativedelta

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.views.generic.base import TemplateResponseMixin, View

from base.models import EstablishmentModel, ButtonModel, CommentModel, \
    CategoryDishesModel, DishModel, StatisticModel, StatisticMonthModel, \
    UserAdvanced, StatisticButton
from base.qiwi import check_pay
from bot.bot import new_order, call_waiter, custom_button

logger = logging.getLogger(__name__)
env = Env()
env.read_env()

TG_SECRET_KEY = env.str("TG_SECRET_KEY")


def save_stat_month(establishment):
    dt_today = datetime.date.today()
    stat_month = StatisticMonthModel.objects.filter(
        establishment=establishment,
        date=datetime.date(dt_today.year, dt_today.month, 1)
    ).first()

    if stat_month is not None:
        stat_month.count_users += 1
        stat_month.save()
    else:
        stat_month = StatisticMonthModel.objects.create(
            establishment=establishment,
            date=datetime.date(dt_today.year, dt_today.month, 1),
            count_users=1
        )
        stat_month.save()


class ClientPageMain(TemplateResponseMixin, View):
    template_name = ''

    def get(self, request, *args, **kwargs):
        number_table = kwargs['number_table']
        establishment = EstablishmentModel.objects.filter(
            pk=kwargs['id_establishment']
        ).first()
        buttons = ButtonModel.objects.filter(establishment=establishment,
                                             enable=True)

        if establishment is not None:
            ua = UserAdvanced.objects.get(user=establishment.owner)

            # Pay
            if ua.bill_id:
                try:
                    loop = asyncio.get_event_loop()
                # Если лупа нет - создаю его
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    dt_today = datetime.date.today()
                    check_pay_bill = loop.run_until_complete(
                        check_pay(ua.bill_id))
                    # Если оплачено
                    if check_pay_bill:
                        # Если дата текущей подписки меньше сегодняшнего дня, то
                        # начинаем отсчёт с сегодняшнего дня, если больше, то
                        # добавляем к текущей дате подписки ещё время на которое
                        # подписался юзер
                        if ua.subscription_date:
                            if ua.subscription_date.astimezone() < datetime.datetime.now().astimezone():
                                ua.subscription_date = dt_today + relativedelta(
                                    months=+ua.bill_months)
                            else:
                                ua.subscription_date = ua.subscription_date + \
                                                       relativedelta(
                                                           months=+ua.bill_months
                                                       )
                        else:
                            ua.subscription_date = dt_today + \
                                                   relativedelta(
                                                       months=+ua.bill_months
                                                   )

                        ua.subscription = True
                        ua.trial = False
                        ua.bill_id = ''
                        ua.bill_months = 0

                        ua.save()
                        return redirect('personal_area',
                                        id_establishment=ua.last_establishment.pk)
                except RuntimeError as Error:
                    logger.error(
                        f'RuntimeError проверке оплаты в личном кабинете. Пользователь: {request.user}({request.user.pk}). Полное сообщение ошибки: {Error}')
                    return JsonResponse({'status': 'error'})

            if ua.subscription_date.astimezone() < datetime.datetime.now().astimezone():
                ua.subscription = False
                ua.trial = False
                ua.save()

            if ua.subscription or ua.trial:
                self.template_name = 'client_pages/main.html'
                dt_today = datetime.date.today()
                stat = StatisticModel.objects.filter(
                    establishment=establishment,
                    date=dt_today).first()

                user_session_id = request.session.session_key
                if stat is not None:
                    if user_session_id not in stat.users_session_key:
                        stat.users_session_key.append(user_session_id)
                        stat.count_users += 1
                        save_stat_month(establishment)
                    stat.save()
                else:
                    new_stat = StatisticModel.objects.create(
                        establishment=establishment, date=dt_today,
                        users_session_key=[request.session.session_key],
                        count_users=1)
                    new_stat.save()
                    save_stat_month(establishment)
            else:
                self.template_name = 'client_pages/lock.html'

            ctx = {
                'establishment': establishment,
                'number_table': number_table,
                'buttons': buttons
            }

            return self.render_to_response(ctx)
        else:
            return redirect('home_page')


@require_POST
def feedback(request):
    text_feedback = request.POST['feedback']
    rate_feedback = int(request.POST['rate'])
    id_establishment = request.POST['id_establishment']
    number_table = int(request.POST['number_table'])

    establishment = EstablishmentModel.objects.filter(pk=id_establishment).first()
    if establishment is not None:
        stat = StatisticModel.objects.filter(establishment=establishment,
                                             date=datetime.date.today()).first()
        user_session_id = request.session.session_key
        if stat is not None:
            stat.feedback += 1
            if user_session_id not in stat.users_session_key:
                stat.users_session_key.append(user_session_id)
                stat.count_users += 1
            stat.save()
        else:
            new_stat = StatisticModel.objects.create(
                establishment=establishment, date=datetime.date.today(),
                feedback=1, users_session_key=[request.session.session_key],
                count_users=1)
            new_stat.save()

        new_comment = CommentModel.objects.create(
            establishment=establishment,
            number_table=number_table,
            text_comment=text_feedback,
            rate=rate_feedback,
        )
        new_comment.save()

        data = {
            'status': 'ok'
        }
    else:
        data = {
            'status': 'error'
        }
    return JsonResponse(data)


@require_POST
def get_menu(request):
    id_establishment = json.loads(request.body)['id_establishment']
    establishment = EstablishmentModel.objects.filter(
        pk=id_establishment
    ).first()

    if establishment is not None:
        stat = StatisticModel.objects.filter(establishment=establishment,
                                             date=datetime.date.today()).first()
        user_session_id = request.session.session_key
        if stat is not None:
            stat.menu += 1
            if user_session_id not in stat.users_session_key:
                stat.users_session_key.append(user_session_id)
                stat.count_users += 1
            stat.save()
        else:
            new_stat = StatisticModel.objects.create(
                establishment=establishment, date=datetime.date.today(),
                menu=1, users_session_key=[request.session.session_key],
                count_users=1)
            new_stat.save()

        categories = CategoryDishesModel.objects.filter(
            establishment=establishment
        )
        data = {
            'status': 'ok',
            'categories': [],
        }
        for category in categories:
            dishes_category = DishModel.objects.filter(category=category,
                                                       available=True)
            dishes = []

            for dish in dishes_category:
                if dish.dish_picture:
                    options = {'size': (150, 150), 'crop': True, 'quality': 95}
                    path_img = get_thumbnailer(dish.dish_picture).get_thumbnail(
                        options).url
                else:
                    path_img = ''
                dish_obj = {'name': dish.name,
                            'price': dish.price,
                            'description': dish.description,
                            'pk': dish.pk,
                            'path_img': path_img
                            }
                dishes.append(dish_obj)

            category_obj = {
                'name': category.name,
                'id': category.pk,
                'dishes': dishes
            }
            if len(dishes_category) > 0:
                data['categories'].append(category_obj)
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@require_POST
def order(request):
    dishes = json.loads(request.body)['dishes']
    serve_dishes = json.loads(request.body)['serve_dishes']
    id_establishment = json.loads(request.body)['id_establishment']
    number_table = json.loads(request.body)['number_table']

    establishment = EstablishmentModel.objects.filter(pk=id_establishment).first()
    if establishment is not None:
        id_chat = establishment.telegram_chat
        if id_chat:
            list_dishes = []
            full_price = 0
            for key, value in dishes.items():
                dish = DishModel.objects.filter(pk=key).first()
                name_dish = dish.name
                price_dish = dish.price
                number_dish = value['count']
                list_dishes.append(
                    {'name': name_dish,
                     'number_dish': number_dish}
                )
                full_price += int(price_dish) * int(value['count'])

            new_order(
                id_chat, number_table, list_dishes, full_price, serve_dishes
            )

    data = {'status': 'ok'}
    return JsonResponse(data)


@require_POST
def telegram_waiter(request):
    id_establishment = json.loads(request.body)['id_establishment']
    number_table = json.loads(request.body)['number_table']

    establishment = EstablishmentModel.objects.filter(pk=id_establishment).first()

    if establishment is not None:
        stat = StatisticModel.objects.filter(establishment=establishment,
                                             date=datetime.date.today()).first()
        user_session_id = request.session.session_key
        if stat is not None:
            stat.waiter += 1
            if user_session_id not in stat.users_session_key:
                stat.users_session_key.append(user_session_id)
                stat.count_users += 1
            stat.save()
        else:
            new_stat = StatisticModel.objects.create(
                establishment=establishment, date=datetime.date.today(),
                waiter=1, users_session_key=[request.session.session_key],
                count_users=1)
            new_stat.save()

        id_chat = establishment.telegram_chat
        if id_chat:
            call_waiter(id_chat, number_table)
            data = {'status': 'ok'}
        else:
            data = {'status': 'error'}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@require_POST
def telegram_button(request):
    id_establishment = json.loads(request.body)['id_establishment']
    number_table = json.loads(request.body)['number_table']
    button_pk = json.loads(request.body)['button_pk']

    establishment = EstablishmentModel.objects.filter(
        pk=id_establishment).first()
    if establishment is not None:
        id_chat = establishment.telegram_chat
        button = ButtonModel.objects.filter(pk=button_pk).first()
        if id_chat and button:
            stat = StatisticButton.objects.filter(establishment=establishment,
                                                  button=button,
                                                  date=datetime.date.today()
                                                  ).first()
            if stat is not None:
                stat.count_click += 1
                stat.save()
            else:
                new_stat = StatisticButton.objects.create(
                    establishment=establishment, date=datetime.date.today(),
                    button=button, count_click=1)
                new_stat.save()

            custom_button(
                id_chat, number_table, button.name, button.text_button
            )
            data = {'status': 'ok'}
        else:
            data = {'status': 'error'}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@csrf_exempt
@require_POST
def telegram_categories(request):
    secret_key = request.POST['secret_key']
    if secret_key == TG_SECRET_KEY:
        id_chat = request.POST['id_chat']

        establishment = EstablishmentModel.objects.filter(telegram_chat=id_chat).first()
        list_categories = []
        if establishment is not None:
            categories = CategoryDishesModel.objects.filter(
                establishment=establishment
            )
            for category in categories:
                list_categories.append({'name': category.name, 'pk': category.pk})

        data = {'categories': list_categories}
        return JsonResponse(data)
    else:
        return JsonResponse({'status': 'error'})


@csrf_exempt
@require_POST
def telegram_dishes(request):
    secret_key = request.POST['secret_key']
    if secret_key == TG_SECRET_KEY:
        category_pk = request.POST['category_pk']

        category = CategoryDishesModel.objects.filter(pk=category_pk).first()

        list_dishes = []
        if category is not None:
            dishes = DishModel.objects.filter(category=category)

            for dish in dishes:
                list_dishes.append(
                    {'name': dish.name,
                     'pk': dish.pk,
                     'available': dish.available}
                )
        print(list_dishes)

        data = {'dishes': list_dishes}
        return JsonResponse(data)
    else:
        return JsonResponse({'status': 'error'})


@csrf_exempt
@require_POST
def edit_dish(request):
    secret_key = request.POST['secret_key']
    if secret_key == TG_SECRET_KEY:
        category_pk = request.POST['category_pk']
        dish_pk = request.POST['dish_pk']

        dish = DishModel.objects.filter(pk=dish_pk).first()
        print(dish)
        if dish is not None:
            print(dish.available)
            dish.available = not dish.available
            dish.save()
            print(dish.available)

        category = CategoryDishesModel.objects.filter(pk=category_pk).first()
        list_dishes = []
        if category is not None:
            dishes = DishModel.objects.filter(category=category)
            for dish in dishes:
                dish_obj = {
                    'name': dish.name,
                    'pk': dish.pk,
                    'available': dish.available
                }
                list_dishes.append(dish_obj)

        data = {'dishes': list_dishes}
        return JsonResponse(data)
    else:
        return JsonResponse({'status': 'error'})

