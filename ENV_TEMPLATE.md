# Template de variables d'environnement

Créez un fichier `.env` à la racine du projet avec ces variables:

```env
# ============================================
# ENVIRONNEMENT
# ============================================
NODE_ENV=development

# ============================================
# SERVEUR
# ============================================
PORT=3000
HOST=localhost

# ============================================
# BASE DE DONNÉES (PostgreSQL)
# ============================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://user:password@localhost:5432/vexa_db?schema=public"

# ============================================
# JWT - SÉCURITÉ CRITIQUE!
# ============================================
# IMPORTANT: Générez des secrets forts en production!
# Commande pour générer: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Secret pour les access tokens (min 32 caractères)
JWT_SECRET=changez-ce-secret-en-production-minimum-32-caracteres

# Durée de validité des access tokens
JWT_EXPIRES_IN=7d

# Secret pour les refresh tokens (min 32 caractères)
JWT_REFRESH_SECRET=changez-ce-refresh-secret-en-production-minimum-32-caracteres

# Durée de validité des refresh tokens
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# CORS
# ============================================
# Pour autoriser tous les domaines: *
# Pour autoriser des domaines spécifiques: http://localhost:3001,https://example.com
CORS_ORIGIN=*

# ============================================
# RATE LIMITING (Protection contre les abus)
# ============================================
# Fenêtre de temps en millisecondes (15 minutes = 900000ms)
RATE_LIMIT_WINDOW_MS=900000

# Nombre max de requêtes par fenêtre
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# API
# ============================================
# Préfixe pour toutes les routes API
API_PREFIX=/api

# ============================================
# LOGS
# ============================================
# Niveaux: error | warn | info | debug
LOG_LEVEL=info
```

## 🔐 Génération de secrets sécurisés

### Méthode 1: Node.js (recommandée)

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Méthode 2: OpenSSL

```bash
openssl rand -hex 32
```

### Méthode 3: En ligne (à éviter en production)

Utilisez un générateur de mots de passe sécurisé comme:
- https://1password.com/password-generator/
- https://bitwarden.com/password-generator/

## 📝 Notes importantes

### Base de données

- Assurez-vous que PostgreSQL est installé et démarré
- Créez la base de données avant de lancer l'application:
  ```sql
  CREATE DATABASE vexa_db;
  ```

### Sécurité

- **NE JAMAIS** committer le fichier `.env`
- Utilisez des secrets différents pour chaque environnement
- En production, utilisez des secrets d'au moins 32 caractères générés aléatoirement

### Production

Pour la production, utilisez des gestionnaires de secrets comme:
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Variables d'environnement du service d'hébergement (Heroku, Vercel, etc.)

