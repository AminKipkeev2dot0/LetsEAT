# Generated by Django 3.2.3 on 2021-06-08 08:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0018_alter_statisticmodel_users_ip'),
    ]

    operations = [
        migrations.RenameField(
            model_name='statisticmodel',
            old_name='users_ip',
            new_name='users_session_id',
        ),
    ]
