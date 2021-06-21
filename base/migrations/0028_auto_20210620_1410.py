# Generated by Django 3.2.4 on 2021-06-20 11:10

import base.models
from django.db import migrations, models
import django.db.models.deletion
import easy_thumbnails.fields


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0027_alter_establishmentmodel_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='establishmentmodel',
            name='email_user',
            field=models.EmailField(blank=True, db_index=True, max_length=200),
        ),
        migrations.AddField(
            model_name='statisticmodel',
            name='buttons',
            field=models.IntegerField(db_index=True, default=0),
        ),
        migrations.AlterField(
            model_name='dishmodel',
            name='dish_picture',
            field=easy_thumbnails.fields.ThumbnailerImageField(blank=True, null=True, upload_to=base.models.directory_path_dish),
        ),
        migrations.CreateModel(
            name='StatisticButton',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count_click', models.IntegerField(db_index=True, default=0)),
                ('date', models.DateField(blank=True, null=True)),
                ('button', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='button_stat_day', to='base.buttonmodel')),
                ('establishment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='establishment_stat_btn_day', to='base.establishmentmodel')),
            ],
        ),
    ]
