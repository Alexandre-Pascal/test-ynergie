# Tests — Frontend React

## Lancer les tests

```bash
# Depuis le dossier frontend/

# Mode watch (relance automatiquement à chaque sauvegarde)
npm run test

# Une seule passe (idéal pour la CI)
npm run test:run

# Avec rapport de couverture de code
npm run test:coverage
```

---

## Stack de tests

| Outil | Rôle |
|---|---|
| **Vitest** | Moteur de tests (équivalent Jest, intégré à Vite) |
| **@testing-library/react** | Rendu des composants React et requêtes dans le DOM |
| **@testing-library/user-event** | Simulation d'interactions utilisateur (frappe, clic, sélection) |
| **@testing-library/jest-dom** | Matchers supplémentaires (`toBeInTheDocument`, `toHaveValue`…) |
| **MSW (Mock Service Worker)** | Interception des requêtes HTTP — simule le backend sans le démarrer |
| **jsdom** | Simule un navigateur dans Node.js |

---

## Structure

```
frontend/src/
├── test/
│   ├── setup.js          # initialisation globale (jest-dom)
│   └── handlers.js       # mock des endpoints API (MSW)
└── __tests__/
    ├── Navbar.test.jsx
    ├── GestionDossiers.test.jsx
    └── Dashboard.test.jsx
```

---

## Résultats attendus

```
✓ src/__tests__/Navbar.test.jsx          (3 tests)
✓ src/__tests__/Dashboard.test.jsx       (4 tests)
✓ src/__tests__/GestionDossiers.test.jsx (7 tests)

Tests  14 passed (14)
```

---

## Le mock API — `src/test/handlers.js`

Les tests ne communiquent **jamais avec le vrai backend**. MSW intercepte les appels Axios et retourne des données fictives :

| Endpoint mocké | Réponse retournée |
|---|---|
| `GET /api/dossiers/` | 2 dossiers fictifs (Jean Dupont / isolation, Marie Martin / chauffage) |
| `POST /api/dossiers/` | `201 Created` avec le dossier créé |
| `GET /api/dossiers/stats/` | `{ total_dossiers: 2, somme_volumes: 200, prix_unitaire_moyen: 5.0 }` |

Dans certains tests, le handler par défaut est **remplacé temporairement** pour simuler un cas d'erreur (API qui plante, liste vide…). Après chaque test, les handlers sont remis à leur état initial (`server.resetHandlers()`).

---

## Détail des tests

### `Navbar.test.jsx` — 3 tests

| Nom du test | Ce qu'il vérifie |
|---|---|
| `affiche les deux liens de navigation` | Les textes "Dossiers" et "Dashboard" sont présents dans le DOM |
| `affiche le logo Ynergie` | Le texte "Ynergie" est présent |
| `le lien actif a la classe text-emerald-700` | Le lien correspondant à la route active est mis en évidence visuellement |

---

### `Dashboard.test.jsx` — 4 tests

| Nom du test | Ce qu'il vérifie |
|---|---|
| `affiche le spinner pendant le chargement` | Le texte "Chargement des statistiques..." est visible avant que l'API réponde |
| `affiche les 3 cartes avec les bonnes valeurs` | Les labels "Nombre de dossiers", "Volume total", "Prix unitaire moyen" et les valeurs `2` et `200` sont présents |
| `affiche le prix unitaire moyen avec 2 décimales et €` | Le texte `5,00 €` est affiché (format français) |
| `affiche un message d'erreur si l'API échoue` | Si l'endpoint `/stats/` renvoie une erreur réseau, le message d'erreur s'affiche |

---

### `GestionDossiers.test.jsx` — 7 tests

| Nom du test | Ce qu'il vérifie |
|---|---|
| `affiche le spinner pendant le chargement` | "Chargement des dossiers..." visible avant que l'API réponde |
| `affiche les dossiers après chargement` | "Jean Dupont" et "Marie Martin" apparaissent dans le tableau après la réponse API |
| `affiche "Aucun dossier trouvé" sur liste vide` | Si l'API renvoie `[]`, le message vide s'affiche |
| `affiche un message d'erreur si l'API échoue` | Si l'endpoint `/dossiers/` plante, le message d'erreur s'affiche |
| `affiche une erreur sur soumission du formulaire vide` | Cliquer sur "Ajouter" sans remplir les champs affiche "Tous les champs sont obligatoires." |
| `soumet le formulaire correctement et réinitialise les champs` | Remplir tous les champs + soumettre → appel POST effectué + champ "Bénéficiaire" remis à vide |
| `le filtre par type réduit la liste affichée` | Sélectionner "isolation" dans le filtre masque "Marie Martin" (chauffage) et garde "Jean Dupont" |

---

## Comment fonctionne un test React

Chaque test suit ce schéma :

```
1. render()        → le composant est rendu dans un DOM virtuel (jsdom)
2. screen.get*()   → on cherche des éléments par texte, rôle, placeholder…
3. userEvent.*()   → on simule une interaction utilisateur (clic, frappe…)
4. waitFor()       → on attend qu'une assertion devienne vraie (après appel API)
5. expect()        → on vérifie le résultat
```

Les tests qui impliquent des appels API utilisent `waitFor()` pour attendre que MSW réponde et que le composant se mette à jour.
