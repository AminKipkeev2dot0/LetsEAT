# Generated by Django 3.2.3 on 2021-06-02 14:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0010_commentmodel_number_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='commentmodel',
            name='date',
            field=models.DateField(auto_now_add=True),
        ),
    ]