# Generated by Django 3.2.3 on 2021-06-02 13:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0006_alter_dishmodel_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='buttonmodel',
            name='text_button',
            field=models.TextField(db_index=True, max_length=100),
        ),
    ]
