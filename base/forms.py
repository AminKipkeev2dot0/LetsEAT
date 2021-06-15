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
