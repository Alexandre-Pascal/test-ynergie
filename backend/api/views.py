from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Dossier
from .serializers import DossierSerializer


class DossierViewSet(viewsets.ModelViewSet):
    queryset = Dossier.objects.all().order_by('-date_creation')
    serializer_class = DossierSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_dossiers = Dossier.objects.count()
        aggregats = Dossier.objects.aggregate(
            somme_volumes=Sum('volume'),
            somme_primes=Sum('prime'),
        )
        somme_volumes = aggregats['somme_volumes'] or 0
        somme_primes = aggregats['somme_primes'] or 0

        prix_unitaire_moyen = (
            somme_primes / somme_volumes if somme_volumes else 0
        )

        return Response({
            'total_dossiers': total_dossiers,
            'somme_volumes': somme_volumes,
            'prix_unitaire_moyen': prix_unitaire_moyen,
        })
