# Generated by Django 3.2.3 on 2021-06-07 22:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0016_statisticmodel'),
    ]

    operations = [
        migrations.RenameField(
            model_name='statisticmodel',
            old_name='pieces',
            new_name='users_ip',
        ),
    ]
