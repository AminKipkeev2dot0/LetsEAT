from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views
from client_pages.views import ClientPageMain

urlpatterns = [
    path('', views.HomePage.as_view(), name='home_page'),
    path('personal_area/start', views.PersonalAreaStart.as_view(),
         name='personal_area_start'),
    path('personal_area/<int:id_establishment>/', views.PersonalArea.as_view(),
         name='personal_area'),
    path('personal_area', views.EmptyPersonalArea.as_view(),
         name='empty_personal_area'),
    path('terms_of_use', views.TermsOfUse.as_view(), name='terms_of_use'),

    path('send_message', views.get_message_from_landing, name='send_message'),

    path('establishment/add', views.establishment_add,
         name='establishment_add'),
    path('establishment/rename',
         views.establishment_rename,
         name='establishment_rename'),
    path('establishment/edit_logo', views.establishment_edit_logo,
         name='establishment_edit_logo'),
    path('establishment/add_tg', views.establishment_add_tg,
         name='establishment_add_tg'),
    path('establishment/edit_tg', views.establishment_edit_tg,
         name='establishment_edit_tg'),
    path('establishment/work_online', views.establishment_work_online,
         name='establishment_work_online'),
    path('establishment/work_hall', views.establishment_work_hall,
         name='establishment_work_hall'),
    path('establishment/custom_link', views.establishment_custom_link,
         name='establishment_custom_link'),


    path('qr/new', views.new_qr, name='new_qr'),
    path('qr/delete', views.delete_qr, name='delete_qr'),
    path('qr/open_qr', views.open_qr, name='open_qr'),
    path('qr/download_qrs_pdf',
         views.download_qrs_pdf,
         name='download_qrs_pdf'),
    path('qr/download_qrs_zip',
         views.download_qrs_zip,
         name='download_qrs_zip'),


    path('menu/add_category', views.add_category, name='add_category'),
    path('menu/rename_category', views.rename_category, name='rename_category'),
    path('menu/delete_category', views.delete_category, name='delete_category'),
    path('menu/new_dish', views.new_dish, name='new_dish'),
    path('menu/edit_dish', views.edit_dish, name='edit_dish'),
    path('menu/edit_dish_picture',
         views.edit_dish_picture,
         name='edit_dish_picture'),
    path('menu/delete_dish', views.delete_dish, name='delete_dish'),


    path('button/add', views.new_button, name='new_button'),
    path('button/delete', views.delete_button, name='delete_button'),
    path('button/rename', views.rename_button, name='rename_button'),
    path('button/edit_text', views.button_edit_text, name='button_edit_text'),
    path('button/on_off', views.on_off_button, name='on_off_button'),

    path('pay/<int:month>', views.pay, name='pay'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
