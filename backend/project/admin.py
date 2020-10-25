from django.contrib import admin
from .models import Project,Member

class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'project_name',
        'description',
        'created_at',
        'created_by',
        'label_type',
        'disable',
    ]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not(change):
            Member(member=obj.created_by, project=obj).save()



admin.site.register(Project,ProjectAdmin)
admin.site.register(Member)
