import uuid
from django.db import models


class Dossier(models.Model):
    TYPE_TRAVAUX_CHOICES = [
        ('ISOLATION', 'Isolation'),
        ('CHAUFFAGE', 'Chauffage'),
        ('POMPE À CHALEUR', 'Pompe à chaleur'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    beneficiaire = models.CharField(max_length=255)
    type_travaux = models.CharField(max_length=100)
    volume = models.FloatField()
    prime = models.FloatField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.beneficiaire} – {self.type_travaux}"
