from django.contrib import admin

from .models import (UserAdvanced, EstablishmentModel, QRCode,
                     ButtonModel, CategoryDishesModel, DishModel,
                     CommentModel, StatisticModel, StatisticMonthModel,
                     VideoModel)


@admin.register(UserAdvanced)
class UserAdvancedAdmin(admin.ModelAdmin):
    list_display = ('user', 'last_establishment')


@admin.register(EstablishmentModel)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('table', 'establishment')


@admin.register(ButtonModel)
class ButtonAdmin(admin.ModelAdmin):
    list_display = ('name', 'establishment', 'text_button', 'enable')


@admin.register(CategoryDishesModel)
class CategoryDishesAdmin(admin.ModelAdmin):
    list_display = ('name', 'establishment')


@admin.register(DishModel)
class DishAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')


@admin.register(CommentModel)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'number_table', 'rate', 'date')


@admin.register(StatisticModel)
class StatisticAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'date')


@admin.register(StatisticMonthModel)
class StatisticMonthAdmin(admin.ModelAdmin):
    list_display = ('establishment', 'date')


@admin.register(VideoModel)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title',)
