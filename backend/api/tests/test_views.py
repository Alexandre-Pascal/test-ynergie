from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Dossier


class DossierListCreateTest(APITestCase):

    def _make_dossier(self, **kwargs):
        defaults = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'isolation',
            'volume': 100.0,
            'prime': 500.0,
        }
        defaults.update(kwargs)
        return Dossier.objects.create(**defaults)

    def test_list_empty_returns_200(self):
        response = self.client.get('/api/dossiers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_list_returns_dossiers_in_reverse_chronological_order(self):
        d1 = self._make_dossier(beneficiaire='Premier')
        d2 = self._make_dossier(beneficiaire='Second')
        response = self.client.get('/api/dossiers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['beneficiaire'], 'Second')
        self.assertEqual(response.data[1]['beneficiaire'], 'Premier')

    def test_create_valid_dossier_returns_201(self):
        payload = {
            'beneficiaire': 'Marie Martin',
            'type_travaux': 'chauffage',
            'volume': 80.0,
            'prime': 400.0,
        }
        response = self.client.post('/api/dossiers/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(Dossier.objects.count(), 1)

    def test_create_invalid_type_travaux_returns_400(self):
        payload = {
            'beneficiaire': 'Marie Martin',
            'type_travaux': 'pompe_a_chaleur',
            'volume': 80.0,
            'prime': 400.0,
        }
        response = self.client.post('/api/dossiers/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('type_travaux', response.data)

    def test_create_missing_field_returns_400(self):
        payload = {'type_travaux': 'isolation', 'volume': 100.0}
        response = self.client.post('/api/dossiers/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DossierDetailTest(APITestCase):

    def _make_dossier(self, **kwargs):
        defaults = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'isolation',
            'volume': 100.0,
            'prime': 500.0,
        }
        defaults.update(kwargs)
        return Dossier.objects.create(**defaults)

    def test_retrieve_existing_dossier_returns_200(self):
        dossier = self._make_dossier()
        response = self.client.get(f'/api/dossiers/{dossier.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['beneficiaire'], 'Jean Dupont')

    def test_retrieve_unknown_uuid_returns_404(self):
        response = self.client.get('/api/dossiers/00000000-0000-0000-0000-000000000000/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_returns_200(self):
        dossier = self._make_dossier()
        response = self.client.patch(
            f'/api/dossiers/{dossier.id}/',
            {'prime': 999.0},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['prime']), 999.0)
        dossier.refresh_from_db()
        self.assertEqual(dossier.prime, 999.0)

    def test_delete_returns_204_and_removes_from_db(self):
        dossier = self._make_dossier()
        self.assertEqual(Dossier.objects.count(), 1)
        response = self.client.delete(f'/api/dossiers/{dossier.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Dossier.objects.count(), 0)


class DossierStatsTest(APITestCase):

    def _make_dossier(self, **kwargs):
        defaults = {
            'beneficiaire': 'Jean Dupont',
            'type_travaux': 'isolation',
            'volume': 100.0,
            'prime': 500.0,
        }
        defaults.update(kwargs)
        return Dossier.objects.create(**defaults)

    def test_stats_empty_db(self):
        response = self.client.get('/api/dossiers/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_dossiers'], 0)
        self.assertEqual(response.data['somme_volumes'], 0)
        self.assertEqual(response.data['prix_unitaire_moyen'], 0)

    def test_stats_with_dossiers(self):
        self._make_dossier(volume=100.0, prime=500.0)
        self._make_dossier(volume=100.0, prime=700.0)
        response = self.client.get('/api/dossiers/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_dossiers'], 2)
        self.assertAlmostEqual(response.data['somme_volumes'], 200.0)
        self.assertAlmostEqual(response.data['prix_unitaire_moyen'], 6.0)
