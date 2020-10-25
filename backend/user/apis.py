from rest_framework.response import Response
from rest_framework import generics, status, permissions
from . import serializers
from utils import mailers
from knox.models import AuthToken
from .models import User


class RegisterAPI(generics.GenericAPIView):
    serializer_class = serializers.RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(serializer)
        serializer.is_valid(raise_exception=True)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        mailers.send_confirmation_code(user)
        return Response(
            {
                "res": "OK",
            }
        )


class LoginAPI(generics.RetrieveAPIView):
    serializer_class = serializers.LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        if (user is not None) and (user.is_active):
            _, token = AuthToken.objects.create(user)
            return Response({
                'user': serializers.UserSerializer(user, context=self.get_serializer_context()).data,
                'token': token,
            })


class UsersForTest(generics.ListAPIView):
    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = serializers.UserSerializer(queryset, many=True)
        return Response(serializer.data)


class UserProfile(generics.RetrieveAPIView):
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = serializers.UserSerializer(request.user)
        return Response(serializer.data)


class SendAccountConfirmationCodeAPI(generics.RetrieveAPIView):
    serializer_class = serializers.ConfirmationAccountSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        mailers.send_confirmation_code(user)
        return Response({
            "res": "OK",
        })


class CheckAccountConfirmationAPI(generics.RetrieveAPIView):
    serializer_class = serializers.CheckConfirmationRequestSerialzer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        _, token = AuthToken.objects.create(user)
        return Response({
            'user': serializers.UserSerializer(user, context=self.get_serializer_context()).data,
            'token': token,
        })


class UpdateUserProfileAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.UpdateUserProfileSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        return Response({
            'user': serializers.UserSerializer(user, context=self.get_serializer_context()).data
        })


class ChangePasswordAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            'res': 'OK',
        })


class SendResetPasswordCodeAPI(generics.GenericAPIView):
    serializer_class = serializers.SendResetPasswordCode

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        mailers.send_reset_password_code(user)

        return Response({
            'res': 'OK',
        })


class CheckResetPasswordCodeAPI(generics.GenericAPIView):
    serializer_class = serializers.CheckResetPasswordCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK',
        })


class ResetPasswordAPI(generics.GenericAPIView):
    serializer_class = serializers.ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK',
        })


class CheckTokenAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        return Response({
            'res': 'OK'
        })


class FindMembersAPI(generics.ListAPIView):
    permissions = [permissions.IsAuthenticated, ]

    def get_queryset(self):
        queryset = User.objects.filter(email__icontains=self.request.query_params['keyword'], is_active=True,
                                       is_admin=False).exclude(pk=self.request.user.id)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = serializers.UserSerializer(queryset, context=self.get_serializer_context(), many=True)

        return Response({
            "members": serializer.data
        })


class CheckMemberExistenceAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.CheckMemberExistence

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK'
        })
