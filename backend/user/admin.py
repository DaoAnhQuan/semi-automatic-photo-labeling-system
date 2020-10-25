from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import models
from .models import User
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils.crypto import get_random_string

class UserCreationForm(forms.ModelForm):
    email = forms.EmailField(label='Email',widget=forms.EmailInput)
    username = forms.CharField(label='User name',max_length=80,widget=forms.TextInput)
    password = forms.CharField(label='Password',min_length=8,widget=forms.PasswordInput)
    organization = forms.CharField(label='Organization', max_length=200,widget=forms.TextInput,required=False)
    is_active = forms.BooleanField(label='Is active',required=False)
    class Meta:
        model = User
        fields = (
            'email',
            'username',
            'password',
            'organization',
            'is_active',
        )
        exclude = ['date_joined']

    def save(self, commit=True):
        update_fields = [
            'password',
            'username',
            'email',
            'organization',
            'confirmation_code',
            'is_active',
        ]
        user = super(UserCreationForm,self).save(commit=False)
        user.set_password(self.cleaned_data["password"])
        user.username = self.cleaned_data["username"]
        user.email = self.cleaned_data["email"]
        user.organization =self.cleaned_data["organization"]
        user.confirmation_code = get_random_string(length=32)
        user.is_active = self.cleaned_data["is_active"]
        if commit:
            user.save()
        return user

class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('email','password','username','organization','is_active',)

    def clean_password(self):
        return  self.initial["password"]

class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    list_display = [
        'id',
        'email',
        'username',
        'password',
        'organization',
        'confirmation_code',
        'confirmation_sending_time',
        'reset_password_code',
        'rpc_sending_time',
        'date_joined',
        'last_login',
        'is_active',
    ]
    exclude = [
        'confirmation_code',
        'reset_password_code',
        'rpc_sending_time',
        'is_admin',
        'is_staff',
        'is_superuser',
        'date_joined',
        'last_login',
    ]
    fieldsets = (
        (None, {'fields':(
            'email',
            'username',
            'password',
            'organization',
            'is_active',
        )
        },),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'username',
                'password',
                'organization',
                'is_active',
            ),
            }
         ),
    )
    ordering = ('id',)
    filter_horizontal = ()
    list_filter = ()

admin.site.register(User,UserAdmin)
admin.site.unregister(models.Group)
