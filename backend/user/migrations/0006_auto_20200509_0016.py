# Generated by Django 3.0.5 on 2020-05-08 17:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0005_auto_20200509_0011'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='organization',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]