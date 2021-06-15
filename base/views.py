import asyncio
import base64
import datetime
import json
import os
import random
import logging
from pathlib import Path

from dateutil.relativedelta import *

from django.http import JsonResponse
from django.shortcuts import redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.views.generic.base import TemplateResponseMixin, View
from django.contrib.auth.models import User
from django.conf import settings
from django.db.utils import IntegrityError
from django.core.mail import send_mail

from bot.bot import check_group
from .models import (EstablishmentModel, UserAdvanced, QRCode, ButtonModel,
                     CategoryDishesModel, DishModel, CommentModel,
                     StatisticModel, StatisticMonthModel, VideoModel)
from .forms import CreateEstablishmentForm

from . import qr, download_pdf_zip
from .qiwi import create_link_to_pay, check_pay, cancel_pay

BASE_DIR = Path(__file__).resolve().parent.parent
logger = logging.getLogger(__name__)


class HomePage(TemplateResponseMixin, View):
    template_name = 'index.html'

    def get(self, request):
        if request.user.is_authenticated:
            ua = UserAdvanced.objects.filter(user=request.user).first()
            ctx = {'ua': ua}
        else:
            ctx = {}
        return self.render_to_response(ctx)


@require_POST
def get_message_from_landing(request):
    name = request.POST.get('tsafdsa')
    email = request.POST.get('fdshghh')
    phone = request.POST.get('phone')
    message = request.POST.get('message')

    message = f'Сообщение от {name}(email - {email}, телефон - {phone})' \
              f'\n\nТекст сообщения:\n{message}'

    send_mail('Сообщение с сайта', message,
              settings.DEFAULT_FROM_EMAIL, ['zhurbiym@gmail.com'])
    return JsonResponse({'status': 'ok'})


class TermsOfUse(TemplateResponseMixin, View):
    template_name = 'terms_of_use.html'

    def get(self, request):
        ctx = {}
        return self.render_to_response(ctx)


class EmptyPersonalArea(TemplateResponseMixin, View):
    template_name = 'personal_area.html'

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('login')

        ua: User = UserAdvanced.objects.get(user=request.user)
        establishments = EstablishmentModel.objects.filter(owner=request.user)

        if len(establishments) == 0:
            return redirect('personal_area_start')
        else:
            last_estbl = ua.last_establishment
            return redirect('personal_area',
                            id_establishment=last_estbl.pk)


        return self.render_to_response({})


class PersonalAreaStart(TemplateResponseMixin, View):
    template_name = 'personal_area_start.html'

    def post(self, request):
        form = CreateEstablishmentForm(instance=request.user, data=request.POST)
        if form.is_valid():
            if 'picture' in request.FILES:
                new_establishment = EstablishmentModel.objects.create(
                    owner=request.user,
                    name=request.POST['name'],

                )
                new_establishment.save()
                new_establishment.picture = request.FILES['picture']
                new_establishment.save()
            else:
                new_establishment = EstablishmentModel.objects.create(
                    owner=request.user,
                    name=request.POST['name']
                )
                new_establishment.save()
        else:
            return self.render_to_response({
                'form': CreateEstablishmentForm(request.POST),
            })

        ua = UserAdvanced.objects.get(user=request.user)
        ua.last_establishment = new_establishment
        ua.save()

        return redirect('personal_area',
                        id_establishment=new_establishment.pk)

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('login')

        ua = UserAdvanced.objects.get(user=request.user)
        establishments = EstablishmentModel.objects.filter(owner=request.user)
        videos = VideoModel.objects.all()

        if len(establishments) > 0:
            return redirect('personal_area',
                            id_establishment=ua.last_establishment.pk)
        ctx = {
            'form': CreateEstablishmentForm(),
            'videos': videos,
        }
        return self.render_to_response(ctx)


class PersonalArea(TemplateResponseMixin, View):
    template_name = 'personal_area.html'

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('home_page')

        establishments = EstablishmentModel.objects.filter(owner=request.user)
        ua = get_object_or_404(UserAdvanced, user=request.user)

        if len(establishments) == 0:
            return redirect('personal_area_start')

        dt_today = datetime.date.today()
        # Pay
        if ua.bill_id:
            try:
                loop = asyncio.get_event_loop()
            # Если лупа нет - создаю его
            except RuntimeError:
                loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Если оплачено
                check_pay_bill = loop.run_until_complete(check_pay(ua.bill_id))
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

        if ua.subscription or ua.trial:
            print('trial, work!!')
            next_pay = ua.subscription_date.astimezone() - datetime.datetime.now().astimezone()
            next_pay = next_pay.days + 1
        else:
            print('trial, not work((')
            next_pay = None

        if ua.subscription_date.astimezone() < datetime.datetime.now().astimezone():
            ua.subscription = False
            ua.trial = False
            ua.save()

        current_establishment = EstablishmentModel.objects.filter(
            pk=kwargs['id_establishment'], owner=request.user).first()
        if current_establishment is None:
            return redirect('home_page')
        qr_codes = QRCode.objects.filter(establishment=current_establishment)
        buttons = ButtonModel.objects.filter(
            establishment=current_establishment)
        categories = CategoryDishesModel.objects.filter(
            establishment=current_establishment
        )
        comments = CommentModel.objects.filter(
            establishment=current_establishment
        ).order_by('-date')
        five_stars = comments.filter(rate=5)
        four_stars = comments.filter(rate=4)
        three_stars = comments.filter(rate=3)
        two_stars = comments.filter(rate=2)
        one_star = comments.filter(rate=1)

        ua.last_establishment = current_establishment
        ua.save()

        # Удаляем текущее заведения из списка, чтобы повторно его не отображать
        establishments = establishments.exclude(pk=kwargs['id_establishment'])

        pie_day_stats = StatisticModel.objects.filter(
            establishment=current_establishment, date=datetime.date.today()
        ).first()
        if pie_day_stats is not None:
            pie_day = {
                'waiter': pie_day_stats.waiter,
                'menu': pie_day_stats.menu,
                'feedback': pie_day_stats.feedback
            }
        else:
            pie_day = {
                'waiter': 0,
                'menu': 0,
                'feedback': 0
            }

        previous_month = datetime.date.today() - datetime.timedelta(days=30)
        stats_month = StatisticModel.objects.filter(
            establishment=current_establishment,
            date__lte=datetime.date.today(),
            date__gte=previous_month
        )
        pie_month = {
            'waiter': 0,
            'menu': 0,
            'feedback': 0
        }
        for pie_month_stat in stats_month:
            pie_month['waiter'] += pie_month_stat.waiter
            pie_month['menu'] += pie_month_stat.menu
            pie_month['feedback'] += pie_month_stat.feedback

        linear_by_days = {}
        count_visits_days = 0
        for linear_day in stats_month.order_by('date'):
            date = linear_day.date.strftime("%d.%m")
            linear_by_days[date] = linear_day.count_users
            count_visits_days += linear_day.count_users

        linear_by_months = []
        count_visits_months = 0
        dt_today = datetime.date.today()
        last_month = datetime.date(dt_today.year, dt_today.month, 1) + \
                     relativedelta(months=-12)
        last_12_month = StatisticMonthModel.objects.filter(
            establishment=current_establishment,
            date__lt=dt_today,
            date__gte=last_month).order_by('date')
        for month in last_12_month:
            linear_by_months.append({
                'count_users': month.count_users,
                'date': month.date,
            })
            count_visits_months += month.count_users

        videos = VideoModel.objects.all()

        ctx = {
            'ua': ua,
            'establishment': current_establishment,
            'all_establishments': establishments,

            'qr_codes': qr_codes,
            'buttons': buttons,
            'categories': categories,
            'comments': comments,

            'five_stars': five_stars,
            'four_stars': four_stars,
            'three_stars': three_stars,
            'two_stars': two_stars,
            'one_star': one_star,

            'pie_day': pie_day,
            'pie_month': pie_month,

            'linear_by_days': linear_by_days,
            'count_visits_days': count_visits_days,

            'linear_by_months': linear_by_months,
            'count_visits_months': count_visits_months,

            'next_pay': next_pay,

            'videos': videos,
        }
        return self.render_to_response(ctx)


def check_subscription(func):
    def wrapper(*args, **kwargs):
        request = args[0]
        ua = UserAdvanced.objects.filter(user=request.user).first()
        if ua is not None:
            if ua.subscription or ua.trial:
                json = func(*args, **kwargs)
                return json
        return JsonResponse({'status': 'error'})
    return wrapper


def pay(request, **kwargs):
    try:
        loop = asyncio.get_event_loop()
    # Если лупа нет - создаю его
    except RuntimeError:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        month = int(kwargs['month'])
        if month == 1:
            price = 1
        elif month == 3:
            price = 2
        elif month == 6:
            price = 3
        else:
            price = 99999

        ua = UserAdvanced.objects.get(user=request.user)
        if ua.bill_id:
            check_pay_bill = loop.run_until_complete(check_pay(ua.bill_id))
            if check_pay_bill:
                dt_today = datetime.date.today()
                ua.bill_id = ''
                ua.bill_months = 0
                ua.subscription = True
                ua.trial = False
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
                ua.save()
                return redirect('personal_area',
                                id_establishment=ua.last_establishment.pk)

            else:
                loop.run_until_complete(cancel_pay(ua.bill_id))
                bill = loop.run_until_complete(create_link_to_pay(price))
                bill_link = bill['pay_url']
                bill_id = bill['bill'].bill_id

                ua.bill_id = bill_id
                ua.bill_months = month
                ua.save()
                return redirect(bill_link)

        else:
            bill = loop.run_until_complete(create_link_to_pay(price))
            bill_link = bill['pay_url']
            bill_id = bill['bill'].bill_id

            ua.bill_id = bill_id
            ua.bill_months = month
            ua.save()
            return redirect(bill_link)

    except RuntimeError as Error:
        logger.error(
            f'RuntimeError при открытии оплаты за {month} месяц\а\ев. Пользователь: {request.user}({request.user.pk}). Полное сообщение ошибки: {Error}')
        return JsonResponse({'status': 'error'})


@require_POST
def establishment_add(request):
    name_establishment = json.loads(request.body)['name']

    establishment = EstablishmentModel.objects.create(owner=request.user,
                                                      name=name_establishment)
    establishment.save()

    tg_start_code = base64.b64encode(str.encode(f'estbl_{establishment.pk}')).decode('utf-8')
    tg_link = f'https://t.me/lets_eatbot?start={tg_start_code}'
    tg_code = random.randint(10000, 99999)
    establishment.link_tg = tg_link
    establishment.tg_code = tg_code

    establishment.save()

    data = {
        'status': 'ok',
        'url_establishment': establishment.get_absolute_path()
    }
    return JsonResponse(data)


@require_POST
def establishment_rename(request):
    id_establishment = json.loads(request.body)['id_establishment']
    new_name = json.loads(request.body)['new_name']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    establishment.name = new_name
    establishment.save()

    data = {'status': 'ok'}
    return JsonResponse(data)


@require_POST
def establishment_edit_logo(request):
    id_establishment = request.POST['id_establishment']
    logo = request.FILES['new_logo']

    establishment = EstablishmentModel.objects.filter(owner=request.user,
                                                   pk=id_establishment).first()
    if establishment is not None:
        establishment.picture = logo
        establishment.save()
        path_img = '/' + '/'.join(establishment.picture.url.split('/')[-5:])
        return JsonResponse({
            'status': 'ok',
            'path_img': path_img,
        })
    else:
        return JsonResponse({'status': 'error'})


@require_POST
def establishment_add_tg(request):
    id_chat = str(json.loads(request.body)['id_chat'])
    id_establishment = json.loads(request.body)['id_establishment']

    establishment = EstablishmentModel.objects.filter(pk=id_establishment).first()
    if establishment is not None:
        if id_chat[0] != '-':
            establishment.telegram_chat = '-' + id_chat
        else:
            establishment.telegram_chat = id_chat

        try:
            establishment.save()
            tg = check_group(establishment.telegram_chat)
            if tg:
                establishment.save()
                data = {'status': 'ok'}
            else:
                logger.warning(
                    f'Пользователем: {request.user}(pk:{request.user.pk})'
                    f', заведение: {establishment.name}'
                    f'(pk:{establishment.pk}) Введён неверный id чата')
                return JsonResponse({'status': 'error'})
        except IntegrityError:
            return JsonResponse({'status': 'error'})
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@require_POST
def establishment_edit_tg(request):
    id_chat = str(json.loads(request.body)['id_chat'])
    id_establishment = json.loads(request.body)['id_establishment']

    establishment = EstablishmentModel.objects.filter(
        pk=id_establishment).first()
    if establishment is not None:
        establishment.telegram_chat = '-' + id_chat
        establishment.save()
        data = {'status': 'ok'}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@check_subscription
@require_POST
def new_qr(request):
    id_establishment = json.loads(request.body)['id_establishment']
    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)

    all_qr = QRCode.objects.filter(establishment=establishment).order_by(
        '-table')

    if len(all_qr) == 0:
        number_table = 1
    else:
        # first - last qr
        number_table = all_qr.first().table + 1

    # path to directory of qr codes this establishment
    path_qr = str(BASE_DIR / f'media/user_{request.user.pk}/establishment_' \
                             f'{establishment.pk}/qr_codes/')
    # URL that redirects to a link to this table's client page
    url = f'https://438511-cr02292.tmweb.ru/client_page/{establishment.pk}/{number_table}'

    # generate img of this table and get its path
    path_img = qr.build_qr(url, path_qr, str(number_table),
                           str(establishment.pk))

    qr_obj = QRCode.objects.create(establishment=establishment,
                                   table=number_table,
                                   qr_picture=path_img)
    qr_obj.save()

    data = {'status': 'ok',
            'pk': qr_obj.pk,
            'table': qr_obj.table}
    return JsonResponse(data)


@check_subscription
@require_POST
def delete_qr(request):
    id_table = json.loads(request.body)['id_table']
    id_establishment = json.loads(request.body)['id_establishment']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)

    del_qr = QRCode.objects.get(establishment=establishment, pk=id_table)
    print(del_qr.qr_picture)
    if Path.exists(Path(str(del_qr.qr_picture))):
        os.remove(str(del_qr.qr_picture))
    del_qr.delete()

    data = {'status': 'ok'}
    return JsonResponse(data)


@require_POST
def open_qr(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_qr = json.loads(request.body)['id_table']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    qr_obj = QRCode.objects.get(establishment=establishment, pk=id_qr)

    path_img = '/' + '/'.join(qr_obj.qr_picture.url.split('/')[-5:])

    data = {'path_img': path_img}
    return JsonResponse(data)


@check_subscription
@require_POST
def download_qrs_pdf(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_user = request.user.pk

    path_qr_codes = str(BASE_DIR / f'media/user_{id_user}/'
                                   f'establishment_{id_establishment}/qr_codes')
    path_save_pdf = str(BASE_DIR / f'media/user_{id_user}/'
                                   f'establishment_{id_establishment}/'
                                   f'qr_codes.pdf')

    pdf_func = download_pdf_zip.create_pdf(path_qr_codes, path_save_pdf)
    # Если возвращает true значит папка с qr кодами есть и всё ок
    if pdf_func:
        url_pdf: str = '/' + '/'.join(path_save_pdf.split('/')[-4:])

        data: dict = {'status': 'ok', 'path_pdf': url_pdf}
    else:
        data: dict = {'status': 'error'}
    return JsonResponse(data)


@check_subscription
@require_POST
def download_qrs_zip(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_user = request.user.pk

    path_qr_codes = str(BASE_DIR / f'media/user_{id_user}/'
                                   f'establishment_{id_establishment}/qr_codes')
    path_save_zip = str(BASE_DIR / f'media/user_{id_user}/'
                                   f'establishment_{id_establishment}/'
                                   f'qr_codes.zip')

    zip_func = download_pdf_zip.build_zip(path_qr_codes, path_save_zip)
    print(zip_func)
    # Аналогичная проврека как и для пдф
    if zip_func:
        url_zip: str = '/' + '/'.join(path_save_zip.split('/')[-4:])
        data: dict = {'status': 'ok', 'path_zip': url_zip}
    else:
        data: dict = {'status': 'error'}
    return JsonResponse(data)


@check_subscription
@require_POST
def add_category(request):
    id_establishment = json.loads(request.body)['id_establishment']
    new_category = str(json.loads(request.body)['name_category'])

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    category = CategoryDishesModel.objects.create(establishment=establishment,
                                                  name=new_category)
    category.save()

    data = {
        'status': 'ok',
        'pk': category.pk
    }
    return JsonResponse(data)


@check_subscription
@require_POST
def rename_category(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_category = json.loads(request.body)['id_category']
    new_name = str(json.loads(request.body)['new_name'])

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    category = CategoryDishesModel.objects.get(establishment=establishment,
                                               pk=id_category)
    category.name = new_name
    category.save()

    data = {
        'status': 'ok'
    }
    return JsonResponse(data)


@check_subscription
@require_POST
def delete_category(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_category = json.loads(request.body)['id_category']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    category = CategoryDishesModel.objects.get(establishment=establishment,
                                               pk=id_category)
    category.delete()

    data = {
        'status': 'ok'
    }
    return JsonResponse(data)


@check_subscription
@require_POST
def new_dish(request):
    if 'new_dish_picture' in request.FILES:
        picture = request.FILES['new_dish_picture']
    else:
        picture = None
    name: str = request.POST['new_dish_name']
    price: int = request.POST['new_dish_price']
    description: str = request.POST['new_dish_description']
    id_category: int = request.POST['id_category']

    category = CategoryDishesModel.objects.get(pk=id_category)

    dish = DishModel.objects.create(
        category=category,
        name=name,
        price=price,
        description=description
    )
    dish.save()
    if picture is not None:
        dish.dish_picture = picture
        dish.save()

        path_img = '/media/' + '/'.join(dish.dish_picture.url.split('/')[-5:])
    else:
        path_img = '/static/img/no-picture.jpg'

    data = {
        'status': 'ok',
        'pk': dish.pk,
        'path_img': path_img,
        'id_category': id_category,
    }

    return JsonResponse(data)


@check_subscription
@require_POST
def edit_dish(request):
    name = json.loads(request.body)['name_dish']
    price = json.loads(request.body)['price']
    description = json.loads(request.body)['description']
    id_dish = json.loads(request.body)['id_dish']

    dish = DishModel.objects.filter(pk=id_dish).first()
    if dish is not None:
        if name:
            dish.name = name
        if price:
            dish.price = price
        if description:
            dish.description = description
        dish.save()
        data = {'status': 'ok'}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@check_subscription
@require_POST
def edit_dish_picture(request):
    name: str = request.POST['edit_dish_name']
    price: int = request.POST['edit_dish_price']
    description: str = request.POST['edit_dish-description']
    picture = request.FILES['edit_dish_picture']
    id_dish: int = request.POST['id_dish']

    dish = DishModel.objects.get(pk=id_dish)
    dish.name = name
    dish.price = price
    dish.description = description
    dish.dish_picture = picture

    dish.save()

    path_img = '/media/' + '/'.join(dish.dish_picture.url.split('/')[-5:])

    data = {
        'status': 'ok',
        'path_img': path_img,
    }

    return JsonResponse(data)


@check_subscription
@require_POST
def delete_dish(request):
    id_dish = json.loads(request.body)['id_dish']

    dish = DishModel.objects.filter(pk=id_dish).first()
    if dish is not None:
        dish.delete()
        data = {'status': 'ok'}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@check_subscription
@require_POST
def new_button(request):
    name = json.loads(request.body)['name']
    text = json.loads(request.body)['text']
    id_establishment = json.loads(request.body)['id_establishment']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    all_buttons = ButtonModel.objects.filter(establishment=establishment)
    print(len(all_buttons))
    print(all_buttons)
    if len(all_buttons <= 3):
        if len(name) > 0 and len(text) > 0:
            button = ButtonModel.objects.create(
                establishment=establishment,
                name=name,
                text_button=text,
                enable=True,
            )
        button.save()
        pk_button = button.pk
        data = {'status': 'ok', 'pk': pk_button}
    else:
        data = {'status': 'error'}

    return JsonResponse(data)


@check_subscription
@require_POST
def delete_button(request):
    print(request.body)
    id_button = json.loads(request.body)['id_button']
    id_establishment = json.loads(request.body)['id_establishment']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    button = ButtonModel.objects.get(establishment=establishment,
                                     pk=id_button)
    button.delete()

    data = {'status': 'ok'}
    return JsonResponse(data)


@check_subscription
@require_POST
def rename_button(request):
    id_establishment = json.loads(request.body)['id_establishment']
    id_button = json.loads(request.body)['id_button']
    new_name = json.loads(request.body)['new_name']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    button = ButtonModel.objects.get(establishment=establishment,
                                     pk=id_button)
    button.name = new_name
    button.save()

    data = {'status': 'ok'}
    return JsonResponse(data)


@check_subscription
@require_POST
def button_edit_text(request):
    id_button = json.loads(request.body)['id_button']
    id_establishment = json.loads(request.body)['id_establishment']
    text_button = json.loads(request.body)['text_button']
    print(request.body)

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    button = ButtonModel.objects.get(establishment=establishment,
                                     pk=id_button)
    button.text_button = text_button
    button.save()

    data = {'status': 'ok'}
    return JsonResponse(data)


@check_subscription
@require_POST
def on_off_button(request):
    id_button = json.loads(request.body)['id_button']
    id_establishment = json.loads(request.body)['id_establishment']
    value = json.loads(request.body)['value']

    establishment = EstablishmentModel.objects.get(owner=request.user,
                                                   pk=id_establishment)
    button = ButtonModel.objects.get(establishment=establishment,
                                     pk=id_button)
    button.enable = value
    button.save()

    print(id_button, id_establishment, value)

    data = {'status': 'ok'}
    return JsonResponse(data)
