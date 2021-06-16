from django import forms
from .models import EstablishmentModel


class CreateEstablishmentForm(forms.ModelForm):
    class Meta:
        labels = {
            'name': '',
            'picture': ''
        }
        help_texts = {
            'name': '',
            'picture': ''
        }
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Название заведения*', 'autofocus': True}),
            'picture': ''
        }
        model = EstablishmentModel
        fields = ('name', 'picture')


class CreateEstablishmentFormWithEmail(forms.ModelForm):
    class Meta:
        labels = {
            'email_user': '',
            'name': '',
            'picture': ''
        }
        help_texts = {
            'email_user': '',
            'name': '',
            'picture': ''
        }
        widgets = {
            'email_user': forms.TextInput(attrs={'placeholder': 'Введите ваш email*',
                                            'autofocus': True}),
            'name': forms.TextInput(attrs={'placeholder': 'Название заведения*'}),
            'picture': ''
        }
        model = EstablishmentModel
        fields = ('email_user', 'name', 'picture')
