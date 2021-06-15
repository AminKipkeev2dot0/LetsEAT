from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.contrib.postgres.fields import ArrayField

from easy_thumbnails.fields import ThumbnailerImageField


def user_directory_path(instance, filename):
    return 'user_{0}/establishment_{1}/logo/{2}'.format(
        instance.owner.pk, instance.pk, filename
    )


def directory_path_dish(instance, filename):
    return 'user_{0}/establishment_{1}/dishes/dish_{2}/{3}'.format(
        instance.category.establishment.owner.pk,
        instance.category.establishment.pk,
        instance.pk, filename
    )


def directory_path_qr(instance):
    return 'user_{0}/establishment_{1}/qrs/{2}'.format(
        instance.establishment.owner.pk, instance.pk,
        instance.table
    )


class EstablishmentModel(models.Model):
    owner = models.ForeignKey(User, related_name='user_establishment',
                              on_delete=models.CASCADE)
    name = models.CharField(max_length=100, db_index=True)
    picture = ThumbnailerImageField(upload_to=user_directory_path,
                                    resize_source=dict(quality=90,
                                                       size=(1024, 1024),
                                                       sharpen=True),
                                    blank=True, null=True)
    telegram_chat = models.CharField(max_length=20, db_index=True,
                                     blank=True, null=True, unique=True)

    def __str__(self):
        return self.name

    def get_absolute_path(self):
        return reverse('personal_area', args=[self.pk])


class QRCode(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_qr',
                                      on_delete=models.CASCADE)
    table = models.IntegerField(db_index=True)
    qr_picture = models.ImageField(upload_to=directory_path_qr)

    def __str__(self):
        return f'Столик: {self.table} Заведение: {self.establishment.name}'


class ButtonModel(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_button',
                                      on_delete=models.CASCADE)
    name = models.CharField(max_length=30, db_index=True)
    text_button = models.TextField(max_length=200, db_index=True)
    enable = models.BooleanField()

    def __str__(self):
        return f'Кнопка: {self.name} Заведение: {self.establishment.name}'


class CategoryDishesModel(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_category',
                                      on_delete=models.CASCADE)
    name = models.CharField(max_length=30, db_index=True)

    def __str__(self):
        return f'Категория: {self.name} Заведение: {self.establishment.name}'


class DishModel(models.Model):
    category = models.ForeignKey(CategoryDishesModel,
                                 related_name='category_dish',
                                 on_delete=models.CASCADE)
    name = models.CharField(max_length=50, db_index=True)
    price = models.IntegerField(db_index=True)
    description = models.TextField(max_length=300, db_index=True)
    dish_picture = ThumbnailerImageField(upload_to=directory_path_dish,
                                         resize_source=dict(quality=91,
                                                            size=(1024, 1024),
                                                            sharpen=True),
                                         blank=True, null=True)

    available = models.BooleanField(default=True)

    def __str__(self):
        return f'Блюдо: {self.name}'


class CommentModel(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_comment',
                                      on_delete=models.CASCADE)
    number_table = models.IntegerField(db_index=True, null=True)
    text_comment = models.TextField(max_length=200, db_index=True)
    rate = models.IntegerField(db_index=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'Рейтинг: {self.rate} Дата: {self.date} Заведение: {self.establishment.name}'


class StatisticModel(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_stat',
                                      on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    waiter = models.IntegerField(db_index=True, default=0)
    menu = models.IntegerField(db_index=True, default=0)
    feedback = models.IntegerField(db_index=True, default=0)
    users_session_key = ArrayField(models.CharField(max_length=50), blank=True)
    count_users = models.IntegerField(db_index=True, default=0)

    def __str__(self):
        return f'Статистика заведения: {self.establishment.name} за: {self.date}'


class StatisticMonthModel(models.Model):
    establishment = models.ForeignKey(EstablishmentModel,
                                      related_name='establishment_stat_month',
                                      on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    count_users = models.IntegerField(db_index=True, default=0)

    def __str__(self):
        return f'Статистика заведения: {self.establishment.name} ' \
               f'за месяц: {self.date}'


class UserAdvanced(models.Model):
    user = models.ForeignKey(User, related_name='user_advanced',
                             on_delete=models.CASCADE)
    last_establishment = models.ForeignKey(EstablishmentModel,
                                           related_name='establishment',
                                           on_delete=models.CASCADE,
                                           blank=True, null=True)
    subscription = models.BooleanField(default=False)
    subscription_date = models.DateTimeField(blank=True, null=True)
    bill_id = models.CharField(max_length=150, blank=True)
    bill_months = models.IntegerField(blank=True, null=True)
    trial = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username


class VideoModel(models.Model):
    html_code = models.TextField()
    title = models.CharField(max_length=250)

    def __str__(self):
        return f'Видео: {self.title}'
