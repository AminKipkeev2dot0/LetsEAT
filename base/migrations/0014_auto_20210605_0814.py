# Generated by Django 3.2.3 on 2021-06-05 08:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0013_auto_20210604_0906'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='establishmentmodel',
            name='link_tg',
        ),
        migrations.RemoveField(
            model_name='establishmentmodel',
            name='tg_code',
        ),
        migrations.AddField(
            model_name='establishmentmodel',
            name='telegram_chat',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True),
        ),
    ]
