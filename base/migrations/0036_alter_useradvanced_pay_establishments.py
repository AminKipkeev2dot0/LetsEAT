# Generated by Django 3.2.4 on 2021-06-21 05:04

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0035_alter_useradvanced_pay_establishments'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useradvanced',
            name='pay_establishments',
            field=django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=20, null=True), blank=True, size=None), blank=True, null=True, size=None),
        ),
    ]
