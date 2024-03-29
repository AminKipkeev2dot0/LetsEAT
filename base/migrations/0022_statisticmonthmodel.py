# Generated by Django 3.2.3 on 2021-06-08 17:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0021_alter_statisticmodel_users_session_key'),
    ]

    operations = [
        migrations.CreateModel(
            name='StatisticMonthModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(db_index=True)),
                ('count_users', models.IntegerField(db_index=True, default=0)),
                ('establishment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='establishment_stat_month', to='base.establishmentmodel')),
            ],
        ),
    ]
