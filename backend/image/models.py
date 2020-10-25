from django.db import models
from project.models import Project, Member
from user.models import User


class Image(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="images"
    )
    labeler = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="images_labeled"
    )
    updater = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="images_updated",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    path = models.ImageField( blank=True,
                              null=True,
                              upload_to='images/%Y/%m/%d')
    uploaded_at = models.DateField()
    disable = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    


class Checker(models.Model):
    image = models.ForeignKey(
        Image,
        on_delete=models.CASCADE,
        related_name="checker"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="+"
    )
    result = models.IntegerField()
    changed = models.IntegerField()

class Label(models.Model):
    label_name = models.CharField(max_length=25)
    disable = models.IntegerField(default=0)

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="labels"
    )

    def __str__(self):
        return self.label_name
    


class Shape(models.Model):
    coordinate = models.TextField()
    image = models.ForeignKey(
        Image,
        on_delete=models.CASCADE,
        related_name="shapes"
    )
    label = models.ForeignKey(
        Label,
        on_delete=models.CASCADE,
        related_name="label_shapes"
    )

