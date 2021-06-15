from django.urls import path

from . import views

urlpatterns = [
    path('feedback', views.feedback, name='get_feedback'),
    path('<int:id_establishment>/<int:number_table>',
         views.ClientPageMain.as_view(),
         name='client_page_main'),
    path('order', views.order, name='client_order'),
    path('get_menu', views.get_menu, name='get_menu'),
    path('telegram/waiter', views.telegram_waiter, name='telegram_waiter'),
    path('telegram/button', views.telegram_button, name='tg_button'),
    path('telegram/get_categories', views.telegram_categories,
         name='tg_categories'),
    path('telegram/get_dishes', views.telegram_dishes, name='tg_dishes'),
    path('telegram/edit_dish', views.edit_dish, name='tg_edit_dish'),
]
