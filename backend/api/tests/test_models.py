import uuid
from django.test import TestCase
from api.models import Dossier


class DossierModelTest(TestCase):

    def _make_dossier(self, **kwargs):
        defaults = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'ISOLATION',
            'volume': 100.0,
            'prime': 500.0,
        }
        defaults.update(kwargs)
        return Dossier.objects.create(**defaults)

    def test_uuid_auto_generated(self):
        dossier = self._make_dossier()
        self.assertIsNotNone(dossier.id)
        self.assertIsInstance(dossier.id, uuid.UUID)

    def test_str_representation(self):
        dossier = self._make_dossier(beneficiaire='Dupont', type_travaux='ISOLATION')
        self.assertEqual(str(dossier), 'Dupont – ISOLATION')

    def test_date_creation_auto_set(self):
        dossier = self._make_dossier()
        self.assertIsNotNone(dossier.date_creation)

    def test_all_type_travaux_choices_are_valid(self):
        valid_choices = ['ISOLATION', 'CHAUFFAGE', 'POMPE À CHALEUR']
        for choice in valid_choices:
            dossier = self._make_dossier(type_travaux=choice)
            self.assertEqual(dossier.type_travaux, choice)
