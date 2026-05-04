from django.test import TestCase
from api.models import Dossier
from api.serializers import DossierSerializer


class DossierSerializerTest(TestCase):

    def _make_dossier(self, **kwargs):
        defaults = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'isolation',
            'volume': 100.0,
            'prime': 500.0,
        }
        defaults.update(kwargs)
        return Dossier.objects.create(**defaults)

    def test_serialization_contains_all_fields(self):
        dossier = self._make_dossier()
        data = DossierSerializer(dossier).data
        self.assertIn('id', data)
        self.assertIn('beneficiaire', data)
        self.assertIn('type_travaux', data)
        self.assertIn('volume', data)
        self.assertIn('prime', data)
        self.assertIn('date_creation', data)

    def test_id_and_date_creation_are_read_only(self):
        payload = {
            'id': '00000000-0000-0000-0000-000000000000',
            'beneficiaire': 'Marie Martin',
            'type_travaux': 'chauffage',
            'volume': 80.0,
            'prime': 400.0,
            'date_creation': '2000-01-01T00:00:00Z',
        }
        serializer = DossierSerializer(data=payload)
        self.assertTrue(serializer.is_valid())
        dossier = serializer.save()
        self.assertNotEqual(str(dossier.id), '00000000-0000-0000-0000-000000000000')

    def test_missing_beneficiaire_is_invalid(self):
        payload = {'type_travaux': 'isolation', 'volume': 100.0, 'prime': 500.0}
        serializer = DossierSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('beneficiaire', serializer.errors)

    def test_invalid_type_travaux_is_rejected(self):
        payload = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'pompe_a_chaleur',
            'volume': 100.0,
            'prime': 500.0,
        }
        serializer = DossierSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('type_travaux', serializer.errors)

    def test_missing_volume_is_invalid(self):
        payload = {'beneficiaire': 'Jean Dupont', 'type_travaux': 'isolation', 'prime': 500.0}
        serializer = DossierSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('volume', serializer.errors)
