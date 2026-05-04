from rest_framework import serializers
from .models import Dossier


class DossierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dossier
        fields = '__all__'
        read_only_fields = ['id', 'date_creation']
