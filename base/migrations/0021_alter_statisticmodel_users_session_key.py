# Generated by Django 3.2.3 on 2021-06-08 08:17

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0020_rename_users_session_id_statisticmodel_users_session_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statisticmodel',
            name='users_session_key',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=50), blank=True, size=None),
        ),
    ]
