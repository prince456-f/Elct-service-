# ⚡ TL Elect Services — Backend API

Backend Node.js + Express + SQLite pour le site TL Elect Services.

---

## 📁 Structure du projet

```
tl-elect-backend/
├── src/
│   ├── server.js          ← Point d'entrée
│   ├── database.js        ← Base de données SQLite
│   ├── middleware/
│   │   └── auth.js        ← Vérification JWT
│   └── routes/
│       ├── requests.js    ← API publique (soumission de demandes)
│       └── admin.js       ← API admin protégée
├── public/
│   └── index.html         ← Frontend complet
├── data/                  ← Créé automatiquement (base SQLite)
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Démarrage rapide (local)

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Modifier .env selon tes besoins
```

### 3. Démarrer le serveur
```bash
# Production
npm start

# Développement (rechargement auto)
npm run dev
```

### 4. Ouvrir dans le navigateur
```
http://localhost:3000
```

---

## 🔐 Connexion Admin

| Champ      | Valeur            |
|------------|-------------------|
| Utilisateur| `admin`           |
| Mot de passe| `tlelectadmin2024` |

> ⚠️ **Changer le mot de passe** dès la première connexion via l'API :
> `POST /api/admin/change-password`

---

## 🌐 Déploiement gratuit sur Railway

1. Créer un compte sur [railway.app](https://railway.app)
2. Nouveau projet → **Deploy from GitHub repo**
3. Pousser ce code sur GitHub
4. Dans les paramètres Railway, ajouter les variables :
   - `JWT_SECRET` = une longue chaîne aléatoire
   - `PORT` = 3000
5. Ton site sera disponible sur une URL `*.railway.app`

---

## 📡 Routes API

### Public
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/requests` | Soumettre une demande de service |
| `GET` | `/api/health` | Vérification état du serveur |

### Admin (token JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/admin/login` | Connexion admin |
| `GET` | `/api/admin/stats` | Statistiques |
| `GET` | `/api/admin/requests` | Liste des demandes (+ ?status=new&search=...) |
| `GET` | `/api/admin/requests/:id` | Détail d'une demande |
| `PATCH` | `/api/admin/requests/:id/status` | Changer le status (new/done) |
| `DELETE` | `/api/admin/requests/:id` | Supprimer une demande |
| `POST` | `/api/admin/change-password` | Changer le mot de passe |

---

## 📬 Exemple d'appel API (soumission demande)

```json
POST /api/requests
Content-Type: application/json

{
  "name": "Jean Dupont",
  "phone": "680340430",
  "address": "Bastos, Yaoundé",
  "service": "Installation panneaux solaires",
  "message": "J'ai besoin d'une installation pour ma maison"
}
```

---

## 🛠️ Technologies utilisées

- **Node.js** + **Express** — Serveur HTTP
- **better-sqlite3** — Base de données SQLite (fichier local, zéro configuration)
- **jsonwebtoken** — Authentification JWT
- **cors** — Gestion des origines cross-domain
