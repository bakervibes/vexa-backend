# 🚀 Guide de démarrage rapide - Vexa Backend

Ce guide vous permet de démarrer rapidement avec votre backend.

## ⚡ Installation rapide

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine:

```bash
# Copier l'exemple et l'éditer
cp .env.example .env
```

**IMPORTANT**: Remplacez les valeurs par défaut, surtout les secrets JWT!

Exemple de configuration minimale:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/vexa_db?schema=public"
JWT_SECRET="votre-secret-jwt-de-minimum-32-caracteres"
JWT_REFRESH_SECRET="votre-secret-refresh-de-minimum-32-caracteres"
```

**Générer des secrets forts:**

```bash
# Pour JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Pour JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurer la base de données

```bash
# Générer le client Prisma
pnpm prisma:generate

# Créer la première migration
pnpm prisma:migrate

# (Optionnel) Seed la base de données avec des utilisateurs de test
pnpm db:seed
```

### 4. Démarrer le serveur

```bash
# Mode développement (avec hot-reload)
pnpm dev

# Le serveur démarre sur http://localhost:3000
```

## 🧪 Tester l'API

### Health Check

```bash
curl http://localhost:3000/api/health
```

Réponse attendue:

```json
{
  "success": true,
  "message": "Service opérationnel",
  "data": {
    "status": "ok",
    "timestamp": "2024-...",
    "uptime": 123.45,
    "environment": "development"
  },
  "timestamp": "2024-..."
}
```

### Tester la connexion DB

```bash
curl http://localhost:3000/api/health/db
```

## 📝 Premières étapes

### 1. Activer les routes d'authentification (optionnel)

Renommez les fichiers d'exemple:

```bash
mv src/routes/auth.routes.example.ts src/routes/auth.routes.ts
mv src/controllers/auth.controller.example.ts src/controllers/auth.controller.ts
mv src/services/auth.service.example.ts src/services/auth.service.ts
```

Décommentez dans `src/app.ts`:

```typescript
import authRouter from './routes/auth.routes';
// ...
app.use(`${config.server.apiPrefix}/auth`, authRouter);
```

### 2. Créer votre première route

**1. Créez le modèle Prisma** (`prisma/schema.prisma`):

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

**2. Migration:**

```bash
pnpm prisma:migrate
```

**3. Service** (`src/services/post.service.ts`):

```typescript
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/ApiError';

export const getAllPosts = async () => {
  return prisma.post.findMany({
    include: { author: true }
  });
};

export const getPostById = async (id: string) => {
  const post = await prisma.post.findUnique({ 
    where: { id },
    include: { author: true }
  });
  
  if (!post) {
    throw new NotFoundError('Post non trouvé');
  }
  
  return post;
};
```

**4. Controller** (`src/controllers/post.controller.ts`):

```typescript
import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../utils';
import * as postService from '../services/post.service';

export const getPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await postService.getAllPosts();
  sendSuccess(res, posts, 'Posts récupérés');
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.id);
  sendSuccess(res, post, 'Post récupéré');
});
```

**5. Routes** (`src/routes/post.routes.ts`):

```typescript
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { getPosts, getPost } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth';

const router: ExpressRouter = Router();

router.get('/', authenticate, getPosts);
router.get('/:id', authenticate, getPost);

export default router;
```

**6. Enregistrer dans app.ts:**

```typescript
import postRouter from './routes/post.routes';
app.use(`${config.server.apiPrefix}/posts`, postRouter);
```

## 🔧 Commandes utiles

```bash
# Développement
pnpm dev                    # Démarrer en mode dev avec hot-reload

# Build & Production
pnpm build                  # Compiler TypeScript
pnpm start                  # Démarrer en production
pnpm start:prod             # Démarrer avec NODE_ENV=production

# Base de données
pnpm prisma:generate        # Générer le client Prisma
pnpm prisma:migrate         # Créer une migration
pnpm prisma:studio          # Ouvrir l'interface graphique
pnpm prisma:push            # Push le schéma sans migration
pnpm db:seed                # Seed la DB

# TypeScript
pnpm typecheck              # Vérifier les types
```

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Express](https://expressjs.com/)
- [Documentation Zod](https://zod.dev/)
- [README complet](./README.md)

## 🆘 Problèmes courants

### Erreur de connexion à la base de données

Vérifiez que:
1. PostgreSQL est démarré
2. DATABASE_URL est correcte dans `.env`
3. La base de données existe

### Erreur de validation des variables d'environnement

Vérifiez que toutes les variables requises sont dans `.env`:
- DATABASE_URL
- JWT_SECRET (min 32 caractères)
- JWT_REFRESH_SECRET (min 32 caractères)

### Port déjà utilisé

Changez le PORT dans `.env` ou arrêtez le processus utilisant le port 3000:

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

---

**Bon développement! 🎉**

