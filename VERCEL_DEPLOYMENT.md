# 🚀 Guide de déploiement Vercel

## 📋 Prérequis

1. Un compte Vercel (gratuit sur [vercel.com](https://vercel.com))
2. Une base de données PostgreSQL accessible depuis Internet (ex: Aiven, Supabase, Neon, Railway)
3. Votre projet Git (GitHub, GitLab, ou Bitbucket)

---

## 🔧 Étape 1 : Préparer votre base de données

### Options recommandées (gratuites) :

- **[Neon](https://neon.tech)** - PostgreSQL serverless (recommandé pour Vercel)
- **[Supabase](https://supabase.com)** - PostgreSQL avec bonus (auth, storage, etc.)
- **[Aiven](https://aiven.io)** - PostgreSQL managé
- **[Railway](https://railway.app)** - PostgreSQL simple

### Configuration :

1. Créez une nouvelle base de données PostgreSQL
2. Notez l'URL de connexion (format : `postgresql://user:password@host:port/database?sslmode=require`)
3. Assurez-vous que la base accepte les connexions externes

---

## 🌐 Étape 2 : Déployer sur Vercel

### Via l'interface web :

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New Project"**
3. Importez votre repository Git
4. Vercel détectera automatiquement votre projet Node.js

### Configuration du projet :

#### Framework Preset

- Sélectionnez : **"Other"** (car c'est un backend Express)

#### Build & Development Settings

- **Build Command** : `pnpm vercel-build` (ou `npm run vercel-build`)
- **Output Directory** : `dist`
- **Install Command** : `pnpm install` (ou laissez vide pour auto-détection)

#### Root Directory

- Laissez vide (sauf si votre backend est dans un sous-dossier)

---

## 🔐 Étape 3 : Configurer les variables d'environnement

Dans les paramètres du projet Vercel, allez dans **Settings > Environment Variables** et ajoutez :

### Variables obligatoires :

```bash
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT Secrets (GÉNÉREZ DE NOUVEAUX SECRETS POUR LA PRODUCTION!)
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise-minimum-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Environnement
NODE_ENV=production

# CORS (remplacez par l'URL de votre frontend)
CORS_ORIGIN=https://votre-frontend.vercel.app

# API
API_PREFIX=/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Variables optionnelles (si vous les utilisez) :

```bash
# App
VITE_APP_NAME=Vexa

# Server (Vercel gère PORT automatiquement, mais vous pouvez définir HOST)
HOST=0.0.0.0
```

### 🔑 Générer des secrets JWT sécurisés :

```bash
# Dans votre terminal local :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exécutez cette commande 2 fois pour générer `JWT_SECRET` et `JWT_REFRESH_SECRET`.

---

## 📦 Étape 4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`pnpm install`)
   - Exécuter `postinstall` → `prisma generate`
   - Exécuter `vercel-build` → `prisma generate && prisma db push && build`
   - Déployer votre application

---

## ✅ Étape 5 : Vérifier le déploiement

### Vérifier les logs :

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur votre dernier déploiement
3. Consultez les **"Build Logs"** et **"Function Logs"**

### Tester votre API :

```bash
# Remplacez YOUR_VERCEL_URL par l'URL de votre projet
curl https://YOUR_VERCEL_URL.vercel.app/api/health
```

---

## 🔄 Déploiements automatiques

Une fois configuré, chaque `git push` sur votre branche principale déclenchera automatiquement un nouveau déploiement sur Vercel.

### Branches de preview :

- Chaque branche aura sa propre URL de preview
- Parfait pour tester avant de merger

---

## ⚙️ Configuration avancée

### Domaine personnalisé :

1. Allez dans **Settings > Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions DNS

### Variables par environnement :

Vous pouvez définir des variables différentes pour :

- **Production** : branche principale
- **Preview** : toutes les autres branches
- **Development** : environnement local

---

## 🐛 Dépannage

### Erreur "Prisma Client not found"

- Vérifiez que `postinstall` est bien dans `package.json`
- Vérifiez les logs de build

### Erreur de connexion à la base de données

- Vérifiez que `DATABASE_URL` est correctement définie
- Assurez-vous que votre base accepte les connexions externes
- Vérifiez que `sslmode=require` est dans l'URL si nécessaire

### Timeout lors du build

- Le `prisma db push` peut prendre du temps
- Vérifiez que votre base de données est accessible
- Consultez les logs de build pour plus de détails

### CORS errors

- Vérifiez que `CORS_ORIGIN` contient l'URL de votre frontend
- Format : `https://votre-frontend.vercel.app` (sans slash final)

---

## 📚 Ressources utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎯 Checklist finale

- [ ] Base de données PostgreSQL créée et accessible
- [ ] Repository Git connecté à Vercel
- [ ] Toutes les variables d'environnement configurées
- [ ] Secrets JWT générés de manière sécurisée
- [ ] `CORS_ORIGIN` configuré avec l'URL du frontend
- [ ] Premier déploiement réussi
- [ ] API testée et fonctionnelle
- [ ] Logs vérifiés (pas d'erreurs)

---

## 🚨 Sécurité - IMPORTANT !

1. **NE JAMAIS** committer le fichier `.env`
2. Utilisez des secrets JWT différents pour chaque environnement
3. Générez des secrets d'au moins 32 caractères aléatoires
4. Configurez `CORS_ORIGIN` avec l'URL exacte de votre frontend
5. Activez SSL/TLS sur votre base de données (`sslmode=require`)
6. Limitez les accès à votre base de données (whitelist IP si possible)
