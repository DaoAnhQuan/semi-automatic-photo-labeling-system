from rest_framework import serializers
from .models import Project, Member
from user.serializers import UserSerializer
from django.conf import settings
from django.utils import timezone
from image.models import Image, Label
from user.models import User
from utils.mailers import send_mail_to_new_member
import threading


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()
    href = serializers.SerializerMethodField()
    created_date = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = [
            'id',
            'href',
            'project_name',
            'description',
            'created_date',
            'created_by',
            'label_type',
            'role'
        ]

    def get_href(self, obj):
        return "project/" + str(obj.id)

    def get_created_date(self, obj):
        return obj.created_at.date()

    def get_role(self, obj):
        if ('request' not in self.context.keys()):
            return -2
        request_user = self.context['request'].user
        admin_id = obj.created_by.id
        if request_user.id == admin_id:
            return 1
        else:
            try:
                member = Member.objects.get(member=request_user, project=obj, disable=False)
            except:
                return -1
            else:
                return 0


class MemberSerializer(serializers.ModelSerializer):
    member = UserSerializer()
    project = serializers.SerializerMethodField()
    number_image_labeler = serializers.SerializerMethodField()
    number_image_completed = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['id', 'member', 'project', 'number_image_completed', 'number_image_labeler']

    def get_project(self, obj):
        return ProjectSerializer(obj.project, context=self.context).data

    def get_number_image_labeler(self, obj):
        return get_number_image_for_labeler(obj.project, obj)

    def get_number_image_completed(self, obj):
        return Image.objects.filter(project=obj.project, labeler=obj, disable=False, completed=True).count()


class CreateProjectNameSeralizer(serializers.Serializer):
    project_name = serializers.CharField(max_length=100, allow_null=False)
    description = serializers.CharField(max_length=300, allow_blank=True)

    def validate(self, data):
        user = self.context['request'].user
        project = Project(
            project_name=data['project_name'],
            description=data['description'],
            created_at=timezone.now(),
            created_by=user,
            disable=False
        )
        project.save()
        member_relation = Member(member=user, project=project, disable=False)
        member_relation.save()
        return project


def change_image_labeler_to_admin(member_relation, project):
    admin = Member.objects.get(member=project.created_by, project=project)
    Image.objects.filter(labeler=member_relation).update(labeler=admin)


class LeaveProjectSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        user = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'])
            member_relation = Member.objects.get(member=user, project=project)
        except:
            raise serializers.ValidationError({
                'res': "Invalid request"
            })
        else:
            if (user.id == project.created_by.id) or project.disable:
                raise serializers.ValidationError({
                    'res': "Invalid request"
                })
            change_image_labeler_to_admin(member_relation, project)
            member_relation.disable = True
            member_relation.save()
            return project


class AddLabelSerializer(serializers.Serializer):
    # label_type = serializers.BooleanField(allow_null=False)
    label_name = serializers.CharField(allow_null=False)
    project_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        user = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'])
        except:
            raise serializers.ValidationError({
                'res': 'Invalid request',
            })
        else:
            if (user.id != project.created_by.id) or project.disable:
                raise serializers.ValidationError({
                    'res': 'Invalid request',
                })
            else:
                # project.label_type = data['label_type']
                # project.save()
                try:
                    Label.objects.get(project=project, label_name=data['label_name'], disable=0)
                except:
                    new_label = Label(label_name=str(data['label_name']), project=project, disable=0)
                    new_label.save()
                    return new_label
                else:
                    raise serializers.ValidationError({
                        'res': 'Label name already exists'
                    })


class AddMemberSerializer(serializers.Serializer):
    member_email = serializers.EmailField()
    project_id = serializers.IntegerField()

    def validate(self, data):
        admin = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'])
            member = User.objects.get(email=data['member_email'])
        except:
            raise serializers.ValidationError({
                'res': 'Invalid request'
            })
        else:
            if (member.id == project.created_by.id) or (admin.id != project.created_by.id) or project.disable:
                raise serializers.ValidationError({
                    'res': 'Invalid request'
                })

            if not member.is_active:
                raise serializers.ValidationError({
                    'res': 'Member is not active'
                })
            try:
                member_relation = Member.objects.get(member=member, project=project)
            except:
                new_member = Member(member=member, project=project)
                new_member.save()
                return new_member
            else:
                if member_relation.disable:
                    member_relation.disable = False
                    member_relation.save()
                    return member_relation
                else:
                    raise serializers.ValidationError({
                        'res': 'Invalid request'
                    })


class UpdateLabelType(serializers.Serializer):
    label_type = serializers.BooleanField(allow_null=False)
    project_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        admin = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project not found'
            })
        else:
            if admin.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            else:
                project.label_type = data['label_type']
                project.save()
                return project


class UpdateLabel(serializers.Serializer):
    label_id = serializers.IntegerField(allow_null=False)
    label_name = serializers.CharField(allow_null=False)

    def validate(self, data):
        admin = self.context['request'].user
        try:
            label = Label.objects.get(pk=data['label_id'], disable=0)
        except:
            raise serializers.ValidationError({
                'error': 'Label not found'
            })
        else:
            if admin.id != label.project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            else:
                label.label_name = data['label_name']
                label.save()
                return label


class DeleteLabel(serializers.Serializer):
    label_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        admin = self.context['request'].user
        try:
            label = Label.objects.get(pk=data['label_id'], disable=0)
        except:
            raise serializers.ValidationError({
                'error': 'Label not found'
            })
        else:
            if admin.id != label.project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            else:
                label.delete()
                return True


class DeleteMember(serializers.Serializer):
    member_id = serializers.IntegerField(allow_null=False)
    project_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        admin = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
            member = User.objects.get(pk=data['member_id'])
            member_relation = Member.objects.get(member=member, project=project, disable=False)
        except:
            raise serializers.ValidationError({
                'error': "Member or project does not exist"
            })
        else:
            if admin.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            change_image_labeler_to_admin(member_relation, project)
            member_relation.disable = True
            member_relation.save()
            return True


class CreateLabelsSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(allow_null=False)
    label_list = serializers.ListField()

    def validate(self, data):
        admin = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project does not exist'
            })
        else:
            if admin.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            else:
                for label in data['label_list']:
                    new_label = Label(label_name=str(label), project=project, disable=0)
                    new_label.save()
                return project


class CreateMembersSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(allow_null=False)
    members = serializers.ListField()

    def validate(self, data):
        admin = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project does not exist'
            })
        else:
            if admin.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': "You do not have permission"
                })
            else:
                members_not_found = []
                for member in data['members']:
                    try:
                        user = User.objects.get(email=member, is_active=True)
                    except:
                        members_not_found.append(member)
                    else:
                        new_member = Member(member=user, project=project)
                        new_member.save()
                        threading.Thread(target=send_mail_to_new_member, args=(new_member,)).start()
                return members_not_found


def get_number_incompleted_images(project, labeler):
    return Image.objects.filter(project=project, labeler=labeler, completed=False, disable=False).count()


def get_number_image_for_labeler(project, labeler):
    return Image.objects.filter(project=project, labeler=labeler, disable=False).count()


class AddAssignmentSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(allow_null=False)
    number_images = serializers.IntegerField(allow_null=False)
    member_id = serializers.IntegerField(allow_null=False)

    def validate(self, data):
        print(data['number_images'])
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
            member = Member.objects.get(pk=data['member_id'], disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'project_id or member_id does not exist'
            })
        else:
            admin = Member.objects.get(project=project, member=project.created_by)
            max_number_image = get_number_image_for_labeler(project, admin)
            number_incomplete_admin = get_number_incompleted_images(project, admin)
            number_incomplete_member = get_number_incompleted_images(project, member)
            num_images_member = get_number_image_for_labeler(project, member)
            number_images_changed = data['number_images']
            if number_images_changed < 0:
                if number_images_changed + number_incomplete_member >= 0:
                    ids = Image.objects.filter(labeler=member, completed=False, disable=False).values_list('pk',
                                                                                                           flat=True)[
                          :0 - number_images_changed]
                    Image.objects.filter(pk__in=list(ids)).update(labeler=admin)
                else:
                    Image.objects.filter(labeler=member, completed=False, disable=False).update(labeler=admin)
                    ids = Image.objects.filter(labeler=member, completed=True, disable=False).values_list('pk',
                                                                                                          flat=True) \
                        [:0 - (number_images_changed + number_incomplete_member)]
                    Image.objects.filter(pk__in=list(ids)).update(labeler=admin)
            else:
                if number_images_changed <= number_incomplete_admin:
                    ids = Image.objects.filter(labeler=admin, completed=False, disable=False)[
                          :number_images_changed].values_list('pk', flat=True)
                    Image.objects.filter(pk__in=list(ids)).update(labeler=member)
                else:
                    Image.objects.filter(labeler=admin, completed=False, disable=False).update(labeler=member)
                    ids = Image.objects.filter(labeler=admin, completed=True, disable=False).values_list('pk',
                                                                                                         flat=True)[
                          :number_images_changed - number_incomplete_admin]
                    Image.objects.filter(pk__in=list(ids)).update(labeler=member)
            return {
                'max_image_assignment': get_number_image_for_labeler(project, admin),
                'number_image_labeler': get_number_image_for_labeler(project, member),
                'number_image_incomplete': get_number_incompleted_images(project, member),
                'number_incomplete_admin': get_number_incompleted_images(project, admin),
            }


class OverviewMemberSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
            member = Member.objects.get(project=project, member=user, disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project does not exist or member is not belong to this project'
            })
        else:
            submitted = Image.objects.filter(labeler=member, completed=True, disable=False).count()
            available = Image.objects.filter(labeler=member, completed=False, disable=False).count()

            return {
                'available': available,
                'submitted': submitted
            }


class OveriewAdminSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
            member = Member.objects.get(project=project, member=user, disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project does not exist or member is not belong to this project'
            })
        else:
            if user.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': 'You do not have permission'
                })
            else:
                members = Member.objects.filter(project=project, disable=False).count()
                image = Image.objects.filter(project=project, disable=False).count()
                label = Label.objects.filter(project=project, disable=False).count()
                submitted = Image.objects.filter(project=project, completed=True, disable=False).count()
                available = Image.objects.filter(project=project, completed=False, disable=False).count()
                return {
                    'member': members,
                    'image': image,
                    'label': label,
                    'submitted': submitted,
                    'available': available
                }


class DeleteprojectSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context['request'].user
        try:
            project = Project.objects.get(pk=data['project_id'], disable=False)
        except:
            raise serializers.ValidationError({
                'error': 'Project does not exist'
            })
        else:
            if user.id != project.created_by.id:
                raise serializers.ValidationError({
                    'error': 'You do not have permission'
                })
            else:
                project.delete()
            return True


class DeleteMemberSerializer(serializers.Serializer):
    members = serializers.ListField()

    def validate(self, data):
        for member in data['members']:
            mem = Member.objects.get(pk=member)
            change_image_labeler_to_admin(mem, mem.project)
            mem.disable = True
            mem.save()
        return True
