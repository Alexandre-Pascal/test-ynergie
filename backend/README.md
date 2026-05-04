# Ynergie — Backend

API REST Django pour la gestion des dossiers CEE (Certificats d'Économies d'Énergie).

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| Python | 3.x | Langage |
| Django | 4.2.30 | Framework web |
| Django REST Framework | 3.16.1 | Exposition de l'API REST |
| django-cors-headers | 4.9.0 | Gestion du CORS (autorise le frontend Vite) |
| SQLite | — | Base de données (fichier `db.sqlite3`) |

---

## Installation

```bash
# Depuis le dossier backend/
pip install -r requirements.txt
```

---

## Lancer le serveur

```bash
# Appliquer les migrations (à faire une seule fois, ou après changement de modèle)
python manage.py migrate

# Démarrer le serveur de développement
python manage.py runserver
```

Le serveur écoute sur **http://localhost:8000**.

---

## Structure du projet

```
backend/
├── core/
│   ├── settings.py       # Configuration Django (BDD, CORS, apps installées…)
│   ├── urls.py           # Routage racine : /admin/ et /api/
│   ├── wsgi.py           # Point d'entrée WSGI (déploiement)
│   └── asgi.py           # Point d'entrée ASGI
├── api/
│   ├── models.py         # Modèle Dossier
│   ├── serializers.py    # Sérialisation JSON du modèle
│   ├── views.py          # ViewSet + action stats
│   ├── urls.py           # Routeur DRF
│   ├── admin.py          # Interface admin Django
│   ├── apps.py           # Configuration de l'app
│   └── migrations/       # Fichiers de migration BDD
├── db.sqlite3            # Base de données SQLite (générée au premier migrate)
├── manage.py             # CLI Django
└── requirements.txt      # Dépendances Python
```

---

## Modèle de données

### `Dossier`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique, généré automatiquement |
| `beneficiaire` | CharField (255) | Nom du bénéficiaire des travaux |
| `type_travaux` | CharField (choix) | Type de travaux : `isolation`, `chauffage`, `pompe à chaleur` |
| `volume` | FloatField | Volume en MWh cumac |
| `prime` | FloatField | Prime versée en € |
| `date_creation` | DateTimeField | Date d'ajout, renseignée automatiquement |

---

## Endpoints API

Base URL : `http://localhost:8000/api/`

| Méthode | Chemin | Description |
|---|---|---|
| `GET` | `/api/dossiers/` | Liste tous les dossiers (ordre anti-chronologique) |
| `POST` | `/api/dossiers/` | Crée un nouveau dossier |
| `GET` | `/api/dossiers/{uuid}/` | Détail d'un dossier |
| `PUT` | `/api/dossiers/{uuid}/` | Remplacement complet d'un dossier |
| `PATCH` | `/api/dossiers/{uuid}/` | Mise à jour partielle d'un dossier |
| `DELETE` | `/api/dossiers/{uuid}/` | Suppression d'un dossier |
| `GET` | `/api/dossiers/stats/` | Statistiques agrégées |

### Exemple — Créer un dossier (`POST /api/dossiers/`)

```json
{
  "beneficiaire": "Jean Dupont",
  "type_travaux": "isolation",
  "volume": 120.5,
  "prime": 850.00
}
```

Valeurs autorisées pour `type_travaux` : `isolation`, `chauffage`, `pompe à chaleur`.

### Exemple — Réponse de `/api/dossiers/stats/`

```json
{
  "total_dossiers": 42,
  "somme_volumes": 5830.0,
  "prix_unitaire_moyen": 7.25
}
```

`prix_unitaire_moyen` = somme des primes / somme des volumes (retourne `0` si aucun volume).

---

## Configuration CORS

Le frontend React (Vite) tourne sur `http://localhost:5173`. Cette origine est explicitement autorisée dans `core/settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## Notes pour la production

- Remplacer la `SECRET_KEY` par une valeur secrète chargée depuis une variable d'environnement.
- Passer `DEBUG = False` et renseigner `ALLOWED_HOSTS`.
- Remplacer SQLite par PostgreSQL ou MySQL.
- Servir les fichiers statiques via WhiteNoise ou un CDN.
