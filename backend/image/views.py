from utils.libs.pascal_voc_io import PascalVocWriter
from utils.libs import split_dataset

from rest_framework import viewsets, status
from .models import Image, Shape, Project, Label, Member, Checker, User
from image.serializers import ImageSerializer, ShapeSerializer, LabelSerializer
from project.serializers import ProjectSerializer, MemberSerializer

from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView

from django.http import JsonResponse, HttpResponse
import json
from datetime import date
from PIL import Image as IMG
# type = 1 "bbox"
# type = 2 "polygon"
from imageai.Detection import ObjectDetection
import os
import zipfile
from zipfile import ZipFile
from os.path import basename
from os import remove


# execution_path = os.getcwd()

# detector = ObjectDetection()
# detector.setModelTypeAsYOLOv3()
# detector.setModelPath( os.path.join(execution_path , "yolo.h5"))
# detector.loadModel()
# detections = detector.detectObjectsFromImage(input_image=os.path.join(execution_path , "dogs.jpg"), output_image_path=os.path.join(execution_path , "dogs.jpg"), minimum_percentage_probability=30)

# for eachObject in detections:
#     print(eachObject["name"] , " : ", eachObject["percentage_probability"], " : ", eachObject["box_points"] )
#     print("--------------------------------")


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        image = self.get_object()
        image.completed = True
        image.save()
        # print(image)
        return Response({'status': 'marked OK'})


class ShapeViewSet(viewsets.ModelViewSet):
    queryset = Shape.objects.all()
    serializer_class = ShapeSerializer


class ImageDetail(APIView):

    def get(self, request, projectId, imageId, format=None):
        try:
            project = Project.objects.get(pk=projectId)
            image = Image.objects.get(pk=imageId)
        except project.DoesNotExist or image.DoesNotExist:
            return HttpResponse(status=404)

        labels = Label.objects.filter(project=projectId)
        jsonData = {}
        label_data = {}
        for label in labels:
            label_data[label.id] = []

        shapes = Shape.objects.filter(image=imageId)
        type = "bbox" if project.label_type == 1 else "polygon"
        for shape in shapes:
            points = shape.coordinate
            points = points.replace("\'", "\"")
            point_datas = json.loads(points)

            points = [{
                "lng": point['lng'],
                "lat": point['lat'],
            } for point in point_datas]

            label_data[shape.label.id].append({
                "id": str(shape.id),
                "type": type,
                "color": "red",
                "points": points,
                "tracingOptions": {
                    "trace": '',
                    "enable": False,
                    "smoothing": 1
                },
                "formId": 1
            })

        image = {
            "id": str(imageId),
            "originalName": str(image.name),
            "link": 'http://localhost:8000/media/{}'.format(image.path),
            "externalLink": '',
            "localPath": '',
            "labeled": str(image.completed),
            "labelData": {
                "labels": label_data,
            }
        }
        forms = []
        for label in labels:
            forms.append({
                "id": str(label.id),
                "type": type,
                "name": str(label.label_name)
            })
        jsonData['project'] = ProjectSerializer(
            project, context={'request': self.request}).data
        jsonData['project']['forms'] = forms

        jsonData['image'] = image
        return JsonResponse(jsonData)

    def post(self, request, imageId, format=None):
        image = Image.objects.get(pk=imageId)
        project = image.project
        labels = Label.objects.filter(project=project.id)
        data = request.data['labelData']['labels']

        shapes = Shape.objects.filter(image=image)
        shapes.delete()

        for label in labels:
            shapes = data[str(label.id)]
            for shape in shapes:
                coordinate = shape['points']
                s = Shape(coordinate=coordinate, image=image, label=label)
                s.save()

        return JsonResponse({"data": "ok"})


class Upload(APIView):

    def post(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId)
        admin = project.created_by
        admin_member = Member.objects.get(
            member=admin, project=project, disable=False)
        # print(request.data)
        for i in range(len(request.data)):
            img = request.data['images[{}]'.format(i)]
            # print(img)
            # name = 'image{}'.format(i)
            name = str(img)
            new_image = Image(
                name=name,
                project=project,
                labeler=admin_member,
                path=img,
                uploaded_at=date.today(),
                disable=False
            )
            new_image.save()

        # print("--------------------")
        return Response(data="ok")


class Image_Of_Project(APIView):
    def get(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId, disable=False)
        # print(request.GET["completed"])
        # print("===============================")
        userId = request.GET["user"]
        if userId == "-1":
            if request.GET["completed"] == "null":
                images = Image.objects.filter(
                    project=project, disable=False)
            else:
                completed = True if request.GET["completed"] == "true" else False
                images = Image.objects.filter(
                    project=project, completed=completed, disable=False)
        else:
            user = User.objects.get(pk=userId)
            member = Member.objects.get(
                member=user, project=project, disable=False)
            # print(user, user.id, project, project.id, member)

            if request.GET["completed"] in ["true", "false"]:
                completed = True if request.GET["completed"] == "true" else False
                images = Image.objects.filter(
                    project=project, labeler=member, completed=completed, disable=False)
            elif request.GET["completed"] == "null":
                images = Image.objects.filter(
                    project=project, labeler=member, disable=False)

        # print("===============================")
        imageSerializer = ImageSerializer(
            images, context={'request': self.request}, many=True)
        # print(imageSerializer.data)
        response = imageSerializer.data
        # get checkerResult
        #
        for image in images:
            noLike, noDislike = 0, 0
            checkers = Checker.objects.filter(
                image=image,
            )
            # result = -1 if len(checker) == 0 else checker[0].result
            for checker in checkers:
                if checker.result == 0:
                    noDislike += 1
                elif checker.result == 1:
                    noLike += 1
            print(noLike, noDislike)
            for imgSe in response:
                if imgSe["id"] == image.id:
                    imgSe["checker"] = None
                    imgSe["checker"] = [noLike, noDislike]
        return Response(response)


class MemberList(APIView):
    def get(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId)
        members = Member.objects.filter(project=project, disable=False)
        # print(members)
        data = []
        admin = -1
        for member in members:
            rowData = {}
            rowData['id'] = member.id
            rowData['name'] = member.member.username
            rowData['email'] = member.member.email
            rowData['num_photo'] = member.images_labeled.count()
            data.append(rowData)
            if project.created_by.id == member.member.id:
                admin = member.id

        return JsonResponse({"data": data, "admin" : admin}, safe=False)


class LabelList(APIView):

    def get(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId)
        labels = Label.objects.filter(project=project)
        response_data = []
        for label in labels:
            response_data.append({
                'id': label.id,
                'label': label.label_name,
                'num_shape': Shape.objects.filter(label=label).count(),
            })
        return JsonResponse(response_data, safe=False)


class ImageDetection(APIView):
    def get(self, request, projectId, imageId, format=None):
        try:
            project = Project.objects.get(pk=projectId)
            image = Image.objects.get(pk=imageId)
        except project.DoesNotExist or image.DoesNotExist:
            return HttpResponse(status=404)
        # print(project)
        # print(image)
        labels = Label.objects.filter(project=projectId)
        # print(labels)
        # print(project.label_type)
        if project.label_type == 1:
            currDir = os.getcwd()
            detector = ObjectDetection()
            detector.setModelTypeAsYOLOv3()
            detector.setModelPath(os.path.join(
                currDir, "image/image_auto/yolo.h5"))
            detector.loadModel()
            detections = detector.detectObjectsFromImage(input_image=os.path.join(currDir, "media/{}".format(
                image.path)), output_image_path=os.path.join(currDir, "out.jpg"), minimum_percentage_probability=30)
            for eachObject in detections:
                for label in labels:
                    if label.label_name.lower() == eachObject["name"].lower():
                        box = eachObject["box_points"]
                        coordinate = []
                        coordinate.append({
                            "lng": box[0],
                            "lat": box[1],
                        })
                        coordinate.append({
                            "lng": box[2],
                            "lat": box[3],
                        })
                        shape = Shape(
                            label=label,
                            image=image,
                            coordinate=coordinate
                        )
                        shape.save()
        jsonData = {}
        label_data = {}
        for label in labels:
            label_data[label.id] = []

        shapes = Shape.objects.filter(image=imageId)
        type = "bbox" if project.label_type == 1 else "polygon"
        for shape in shapes:
            points = shape.coordinate
            points = points.replace("\'", "\"")
            point_datas = json.loads(points)

            points = [{
                "lng": point['lng'],
                "lat": point['lat'],
            } for point in point_datas]

            label_data[shape.label.id].append({
                "id": str(shape.id),
                "type": type,
                "color": "red",
                "points": points,
                "tracingOptions": {
                    "trace": '',
                    "enable": False,
                    "smoothing": 1
                },
                "formId": 1
            })

        image = {
            "id": str(imageId),
            "originalName": str(image.name),
            "link": 'http://localhost:8000/media/{}'.format(image.path),
            "externalLink": '',
            "localPath": '',
            "labeled": str(image.completed),
            "labelData": {
                "labels": label_data,
            }
        }
        forms = []
        for label in labels:
            forms.append({
                "id": str(label.id),
                "type": type,
                "name": str(label.label_name)
            })
        jsonData['project'] = ProjectSerializer(
            project, context={'request': self.request}).data
        jsonData['project']['forms'] = forms

        jsonData['image'] = image
        return JsonResponse(jsonData)


class ExportData(APIView):
    def post(self, request, projectId, format=None):
        # print(request.data)
        list_image = request.data['images']
        # print(list_image)
        currDir = os.getcwd()
        for imageId in list_image:
            image = Image.objects.get(pk=imageId)
            url = os.path.join(currDir, 'media/{}'.format(image.path))
            img = IMG.open(url)
            # print(img)
            img.save(os.path.join(
                currDir, 'image/headsets/img_{}.jpg'.format(imageId)))
            vocWriter = PascalVocWriter(os.path.join(currDir, 'image/headsets'),
                                        os.path.join(
                                            currDir, 'image/headsets/img_{}.jpg'.format(imageId)),
                                        img.size
                                        )

            shapes = Shape.objects.filter(image=imageId)
            for shape in shapes:
                points = shape.coordinate
                points = points.replace("\'", "\"")
                points = json.loads(points)
                xmin = points[0]["lat"]
                xmax = points[0]["lng"]
                ymin = points[1]["lng"]
                ymax = points[1]["lat"]
                vocWriter.addBndBox(xmin, xmax, ymin, ymax,
                                    shape.label.label_name, 0)
            vocWriter.save()

        # Create zip file datasets
        split_dataset.iterate_dir(os.path.join(
            currDir, 'image/headsets'), os.path.join(currDir, 'image/headsets'), 0.1, True)
        remove(os.path.join(currDir, 'image/headsets/datasets.zip'))
        with ZipFile(os.path.join(currDir, 'image/headsets/datasets.zip'), 'w') as zipObj:
            # Iterate over all the files in directory
            for folderName, subfolders, filenames in os.walk(os.path.join(currDir, 'image/headsets')):
                if folderName == os.path.join(currDir, 'image/headsets'):
                    for filename in filenames:
                        # create complete filepath of file in directory
                        if filename == "datasets.zip":
                            continue
                        elif int(str(filename).split("_")[1].split(".")[0]) in list_image:
                            filePath = os.path.join(
                                currDir, 'image/headsets/{}'.format(filename))
                            # Add file to zip
                            zipObj.write(filePath, basename(filePath))
        response = HttpResponse(
            os.path.join(currDir, 'image/headsets/datasets.zip'),
            content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename={}'.format(
            "datasets.zip")
        return response


class UpdateLabelProject(APIView):
    def post(self, request, projectId, format=None):
        project = Project.objects.get(pk=projectId)
        label_type = request.data['label_type']
        label_list = request.data['label_list']
        project.label_type = 1 if label_type == 'bbox' else 2
        project.save()
        # print(project)
        for label_name in label_list:
            label = Label(label_name=label_name,
                          disable=False, project=project)
            label.save()
            print(label)
        # print(request.data)
        return JsonResponse({"status": "ok"})


class DeleteImage(APIView):
    def post(self, request, imageId, format=None):
        try:
            image = Image.objects.get(pk=imageId)
        except image.DoesNotExist:
            return HttpResponse(status=404)

        image.delete()
        return JsonResponse({"status": "deleted"})


class ReviewImage(APIView):
    def post(self, request, imageId, userId, format=None):
        image = Image.objects.get(pk=imageId)
        user = User.objects.get(pk=userId)
        # print(image, user)

        checkers = Checker.objects.filter(
            image=image,
            user=user
        )
        if len(checkers) == 0:
            checker = Checker(
                image=image,
                user=user,
                result=request.data["result"],
                changed=0
            )
            checker.save()
        else:
            checker = checkers[0]
            checker.result = request.data["result"]
            checker.save()
        # print(len(checker))
        # checker.save()
        return JsonResponse({"status": "ok"})


class ReviewResult(APIView):

    def get(self, request, projectId, userId, format=None):
        project = Project.objects.get(pk=projectId)
        user = User.objects.get(pk=userId)
        images = Image.objects.filter(project=project)
        response = {}
        response["data"] = []
        for image in images:
            # record = {}
            checker = Checker.objects.filter(
                image=image,
                user=user
            )
            result = -1 if len(checker) == 0 else checker[0].result
            response["data"].append({
                "image_id": image.id,
                "result": result
            })
        # print(response)
        # print(image.id)
        return JsonResponse(response)
