# Generated by Django 3.2.3 on 2021-06-03 11:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0011_alter_commentmodel_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='dishmodel',
            name='available',
            field=models.BooleanField(default=True),
        ),
    ]
