from django import forms


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'placeholder': 'Ваш Email',
                                                            'class': 'form_user_email'}), label='')
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Ваш Пароль'}), label='')
    remember_me = forms.BooleanField(required=False, widget=forms.CheckboxInput(attrs={'checked': 'checked'}))


