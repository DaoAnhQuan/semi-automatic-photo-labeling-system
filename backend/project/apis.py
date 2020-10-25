from rest_framework.response import Response
from rest_framework import generics, permissions, status
from . import serializers
from .models import Project, Member
from django.core.paginator import Paginator
from utils import mailers
from user.serializers import UserSerializer
from image.serializers import LabelSerializer
from rest_framework.views import APIView
from django.http import JsonResponse
from image.models import Image


class ProjectListAPI(generics.ListAPIView):
    """
    Authentication required
    Description: get a list of projects for a user
    Input: request.data['page'] for the pagination
    Return list of projects (id, href, project name, description, created date,
    created by (id, email, username, organization), label type)
    """
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = serializers.ProjectSerializer

    def get_queryset(self):
        projects = Member.objects.filter(
            member=self.request.user, disable=False).values_list('project_id', flat=True)
        queryset = Project.objects.filter(pk__in=set(projects), disable=False)
        self.total = queryset.count()
        paginator = Paginator(queryset, 10)
        queryset = paginator.page(self.request.query_params['page'])
        return queryset

    def list(self, request, *args, **kwargs):
        if 'page' not in request.query_params.keys():
            return Response({
                'res': 'Invalid request'
            })
        queryset = self.get_queryset()
        serializer = serializers.ProjectSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response({
            'projects': serializer.data,
            'total': self.total
        })


class ProjectDetailAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, *args, **kwargs):
        project_id = request.query_params['project_id']
        try:
            project = Project.objects.get(pk=project_id, disable=False)
        except:
            return Response({
                'error': "Project does not exist"
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'project': serializers.ProjectSerializer(project, context=self.get_serializer_context()).data
            })


class FindProjectAPI(generics.ListAPIView):
    """
    Authentication required
    Description: find project with keyword, search in fields (project name, description)
    Input:  request.data['page'] for the pagination
            request.data['keyword'] for searching
    Return list of projects (id, href, project name, description, created date,
    created by (id, email, username, organization), label type)
    """
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = serializers.ProjectSerializer

    def get_queryset(self):
        projects = Member.objects.filter(
            member=self.request.user, disable=False).values_list('project_id', flat=True)
        queryset = Project.objects.search(self.request.query_params['keyword']).filter(
            pk__in=set(projects), disable=False)
        self.total = queryset.count()
        paginator = Paginator(queryset, 10)
        queryset = paginator.page(self.request.query_params['page'])
        return queryset

    def list(self, request, *args, **kwargs):
        keys = request.query_params.keys()
        if ('page' not in keys) or ('keyword' not in keys):
            return Response({
                'res': 'Invalid request'
            })
        queryset = self.get_queryset()
        serializer = serializers.ProjectSerializer(queryset, context=self.get_serializer_context(), many=True)
        return Response({
            'projects': serializer.data,
            'total': self.total
        })


class CreateProjectNameAPI(generics.GenericAPIView):
    """
    Authentication required
    Description: Create a new project with project name and description
    Input:  request.data['project_name']
            request.data['description']
    Return a new project (id, href, project name, description, created date,
    created by(id, email, username, organization), label type = null)
    """
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.CreateProjectNameSeralizer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.validated_data

        return Response({
            "project": serializers.ProjectSerializer(project, context=self.get_serializer_context()).data
        })


class LeaveProjectAPI(generics.GenericAPIView):
    """
    Authentication required
    Description: Member leave project
    Input: request.data['project_id']
    Return 'OK'
    Exception: Member isn't in the project or Member is admin of the project return Invalid request
    """
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.LeaveProjectSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.validated_data
        mailers.send_leaving_project_mail(request.user, project)

        return Response({
            "project": serializers.ProjectSerializer(project, context=self.get_serializer_context()).data
        })


class AddMemberAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.AddMemberSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.validated_data
        mailers.send_mail_to_new_member(member)

        return Response({
            "member": UserSerializer(member.member, context=self.get_serializer_context()).data
        })


class AddLabelAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.AddLabelSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        label = serializer.validated_data

        return Response({
            'label': LabelSerializer(label, context=self.get_serializer_context()).data
        })


class UpdateLabelTypeAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.UpdateLabelType

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.validated_data

        return Response({
            "project": serializers.ProjectSerializer(project, context=self.get_serializer_context()).data
        })


class UpdateLabelAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.UpdateLabel

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        label = serializer.validated_data
        print(request)
        return Response({
            'label': LabelSerializer(label, context=self.get_serializer_context()).data
        })


class DeleteLabelAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.DeleteLabel

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK'
        })


class DeleteMemberAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.DeleteMember

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK'
        })


class CreateLabelsAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.CreateLabelsSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'res': 'OK'
        })


class CreateMembersAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.CreateMembersSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        members_not_found = serializer.validated_data

        return Response({
            'members_not_found': members_not_found
        })


class UpdateProjectInfo(APIView):
    def post(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId)
        # print(request)
        name, info = request.data["name"], request.data["info"]
        # print(name, info)
        project.project_name = name
        project.description = info
        project.save()
        return JsonResponse({"res": "OK"})


class AssignmentListAPI(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.MemberSerializer

    def get_queryset(self):
        self.project = Project.objects.get(pk=self.request.query_params['project_id'])
        members = Member.objects.filter(project=self.project, disable=False)
        return members

    def list(self, request, *args, **kwargs):
        if 'project_id' not in request.query_params.keys():
            return Response({
                'error': 'Can not read project_id property'
            }, status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset()
        serializer = serializers.MemberSerializer(queryset, context=self.get_serializer_context(), many=True)
        admin = Member.objects.get(project=self.project, member=self.project.created_by)
        max_image_assignment = Image.objects.filter(labeler=admin, disable=False).count()
        return Response({
            'members': serializer.data,
            'max_image_assignment': max_image_assignment
        })


class AddAssignmentsAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.AddAssignmentSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)


class OverviewAdminAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.OveriewAdminSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = serializer.validated_data

        return Response(res)


class OverviewMemberPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.OverviewMemberSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = serializer.validated_data

        return Response(res)


class DeleteProjectAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = serializers.DeleteprojectSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            'res': 'OK'
        })

class DeleteMembersAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.DeleteMemberSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            'res':'OK'
        })
