from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'organization')


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password',)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data['password']
        if (len(password) < 8):
            raise serializers.ValidationError({
                "password": "Password is too short",
            })
        user = User.objects.create_user(validated_data['email'], validated_data['username'], password)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        else:
            if user and not (user.is_active):
                raise serializers.ValidationError({
                    "error": "Account isn't verified",
                })
            else:
                raise serializers.ValidationError({
                    "error": "Email or password is incorrect",
                })


class ConfirmationAccountSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except:
            raise serializers.ValidationError({
                'res': "Email doesn't exist",
            })
        else:
            if user.is_active:
                raise serializers.ValidationError({
                    'res': "Account is active now",
                })
            else:
                user.confirmation_code = get_random_string(length=32)
                user.confirmation_sending_time = timezone.now()
                user.save()
                return user


class CheckConfirmationRequestSerialzer(serializers.Serializer):
    id = serializers.IntegerField()
    confirmation_code = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(pk=data['id'])
        except:
            raise serializers.ValidationError({
                'res': "Invalid request"
            })
        else:
            if (user.is_active) or (data['confirmation_code'] != user.confirmation_code) \
                    or ((timezone.now() - timedelta(
                seconds=settings.RESET_PASSWORD_EXPIRE_TIME)) > user.confirmation_sending_time):
                raise serializers.ValidationError({
                    'res': "Invalid request"
                })
            else:
                user.is_active = True
                user.save()
                return user


class UpdateUserProfileSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=80, allow_null=False)
    organization = serializers.CharField(max_length=300, allow_blank=True)

    def validate(self, data):
        user = self.context['request'].user
        if not (user):
            raise serializers.ValidationError({
                'error': 'Invalid request'
            })
        user.username = data['username']
        user.organization = data['organization']
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(min_length=8, allow_null=False)
    new_password = serializers.CharField(min_length=8, allow_null=False)

    def validate(self, data):
        user = self.context['request'].user
        if (user.check_password(data['old_password'])):
            if (user.check_password(data['new_password'])):
                raise serializers.ValidationError({
                    'res': "New password and old password are duplicate"
                })
            else:
                user.set_password(data['new_password'])
                user.save()
                return user
        else:
            raise serializers.ValidationError({
                'res': "Password is incorrect"
            })


class SendResetPasswordCode(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except:
            raise serializers.ValidationError({
                'res': "Invalid request"
            })
        else:
            user.reset_password_code = get_random_string(32)
            user.rpc_sending_time = timezone.now()
            user.save()
            return user


class CheckResetPasswordCodeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reset_password_code = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(pk=data['id'])
        except:
            raise serializers.ValidationError({
                'res': "Invalid request"
            })
        else:
            if (user.reset_password_code is None) or (data['reset_password_code'] != user.reset_password_code) \
                    or (
                    (timezone.now() - timedelta(seconds=settings.RESET_PASSWORD_EXPIRE_TIME)) > user.rpc_sending_time):
                raise serializers.ValidationError({
                    'res': "Invalid request"
                })
            else:
                return user


class ResetPasswordSerializer(serializers.Serializer):
    id = serializers.IntegerField(allow_null=False)
    reset_password_code = serializers.CharField(allow_null=False)
    password = serializers.CharField(min_length=8, allow_null=False)

    def validate(self, data):
        try:
            user = User.objects.get(pk=data['id'])
        except:
            raise serializers.ValidationError({
                'res': "Invalid request"
            })
        else:
            if (user.reset_password_code is None) or (data['reset_password_code'] != user.reset_password_code) \
                    or (
                    (timezone.now() - timedelta(seconds=settings.RESET_PASSWORD_EXPIRE_TIME)) > user.rpc_sending_time):
                raise serializers.ValidationError({
                    'res': "Reset password code is expired or invalid"
                })
            else:
                user.set_password(data['password'])
                user.reset_password_code = ""
                user.save()
                return user

class CheckMemberExistence(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'], is_active=True, is_admin=False)
        except:
            raise serializers.ValidationError({
                'error':"Member does not exist"
            })
        else:
            return True
