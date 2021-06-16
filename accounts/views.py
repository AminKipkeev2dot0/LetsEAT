import django.template
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.views import View
from django.views.generic.base import TemplateResponseMixin

from django.contrib.auth.forms import PasswordResetForm

from base.models import UserAdvanced
from .forms import LoginForm


class Login(TemplateResponseMixin, View):
    template_name = 'account/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('empty_personal_area')
        ctx = {
            'login_form': LoginForm(),
            'reset_form': PasswordResetForm(),
        }

        return self.render_to_response(ctx)

    def post(self, request):
        ctx: dict = {
            'login_form': LoginForm(),
        }
        if LoginForm(request.POST).is_valid():
            email = request.POST['email']
            password = request.POST['password']
            if 'remember_me' in request.POST:
                remember_me = True
            else:
                remember_me = False

            # Проверка есть ли юзер с таким email
            check_email: User = User.objects.filter(email=email).first()
            if check_email is None:
                ctx = ctx | {'error': 'Email или пароль был введён неверно'}
                return self.render_to_response(ctx)
            else:
                # Пользователь найден.
                user: User = authenticate(username=check_email.username, password=password)

                if user is None:
                    # Аутентификация не произошла из-за неверного пароля
                    if check_email.is_active:
                        ctx = ctx | {'error': 'Email или пароль был введён неверно'}
                        return self.render_to_response(ctx)
                    else:
                        ctx = ctx | {'error': 'Подтвердите ваш email открыв письмо, которое мы вам отправили'}
                        return self.render_to_response(ctx)
                else:
                    # Всё ок!
                    login(request, user)
                    ua = UserAdvanced.objects.get(user=request.user)
                    if ua.last_establishment is None:
                        return redirect('personal_area_start')
                    else:
                        return redirect(
                            'personal_area',
                            id_establishment=ua.last_establishment.pk
                        )


        else:
            # Юзер не правильно заполнил форму(ввёл емейл не в правильном формате
            ctx = ctx | {'error': 'Корректно заполните форму!'}
            return self.render_to_response(ctx)
