from django.db import models
from user.models import User
from django_fulltext_search import SearchManager


class Project(models.Model):
    objects = SearchManager(['project_name', 'description'])

    project_name = models.CharField(max_length=100, null=False)
    description = models.TextField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(null=False, auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_by')
    label_type = models.IntegerField(null=True, blank=True)
    disable = models.BooleanField(null=False, default=0)

    def __str__(self):
        return self.project_name

    def create(self, force_insert=False, force_update=False, using=None,
               update_fields=None):
        self.save(force_insert, force_update, using, update_fields)
        Member(project=self, member=self.created_by).save()


class Member(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='member_in')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_belong')
    disable = models.BooleanField(default=False, null=False)

    def __str__(self):
        return self.member.username + " in " + self.project.project_name
