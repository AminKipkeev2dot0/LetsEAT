import datetime

from django.conf import settings
from django.core import mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from base.models import StatisticModel, UserAdvanced, StatisticButton


def my_scheduled_job():
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)

    statistic_objects = StatisticModel.objects.filter(
        users_session_key__len__gt=0,
        date__lt=today,
        date__gte=yesterday)
    for stat_obj in statistic_objects:
        stat_obj.users_session_key = []
        stat_obj.save()

    print(f'{datetime.datetime.now()}: Clear temp session keys!')


def clear_old_statistic():
    today = datetime.date.today()
    sixteen_days_ago = today - datetime.timedelta(days=60)

    statistic_objects = StatisticModel.objects.filter(
        date__lte=sixteen_days_ago
    )
    for stat_obj in statistic_objects:
        stat_obj.delete()

    print(f'{datetime.datetime.now()}: Clear old statistic!')


def clear_old_statistic_buttons():
    today = datetime.date.today()
    sixteen_days_ago = today - datetime.timedelta(days=60)

    statistic_objects = StatisticButton.objects.filter(
        date__lte=sixteen_days_ago
    )
    for stat_obj in statistic_objects:
        stat_obj.delete()

    print(f'{datetime.datetime.now()}: Clear old statistic of buttons!')


def send_notify_pay():
    today = datetime.date.today()
    pay_date = today + datetime.timedelta(days=3)
    end_pay_date = today + datetime.timedelta(days=4)
    # Выбираю юзеров, у которых подписка заканчивается через 2-3 дня
    ua_users = UserAdvanced.objects.filter(
        subscription_date__gte=pay_date,
        subscription_date__lte=end_pay_date,
    )
    print(ua_users)
    for ua in ua_users:
        print(ua)
        email_user = ua.user.email
        name_user = ua.user.first_name.split(' ')[0]
        ua_sub_date = ua.subscription_date
        format_date_sub = f'{ua_sub_date:%d.%m.%Y}'
        last_establishment = ua.last_establishment.pk

        html_message = render_to_string('emails/notify_pay.html',
                                        {'name_user': name_user,
                                         'site': '127.0.0.1:8000',
                                         'date_sub': format_date_sub,
                                         'establishment_pk': last_establishment,
                                         })
        plain_message = strip_tags(html_message)
        mail.send_mail('Напоминание об оплате', plain_message,
                       settings.DEFAULT_FROM_EMAIL, [email_user],
                       html_message=html_message)

    print(f'{datetime.datetime.now()}: Send notification about pay!')
