# Ynergie — Frontend

Interface web React pour la gestion et la visualisation des dossiers CEE (Certificats d'Économies d'Énergie).

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| React | 19 | Bibliothèque UI |
| Vite | 8 | Build tool & serveur de développement |
| React Router DOM | 7 | Routage côté client |
| Axios | — | Appels HTTP vers l'API Django |
| Tailwind CSS | 4 | Styles utilitaires |
| lucide-react | — | Icônes |

---

## Installation

```bash
# Depuis le dossier frontend/
npm install
```

---

## Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

> Le backend Django doit être démarré sur `http://localhost:8000` pour que les appels API fonctionnent.

---

## Structure du projet

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Barre de navigation partagée
│   ├── pages/
│   │   ├── GestionDossiers.jsx # Page de gestion des dossiers
│   │   └── Dashboard.jsx       # Page de statistiques
│   ├── App.jsx                 # Routeur principal
│   ├── main.jsx                # Point d'entrée React
│   └── index.css               # Import Tailwind CSS
├── index.html
├── vite.config.js
└── package.json
```

---

## Navigation

La `Navbar` est montée globalement dans `App.jsx`, au-dessus des routes. Elle affiche deux liens :

| Lien | Route | Page |
|---|---|---|
| Dossiers | `/dossiers` | Gestion des dossiers |
| Dashboard | `/dashboard` | Statistiques agrégées |

La route `/` redirige automatiquement vers `/dossiers`.

---

## Pages

### `/dossiers` — Gestion des Dossiers

**Fichier :** `src/pages/GestionDossiers.jsx`

Fonctionnalités :
- **Formulaire d'ajout** : saisie du bénéficiaire, du type de travaux, du volume et de la prime. Envoie un `POST /api/dossiers/` au backend.
- **Liste des dossiers** : affiche tous les dossiers récupérés via `GET /api/dossiers/`, avec un badge coloré par type de travaux.
- **Filtre par type** : menu déroulant pour filtrer la liste côté client sans appel réseau supplémentaire.

Types de travaux et couleurs des badges :

| Type | Valeur API | Badge |
|---|---|---|
| Isolation | `isolation` | Bleu |
| Chauffage | `chauffage` | Orange |
| Pompe à chaleur | `pompe à chaleur` | Violet |

Gestion des états : chargement (`loading`), erreur réseau, soumission du formulaire (`submitting`), erreur de formulaire.

---

### `/dashboard` — Dashboard

**Fichier :** `src/pages/Dashboard.jsx`

Appelle `GET /api/dossiers/stats/` au montage du composant et affiche 3 cartes de statistiques :

| Carte | Donnée API | Format |
|---|---|---|
| Nombre de dossiers | `total_dossiers` | Entier formaté `fr-FR` |
| Volume total | `somme_volumes` | Entier formaté `fr-FR` (MWh cumac) |
| Prix unitaire moyen | `prix_unitaire_moyen` | Décimal 2 chiffres + `€` |

---

## Appels API

Toutes les URLs sont appelées directement en dur vers `http://localhost:8000` :

| Page | Méthode | Endpoint |
|---|---|---|
| GestionDossiers | `GET` | `/api/dossiers/` |
| GestionDossiers | `POST` | `/api/dossiers/` |
| Dashboard | `GET` | `/api/dossiers/stats/` |

---

## Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans `frontend/dist/`. Les servir via un serveur statique (Nginx, Vercel, etc.).
