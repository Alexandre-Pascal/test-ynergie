# Détail des fichiers backend — Ynergie

Ce document explique chaque fichier du backend, son origine (généré automatiquement ou écrit manuellement), et son rôle précis.

---

## Vue d'ensemble de la structure

```
backend/
├── manage.py               ← généré par Django
├── requirements.txt        ← créé manuellement
├── db.sqlite3              ← généré automatiquement au premier `migrate`
│
├── core/                   ← "projet" Django (généré par `django-admin startproject core`)
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
└── api/                    ← "application" Django (généré par `python manage.py startapp api`)
    ├── __init__.py
    ├── apps.py
    ├── models.py
    ├── serializers.py      ← créé manuellement
    ├── views.py
    ├── urls.py             ← créé manuellement
    ├── admin.py
    ├── tests.py
    └── migrations/
        ├── __init__.py
        └── 0001_initial.py ← généré par `makemigrations`
```

---

## La distinction projet / application

En Django, on sépare deux niveaux :

- **Le projet** (`core/`) : c'est le "conteneur" global. Il contient la configuration, les URLs racines, et sait quelles applications sont installées. Il y en a toujours un seul.
- **Les applications** (`api/`) : ce sont des modules fonctionnels et indépendants. Un projet peut en avoir plusieurs (ex : `api`, `users`, `billing`…). Chaque application gère une partie du métier.

---

## Fichiers générés par Django

Ces fichiers sont créés automatiquement lors de l'initialisation du projet. On ne les touche quasiment jamais (sauf `settings.py` et `urls.py`).

---

### `manage.py`

**Généré par** : `django-admin startproject`

C'est la **porte d'entrée en ligne de commande** de tout projet Django. Toutes les commandes passent par lui :

```bash
python manage.py runserver      # démarrer le serveur
python manage.py migrate        # appliquer les migrations à la base de données
python manage.py makemigrations # générer des migrations depuis les modèles
python manage.py createsuperuser # créer un compte admin
python manage.py test           # lancer les tests
```

Il fait une seule chose : pointer vers le bon fichier de configuration (`core/settings.py`) et déléguer la commande à Django.

---

### `core/__init__.py`

**Généré par** : `django-admin startproject`

Fichier vide. Sa seule présence indique à Python que le dossier `core/` est un **module Python** importable. Sans lui, les imports comme `from core.settings import ...` ne fonctionneraient pas.

---

### `core/settings.py`

**Généré par** : `django-admin startproject`  
**Modifié manuellement** : oui (CORS, apps ajoutées)

C'est le **fichier de configuration central** de tout le projet. Il est lu au démarrage. Voici les sections importantes :

```python
SECRET_KEY = 'django-insecure-...'
```
Clé secrète utilisée pour signer les sessions, tokens CSRF, etc. Elle doit rester privée en production et ne jamais être commitée telle quelle.

```python
DEBUG = True
```
En mode `True`, Django affiche des pages d'erreur détaillées et ne cache pas les fichiers statiques. À mettre à `False` en production.

```python
ALLOWED_HOSTS = []
```
Liste des domaines autorisés à accéder au serveur. Vide = tout est autorisé en mode DEBUG. En production, mettre `['monsite.com']`.

```python
INSTALLED_APPS = [
    'django.contrib.admin',    # interface d'administration
    'django.contrib.auth',     # système d'authentification
    'django.contrib.contenttypes',  # système de types de contenu générique
    'django.contrib.sessions', # gestion des sessions
    'django.contrib.messages', # système de messages flash
    'django.contrib.staticfiles', # gestion des fichiers statiques
    'corsheaders',             # ajouté manuellement : gestion CORS
    'rest_framework',          # ajouté manuellement : Django REST Framework
    'api',                     # ajouté manuellement : notre application métier
]
```
Django ne connaît une application que si elle est listée ici. Si tu crées une nouvelle app et que tu oublies de l'ajouter, ses modèles ne seront pas pris en compte.

```python
MIDDLEWARE = [ ... ]
```
Les middlewares sont des couches qui interceptent chaque requête HTTP avant qu'elle arrive à la vue, et chaque réponse avant qu'elle reparte. Ils sont exécutés dans l'ordre. Le plus important pour nous : `CorsMiddleware` (doit être en haut) qui ajoute les headers CORS pour autoriser le frontend à communiquer avec l'API.

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```
Ajouté manuellement. Autorise uniquement le frontend Vite (port 5173) à faire des requêtes vers ce backend. Sans ça, le navigateur bloquerait toutes les requêtes du frontend.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
Déclare la base de données. SQLite stocke tout dans un seul fichier `db.sqlite3` — parfait pour le développement car aucun serveur à installer. En production, on utilise PostgreSQL ou MySQL.

---

### `core/urls.py`

**Généré par** : `django-admin startproject`  
**Modifié manuellement** : oui (ajout de l'include vers `api.urls`)

C'est le **routeur racine** : il associe des URLs à des destinations. Quand une requête arrive, Django consulte ce fichier en premier.

```python
urlpatterns = [
    path('admin/', admin.site.urls),   # toutes les URLs /admin/... vont vers l'interface d'admin
    path('api/', include('api.urls')), # toutes les URLs /api/... sont déléguées à api/urls.py
]
```

`include()` permet de **déléguer** une partie des URLs à un autre fichier. C'est comme un sous-routeur : `api/urls.py` gère tout ce qui commence par `/api/`.

---

### `core/wsgi.py`

**Généré par** : `django-admin startproject`  
**Jamais modifié**

WSGI (Web Server Gateway Interface) est le protocole standard entre Python et les serveurs web classiques (Apache, Nginx, Gunicorn). Ce fichier crée un objet `application` que ces serveurs savent appeler. Il est utilisé en **production** avec Gunicorn par exemple :

```bash
gunicorn core.wsgi:application
```

En développement, `python manage.py runserver` ne l'utilise pas.

---

### `core/asgi.py`

**Généré par** : `django-admin startproject`  
**Jamais modifié**

ASGI (Asynchronous Server Gateway Interface) est la version moderne et asynchrone de WSGI. Il permet de gérer les WebSockets et les connexions longues durée. Non utilisé dans ce projet (on reste sur WSGI).

---

### `api/__init__.py`

**Généré par** : `python manage.py startapp api`

Même rôle que `core/__init__.py` : fichier vide qui déclare `api/` comme module Python importable.

---

### `api/apps.py`

**Généré par** : `python manage.py startapp api`

Contient la classe de configuration de l'application. Django l'utilise pour enregistrer l'app dans le projet.

```python
class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
```

`default_auto_field` définit le type de clé primaire auto-générée par défaut (ici un entier 64 bits). Dans notre modèle, on a choisi un UUID à la place, donc ce paramètre ne s'applique pas à `Dossier`.

---

### `api/admin.py`

**Généré par** : `python manage.py startapp api`  
**Non modifié** (laissé vide)

Ce fichier sert à **enregistrer des modèles dans l'interface d'administration Django**. Django propose une interface web d'admin complète sur `/admin/` pour créer, lire, modifier et supprimer des données sans écrire de code.

Pour l'activer sur notre modèle `Dossier`, il suffirait d'ajouter :

```python
from django.contrib import admin
from .models import Dossier

admin.site.register(Dossier)
```

Actuellement vide = le modèle `Dossier` n'apparaît pas dans l'interface admin.

---

### `api/tests.py`

**Généré par** : `python manage.py startapp api`  
**Non rempli** (placeholder vide)

Fichier destiné à accueillir les tests unitaires et d'intégration. Django fournit un moteur de tests intégré basé sur `unittest`. On peut y écrire des classes héritant de `TestCase` (Django) ou `APITestCase` (DRF) pour tester les modèles, serializers et endpoints.

Actuellement vide — les tests restent à écrire.

---

## Fichiers créés manuellement

Ces fichiers n'existent pas après un `startproject` ou `startapp`. Ils ont été écrits pour ajouter la logique métier de Ynergie.

---

### `api/models.py`

**Généré par** : `python manage.py startapp api` (squelette vide)  
**Rempli manuellement**

C'est le cœur du backend. Un **modèle** est une classe Python qui représente une table en base de données. Django traduit automatiquement cette classe en SQL.

```python
class Dossier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```
Au lieu d'un entier auto-incrémenté classique (1, 2, 3…), on utilise un **UUID** (ex : `a3f2c1d4-...`). Avantages : identifiant unique universel, impossible à deviner, pas d'ordre prévisible.

```python
    beneficiaire = models.CharField(max_length=255)
    type_travaux = models.CharField(max_length=50, choices=TYPE_TRAVAUX_CHOICES)
    volume = models.FloatField()
    prime = models.FloatField()
```
Chaque attribut = une colonne dans la table. `choices` contraint la valeur à une liste fixe — Django valide que la valeur envoyée fait partie des choix autorisés.

```python
    date_creation = models.DateTimeField(auto_now_add=True)
```
`auto_now_add=True` signifie que ce champ est renseigné **automatiquement** à la création et ne peut plus jamais être modifié. Aucun besoin de le passer dans les requêtes POST.

---

### `api/serializers.py`

**Créé manuellement**

Un **serializer** est le traducteur entre Python et JSON. Il fait deux choses :

1. **Sérialiser** : convertir un objet `Dossier` Python en dictionnaire JSON pour le renvoyer dans une réponse API.
2. **Désérialiser + valider** : convertir les données JSON reçues dans une requête POST en objet Python, en vérifiant que tous les champs sont corrects.

```python
class DossierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dossier
        fields = '__all__'           # expose tous les champs du modèle
        read_only_fields = ['id', 'date_creation']  # ces champs ne peuvent pas être envoyés par le client
```

`ModelSerializer` est un raccourci fourni par DRF : il génère automatiquement les règles de validation à partir du modèle Django, sans avoir à tout réécrire à la main.

---

### `api/views.py`

**Généré par** : `python manage.py startapp api` (squelette vide)  
**Rempli manuellement**

Les **vues** contiennent la logique métier : elles reçoivent une requête HTTP, font quelque chose (lire/écrire en base), et renvoient une réponse.

```python
class DossierViewSet(viewsets.ModelViewSet):
    queryset = Dossier.objects.all().order_by('-date_creation')
    serializer_class = DossierSerializer
```

`ModelViewSet` est un raccourci DRF ultra-puissant : en déclarant juste un `queryset` et un `serializer_class`, on obtient **automatiquement** les 6 actions CRUD (list, create, retrieve, update, partial_update, destroy), sans écrire une seule ligne de logique.

`order_by('-date_creation')` : le `-` signifie ordre décroissant (les plus récents en premier).

```python
    @action(detail=False, methods=['get'])
    def stats(self, request):
```

`@action` permet d'ajouter une **route personnalisée** en dehors des 6 actions standards. `detail=False` signifie qu'elle s'applique à la collection (`/api/dossiers/stats/`) et non à un élément précis (`/api/dossiers/{uuid}/stats/`).

À l'intérieur, `Dossier.objects.aggregate(...)` effectue des calculs SQL (SUM) directement en base de données, sans rapatrier tous les enregistrements en Python — bien plus efficace.

---

### `api/urls.py`

**Créé manuellement**

Définit les URLs spécifiques à l'application `api`. Grâce au `DefaultRouter` de DRF, une seule ligne génère automatiquement toutes les URLs nécessaires :

```python
router = DefaultRouter()
router.register(r'dossiers', DossierViewSet, basename='dossier')
```

Ce code génère :
- `GET  /api/dossiers/`
- `POST /api/dossiers/`
- `GET  /api/dossiers/{uuid}/`
- `PUT  /api/dossiers/{uuid}/`
- `PATCH /api/dossiers/{uuid}/`
- `DELETE /api/dossiers/{uuid}/`
- `GET  /api/dossiers/stats/`  ← grâce au `@action`

---

### `requirements.txt`

**Créé manuellement**

Liste toutes les dépendances Python du projet avec leurs versions exactes. Indispensable pour reproduire l'environnement sur une autre machine :

```bash
pip install -r requirements.txt
```

---

## Fichier généré automatiquement (pas par une commande init)

### `api/migrations/0001_initial.py`

**Généré par** : `python manage.py makemigrations`

Une **migration** est une description de la structure de la base de données, écrite en Python. Quand tu modifies un modèle, tu génères une nouvelle migration, et Django l'applique à la base avec `migrate`.

```python
migrations.CreateModel(
    name='Dossier',
    fields=[
        ('id', models.UUIDField(...)),
        ('beneficiaire', models.CharField(...)),
        ...
    ],
)
```

Ce fichier dit à Django : "crée une table `api_dossier` avec ces colonnes". Il ne faut **jamais modifier ces fichiers à la main**. On modifie le modèle dans `models.py`, puis on regénère une migration.

---

### `db.sqlite3`

**Généré par** : `python manage.py migrate`

Le fichier de base de données SQLite. Il contient toutes les tables (y compris celles de Django comme `auth_user`, `django_session`, etc.) et toutes les données. Ce fichier est **exclu du dépôt Git** (via `.gitignore`) car :
- Il peut contenir des données sensibles
- Il est spécifique à chaque environnement
- Chaque développeur recrée le sien avec `python manage.py migrate`

---

## Cycle de vie d'une requête

Pour résumer comment tout s'articule, voici ce qui se passe quand le frontend fait un `POST /api/dossiers/` :

```
1. La requête HTTP arrive sur le serveur Django
2. manage.py / wsgi.py la reçoit
3. core/urls.py : commence par /api/ → délègue à api/urls.py
4. api/urls.py : route vers DossierViewSet.create()
5. api/views.py : DossierViewSet reçoit la requête
6. api/serializers.py : valide les données JSON reçues
7. api/models.py : crée un objet Dossier et l'insère en base
8. La réponse JSON (201 Created) remonte jusqu'au frontend
```
