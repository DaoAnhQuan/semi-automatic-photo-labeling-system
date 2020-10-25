from rest_framework import serializers
from .models import Image, Checker, Shape, Label, Member
from project.serializers import MemberSerializer

class ShapeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shape
        fields = [
            'coordinate',
            'image',
            'label'
        ]

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = [
            'id',
            'label_name',
            'project'
        ]

class ImageSerializer(serializers.ModelSerializer):
    checker = serializers.StringRelatedField(many=True, read_only=True)
    labeler = serializers.SerializerMethodField()
    shapes = ShapeSerializer(many=True, read_only=True)
    class Meta:
        model = Image
        fields = '__all__'
    def get_labeler(self,obj):
        return MemberSerializer(obj.labeler,context=self.context).data

class CheckerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checker
        fields = [
            'image',
            # 'user',
            'result',
            'changed',
        ]
