import datetime

from django.conf import settings
from django.core import mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from base.models import StatisticModel, UserAdvanced, StatisticButton, \
    EstablishmentModel


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

    establishments = EstablishmentModel.objects.filter(
        date_subscribe__gte=pay_date,
        date_subscribe__lte=end_pay_date,
    )

    for establishment in establishments:
        owner_establishment = establishment.owner
        ua = UserAdvanced.objects.filter(user=owner_establishment)

        email_user = ua.user.email
        name_user = owner_establishment.first_name.split(' ')[0]
        sub_date = establishment.date_subscribe
        format_date_sub = f'{sub_date:%d.%m.%Y}'

        html_message = render_to_string('emails/notify_pay.html',
                                        {'name_user': name_user,
                                         'site': 'letseat.su',
                                         'date_sub': format_date_sub,
                                         'establishment': establishment,
                                         })
        plain_message = strip_tags(html_message)
        mail.send_mail('Напоминание об оплате', plain_message,
                       settings.DEFAULT_FROM_EMAIL, [email_user],
                       html_message=html_message)

    print(f'{datetime.datetime.now()}: Send notification about pay!')
