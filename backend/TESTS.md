# Tests — Backend Django

## Lancer les tests

```bash
# Depuis le dossier backend/
python3 manage.py test api.tests
```

Django crée automatiquement une **base de données SQLite en mémoire** pour les tests, puis la détruit à la fin. La `db.sqlite3` de développement n'est jamais touchée.

Pour voir le détail de chaque test :

```bash
python3 manage.py test api.tests --verbosity=2
```

---

## Structure

```
backend/api/tests/
├── __init__.py          # rend le dossier importable par Django
├── test_models.py       # tests sur le modèle Dossier
├── test_serializers.py  # tests sur la validation JSON
└── test_views.py        # tests sur les endpoints HTTP
```

---

## Résultats attendus

```
Ran 20 tests in ~0.02s
OK
```

---

## Détail des tests

### `test_models.py` — 4 tests

Ces tests vérifient que le modèle `Dossier` se comporte correctement au niveau de la base de données, indépendamment de l'API.

| Nom du test | Ce qu'il vérifie |
|---|---|
| `test_uuid_auto_generated` | L'`id` est automatiquement un `UUID` valide à la création |
| `test_str_representation` | `str(dossier)` retourne `"Dupont – isolation"` |
| `test_date_creation_auto_set` | `date_creation` est renseignée automatiquement sans la passer en paramètre |
| `test_all_type_travaux_choices_are_valid` | Les 3 valeurs `isolation`, `chauffage`, `pompe à chaleur` sont bien acceptées en base |

---

### `test_serializers.py` — 5 tests

Ces tests vérifient la couche de validation : ce qui est accepté ou rejeté avant d'écrire en base.

| Nom du test | Ce qu'il vérifie |
|---|---|
| `test_serialization_contains_all_fields` | Un `Dossier` sérialisé expose bien les 6 champs (`id`, `beneficiaire`, `type_travaux`, `volume`, `prime`, `date_creation`) |
| `test_id_and_date_creation_are_read_only` | Envoyer un `id` ou une `date_creation` dans le body est ignoré — Django en génère de nouveaux |
| `test_missing_beneficiaire_is_invalid` | Un payload sans `beneficiaire` est rejeté avec une erreur sur ce champ |
| `test_invalid_type_travaux_is_rejected` | La valeur `pompe_a_chaleur` (underscore) est rejetée — seule `pompe à chaleur` (avec espaces et accent) est valide |
| `test_missing_volume_is_invalid` | Un payload sans `volume` est rejeté avec une erreur sur ce champ |

---

### `test_views.py` — 11 tests

Ces tests simulent de vraies requêtes HTTP et vérifient les codes de retour et les données. Organisés en 3 classes.

#### `DossierListCreateTest` — 5 tests

| Méthode | URL | Nom du test | Ce qu'il vérifie |
|---|---|---|---|
| `GET` | `/api/dossiers/` | `test_list_empty_returns_200` | Retourne `200` et une liste vide si aucun dossier en base |
| `GET` | `/api/dossiers/` | `test_list_returns_dossiers_in_reverse_chronological_order` | Le plus récent apparaît en premier dans la liste |
| `POST` | `/api/dossiers/` | `test_create_valid_dossier_returns_201` | Création valide → `201 Created` + UUID dans la réponse + 1 entrée en base |
| `POST` | `/api/dossiers/` | `test_create_invalid_type_travaux_returns_400` | `type_travaux` invalide → `400 Bad Request` avec détail de l'erreur |
| `POST` | `/api/dossiers/` | `test_create_missing_field_returns_400` | Champ manquant → `400 Bad Request` |

#### `DossierDetailTest` — 4 tests

| Méthode | URL | Nom du test | Ce qu'il vérifie |
|---|---|---|---|
| `GET` | `/api/dossiers/{uuid}/` | `test_retrieve_existing_dossier_returns_200` | Retourne `200` et les données du bon dossier |
| `GET` | `/api/dossiers/{uuid}/` | `test_retrieve_unknown_uuid_returns_404` | UUID inconnu → `404 Not Found` |
| `PATCH` | `/api/dossiers/{uuid}/` | `test_partial_update_returns_200` | Mise à jour partielle → `200` + valeur mise à jour en base |
| `DELETE` | `/api/dossiers/{uuid}/` | `test_delete_returns_204_and_removes_from_db` | Suppression → `204 No Content` + dossier absent de la base |

#### `DossierStatsTest` — 2 tests

| Méthode | URL | Nom du test | Ce qu'il vérifie |
|---|---|---|---|
| `GET` | `/api/dossiers/stats/` | `test_stats_empty_db` | Base vide → `total: 0`, `volumes: 0`, `prix_unitaire: 0` |
| `GET` | `/api/dossiers/stats/` | `test_stats_with_dossiers` | 2 dossiers (100+100 volumes, 500+700 primes) → `total: 2`, `volumes: 200`, `prix_unitaire: 6.0` |

---

## Comment fonctionne un test Django

Chaque classe hérite de `TestCase` (pour les modèles et serializers) ou `APITestCase` (pour les vues). Avant chaque test, Django :

1. Crée une base de données vierge en mémoire
2. Applique toutes les migrations
3. Exécute le test
4. Détruit la base et recommence pour le test suivant

Chaque test est donc **totalement isolé** — il ne peut pas être affecté par les données d'un autre test.
