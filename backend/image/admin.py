from django.contrib import admin
from .models import Image, Label, Shape, Checker

# Register your models here.
admin.site.register(Image)
admin.site.register(Label)
admin.site.register(Shape)
admin.site.register(Checker)