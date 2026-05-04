from django.utils import timezone
from rest_framework import serializers

from .models import Dossier


class DossierSerializer(serializers.ModelSerializer):
    type_travaux = serializers.CharField(max_length=50)

    class Meta:
        model = Dossier
        fields = '__all__'
        read_only_fields = ['id', 'date_creation']

    def validate_type_travaux(self, value):
        value = value.strip().upper()
        valid = [c[0] for c in Dossier.TYPE_TRAVAUX_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(
                f"Type invalide. Valeurs acceptées : {', '.join(valid)}"
            )
        return value

    def validate(self, data):
        beneficiaire = data.get('beneficiaire')
        type_travaux = data.get('type_travaux')
        if beneficiaire and type_travaux:
            today = timezone.now().date()
            if Dossier.objects.filter(
                beneficiaire=beneficiaire,
                type_travaux=type_travaux,
                date_creation__date=today,
            ).exists():
                raise serializers.ValidationError(
                    "Un dossier avec ce bénéficiaire et ce type de travaux existe déjà aujourd'hui."
                )
        return data
