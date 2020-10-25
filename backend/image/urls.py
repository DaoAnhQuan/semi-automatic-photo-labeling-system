from django.urls import path
from image.views import ImageDetail, Upload, Image_Of_Project, MemberList, LabelList, ImageDetection, ExportData, UpdateLabelProject, DeleteImage, ReviewImage, ReviewResult
urlpatterns = [
    path('api/getLabelingInfo/<int:projectId>/<int:imageId>/', ImageDetail.as_view()),
    path('api/changeLabel/<int:imageId>/', ImageDetail.as_view()),
    path('api/upload/<int:projectId>', Upload.as_view()),
    path('api/listImage/<int:projectId>', Image_Of_Project.as_view()),
    path('api/memberList/<int:projectId>', MemberList.as_view()),
    path('api/labelList/<int:projectId>', LabelList.as_view()),
    path('api/imageDetect/<int:projectId>/<int:imageId>/',
         ImageDetection.as_view()),
    path('api/export/<int:projectId>/', ExportData.as_view()),
    path('api/updateLabel/<int:projectId>/', UpdateLabelProject.as_view()),
    path('api/deleteImage/<int:imageId>', DeleteImage.as_view()),
    path('api/reviewImage/<int:imageId>/<int:userId>', ReviewImage.as_view()),
    path('api/getReviewResult/<int:projectId>/<int:userId>', ReviewResult.as_view())
]
