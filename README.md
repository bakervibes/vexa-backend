# Vexa Backend

Backend moderne et robuste construit avec Node.js, Express, TypeScript et Prisma.

## 🚀 Fonctionnalités

- ✅ **TypeScript** - Sécurité des types et meilleure DX
- ✅ **Prisma ORM** - Gestion de base de données type-safe
- ✅ **Architecture MVC** - Structure claire et maintenable
- ✅ **Gestion d'erreurs centralisée** - Classes d'erreurs personnalisées avec codes HTTP
- ✅ **Validation des requêtes** - Validation avec Zod
- ✅ **Authentification JWT** - Système d'auth complet avec refresh tokens
- ✅ **Middlewares de sécurité** - Helmet, CORS, Rate limiting
- ✅ **Logger personnalisé** - Logs colorés et structurés
- ✅ **Variables d'environnement validées** - Configuration type-safe
- ✅ **Hot reload** - Développement rapide avec ts-node-dev

## 📁 Structure du projet

```
vexa-end/
├── src/
│   ├── config/           # Configuration (env, database)
│   │   ├── env.ts        # Variables d'environnement validées
│   │   └── database.ts   # Client Prisma et connexion
│   │
│   ├── controllers/      # Logique des routes
│   │   ├── health.controller.ts
│   │   └── auth.controller.example.ts
│   │
│   ├── middlewares/      # Middlewares Express
│   │   ├── auth.ts       # Authentification & autorisation
│   │   ├── validate.ts   # Validation des requêtes
│   │   ├── errorHandler.ts  # Gestion d'erreurs
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── requestLogger.ts # Logger de requêtes
│   │
│   ├── routes/          # Définition des routes
│   │   ├── health.routes.ts
│   │   └── auth.routes.example.ts
│   │
│   ├── services/        # Logique métier
│   │   └── auth.service.example.ts
│   │
│   ├── utils/           # Utilitaires
│   │   ├── ApiError.ts      # Classes d'erreurs personnalisées
│   │   ├── asyncHandler.ts  # Wrapper async
│   │   ├── jwt.ts           # Utilitaires JWT
│   │   ├── password.ts      # Hashing de mots de passe
│   │   ├── logger.ts        # Logger personnalisé
│   │   └── response.ts      # Helpers de réponse
│   │
│   ├── types/           # Types TypeScript
│   │   ├── express.d.ts # Extension des types Express
│   │   └── jwt.ts       # Types JWT
│   │
│   ├── validators/      # Schémas de validation Zod
│   │   └── auth.validator.ts
│   │
│   ├── app.ts          # Configuration de l'app Express
│   └── server.ts       # Point d'entrée
│
├── prisma/
│   └── schema.prisma   # Schéma Prisma
│
├── .env                # Variables d'environnement (ne pas commit!)
├── tsconfig.json       # Configuration TypeScript
└── package.json

```

## 🛠️ Installation

### Prérequis

- Node.js >= 18
- pnpm >= 8
- PostgreSQL

### Étapes

1. **Cloner et installer les dépendances**

```bash
cd vexa-end
pnpm install
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine:

```env
# Environnement
NODE_ENV=development

# Serveur
PORT=3000
HOST=localhost

# Base de données (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/vexa_db?schema=public"

# JWT - IMPORTANT: Générer des secrets forts en production
# Vous pouvez utiliser: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API
API_PREFIX=/api

# Logs
LOG_LEVEL=info
```

3. **Générer le client Prisma**

```bash
pnpm prisma:generate
```

4. **Créer et appliquer les migrations**

```bash
pnpm prisma:migrate
```

## 🎯 Utilisation

### Développement

```bash
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`

### Production

```bash
# Build
pnpm build

# Démarrer
pnpm start:prod
```

### Commandes Prisma

```bash
# Générer le client Prisma
pnpm prisma:generate

# Créer et appliquer une migration
pnpm prisma:migrate

# Appliquer les migrations en production
pnpm prisma:migrate:prod

# Synchroniser le schéma sans migration
pnpm prisma:push

# Récupérer le schéma depuis une DB existante
pnpm prisma:pull

# Ouvrir Prisma Studio (interface graphique)
pnpm prisma:studio

# Seed la base de données
pnpm db:seed
```

## 🚀 Déploiement sur Vercel

### Prérequis

- Compte Vercel
- Base de données PostgreSQL accessible publiquement (ex: Neon, Supabase, Railway)
- Variables d'environnement configurées

### Étapes de déploiement

1. **Installer Vercel CLI (optionnel)**

```bash
pnpm add -g vercel
```

2. **Configurer les variables d'environnement sur Vercel**

Dans le dashboard Vercel, allez dans **Settings > Environment Variables** et ajoutez :

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_PREFIX=/api
LOG_LEVEL=info
```

3. **Déployer via Git (recommandé)**

```bash
# Connecter votre repo GitHub/GitLab/Bitbucket à Vercel
# Vercel détectera automatiquement le projet et le déploiera
```

4. **Ou déployer via CLI**

```bash
vercel --prod
```

### Configuration automatique

Le projet est configuré avec :

- **`postinstall` script** : Génère automatiquement le client Prisma après l'installation
- **`vercel.json`** : Configuration de build et de routing
- **`.vercelignore`** : Exclusion des fichiers inutiles

### Migration de la base de données en production

Après le premier déploiement, exécutez les migrations :

```bash
# Via Vercel CLI
vercel env pull .env.production
pnpm db:migrate:prod
```

Ou configurez un script de build personnalisé dans `vercel.json` si nécessaire.

### Notes importantes

- ⚠️ **Ne jamais commit** les fichiers `.env` avec des secrets
- 🔒 Utilisez des secrets forts pour `JWT_SECRET` et `JWT_REFRESH_SECRET` en production
- 🗄️ Assurez-vous que votre base de données PostgreSQL est accessible depuis Vercel
- 🌐 Configurez correctement `CORS_ORIGIN` avec votre domaine frontend

## 📝 Utilisation des classes d'erreurs

Le backend dispose d'un système de gestion d'erreurs centralisé avec des classes spécifiques:

```typescript
import {
  BadRequestError,      // 400
  UnauthorizedError,    // 401
  ForbiddenError,       // 403
  NotFoundError,        // 404
  ConflictError,        // 409
  ValidationError,      // 422
  TooManyRequestsError, // 429
  InternalServerError   // 500
} from '../utils/ApiError';

// Exemple d'utilisation
if (!user) {
  throw new NotFoundError('Utilisateur non trouvé');
}

if (email already exists) {
  throw new ConflictError('Cet email est déjà utilisé');
}
```

## 🔒 Authentification

### Middleware d'authentification

```typescript
import { authenticate, authorize } from '../middlewares/auth'

// Route protégée - nécessite authentification
router.get('/protected', authenticate, controller)

// Route avec autorisation par rôle
router.delete('/admin', authenticate, authorize('ADMIN'), controller)

// Route avec auth optionnelle
router.get('/public', authenticateOptional, controller)
```

### Utilisation dans les controllers

```typescript
export const getMe = asyncHandler(async (req: Request, res: Response) => {
	// req.user contient l'utilisateur authentifié
	const user = req.user
	sendSuccess(res, user, 'Utilisateur récupéré')
})
```

## ✅ Validation des requêtes

Utiliser Zod pour valider les requêtes:

```typescript
import { z } from 'zod'
import { validateBody } from '../middlewares/validate'

// Définir un schéma
const createUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(2),
})

// Utiliser dans une route
router.post('/users', validateBody(createUserSchema), controller)
```

## 📊 Format de réponse standardisé

Toutes les réponses suivent ce format:

### Succès

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Erreur

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Créer de nouvelles fonctionnalités

### 1. Définir le modèle Prisma

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

### 2. Créer le service

```typescript
// src/services/post.service.ts
import { prisma } from '../config/database'
import { NotFoundError } from '../utils/ApiError'

export const getPostById = async (id: string) => {
	const post = await prisma.post.findUnique({ where: { id } })

	if (!post) {
		throw new NotFoundError('Post non trouvé')
	}

	return post
}
```

### 3. Créer le controller

```typescript
// src/controllers/post.controller.ts
import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'
import * as postService from '../services/post.service'

export const getPost = asyncHandler(async (req: Request, res: Response) => {
	const post = await postService.getPostById(req.params.id)
	sendSuccess(res, post, 'Post récupéré')
})
```

### 4. Créer les routes

```typescript
// src/routes/post.routes.ts
import { Router } from 'express'
import { getPost } from '../controllers/post.controller'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.get('/:id', authenticate, getPost)

export default router
```

### 5. Enregistrer les routes dans app.ts

```typescript
import postRouter from './routes/post.routes'
app.use(`${config.server.apiPrefix}/posts`, postRouter)
```

## 🔐 Sécurité

- **Helmet** - Protection des headers HTTP
- **CORS** - Configuration CORS sécurisée
- **Rate Limiting** - Protection contre les attaques par force brute
- **JWT** - Tokens d'authentification sécurisés
- **Bcrypt** - Hashing sécurisé des mots de passe
- **Validation** - Validation stricte des entrées avec Zod
- **Variables d'env validées** - Empêche le démarrage avec une config invalide

## 📚 Technologies utilisées

- **Express** - Framework web
- **TypeScript** - Typage statique
- **Prisma** - ORM moderne
- **Zod** - Validation de schémas
- **JWT** - Authentification
- **Bcrypt** - Hashing de mots de passe
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limit** - Limitation de taux

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT

# vexa-backend
