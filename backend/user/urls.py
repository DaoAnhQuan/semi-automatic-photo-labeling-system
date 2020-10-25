from django.urls import path, include
from . import apis
from knox import views as knox_views

urlpatterns = [
    path('api/register', apis.RegisterAPI.as_view()),
    path('api/login', apis.LoginAPI.as_view()),
    path('api/user', apis.UsersForTest.as_view()),
    path('api/logout', knox_views.LogoutView.as_view()),
    path('api/resend_confirmation_email', apis.SendAccountConfirmationCodeAPI.as_view()),
    path('api/check_confirmation', apis.CheckAccountConfirmationAPI.as_view()),
    path('api/userprofile', apis.UserProfile.as_view()),
    path('api/updateuserprofile', apis.UpdateUserProfileAPI.as_view()),
    path('api/changepassword', apis.ChangePasswordAPI.as_view()),
    path('api/sendresetpasswordcode', apis.SendResetPasswordCodeAPI.as_view()),
    path('api/checkresetpasswordcode', apis.CheckResetPasswordCodeAPI.as_view()),
    path('api/resetpassword', apis.ResetPasswordAPI.as_view()),
    path('api/checktoken', apis.CheckTokenAPI.as_view()),
    path('api/findmember', apis.FindMembersAPI.as_view()),
    path('api/checkmemberexists',apis.CheckMemberExistenceAPI.as_view()),
]
