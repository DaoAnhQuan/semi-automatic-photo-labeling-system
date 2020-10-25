from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.crypto import get_random_string
from django_fulltext_search import SearchManager


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")

        confirmation_code = get_random_string(length=32)

        user = self.model(
            email=self.normalize_email(email),
            password=password,
            username=username,
            confirmation_code=confirmation_code,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(
            email=self.normalize_email(email),
            password=password,
            username=username
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    objects = SearchManager(['username', 'email', 'organization'])

    email = models.EmailField(max_length=80, unique=True, null=False)
    username = models.CharField(max_length=80, null=False)
    organization = models.CharField(max_length=200, null=True, blank=True)
    confirmation_code = models.CharField(max_length=128, null=False)
    confirmation_sending_time = models.DateTimeField(auto_now_add=True)
    reset_password_code = models.CharField(max_length=128, null=True)
    rpc_sending_time = models.DateTimeField(null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', ]

    objects = UserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True
