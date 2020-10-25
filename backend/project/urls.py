from django.urls import path, include
from . import apis

urlpatterns = [
    path('api/projectlist', apis.ProjectListAPI.as_view()),
    path('api/findproject', apis.FindProjectAPI.as_view()),
    path('api/createprojectname', apis.CreateProjectNameAPI.as_view()),
    path('api/leaveproject', apis.LeaveProjectAPI.as_view()),
    path('api/addnewmember', apis.AddMemberAPI.as_view()),
    path('api/addlabel', apis.AddLabelAPI.as_view()),
    path('api/updatelabel', apis.UpdateLabelAPI.as_view()),
    path('api/updatelabeltype', apis.UpdateLabelTypeAPI.as_view()),
    path('api/deletelabel', apis.DeleteLabelAPI.as_view()),
    path('api/createlabels', apis.CreateLabelsAPI.as_view()),
    path('api/createmembers', apis.CreateMembersAPI.as_view()),
    path('api/updateProject/<int:projectId>', apis.UpdateProjectInfo.as_view()),
    path('api/getassignments', apis.AssignmentListAPI.as_view()),
    path('api/addassignments', apis.AddAssignmentsAPI.as_view()),
    path('api/projectdetail',apis.ProjectDetailAPI.as_view()),
    path('api/overviewadmin',apis.OverviewAdminAPI.as_view()),
    path('api/overviewmember',apis.OverviewMemberPI.as_view()),
    path('api/deleteproject',apis.DeleteProjectAPI.as_view()),
    path('api/deletemembers',apis.DeleteMembersAPI.as_view()),
]
