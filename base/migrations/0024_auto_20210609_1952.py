# Generated by Django 3.2.3 on 2021-06-09 19:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0023_auto_20210609_0909'),
    ]

    operations = [
        migrations.AddField(
            model_name='useradvanced',
            name='bill_months',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='useradvanced',
            name='subscription_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]