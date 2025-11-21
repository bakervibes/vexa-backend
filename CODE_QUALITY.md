# Configuration de Qualité de Code

Ce projet utilise plusieurs outils pour garantir la qualité du code :

## 🛠️ Outils Configurés

### ESLint

- **Fichier de config** : `eslint.config.mjs`
- **Rôle** : Analyse statique du code TypeScript pour détecter les erreurs et les mauvaises pratiques
- **Commandes** :
  - `pnpm lint` : Lint et corrige automatiquement les erreurs
  - `pnpm lint:check` : Vérifie le linting sans corriger (utilisé en CI/CD)

### Prettier

- **Fichier de config** : `.prettierrc.json`
- **Rôle** : Formatage automatique du code pour une cohérence visuelle
- **Commandes** :
  - `pnpm format` : Formate tous les fichiers dans `src/`

### Husky

- **Dossier** : `.husky/`
- **Rôle** : Git hooks pour automatiser les vérifications avant commit et push
- **Hooks configurés** :
  - `pre-commit` : Exécute `lint-staged` sur les fichiers modifiés
  - `pre-push` : Vérifie le linting et le type-checking avant de pousser

### lint-staged

- **Config** : Dans `package.json`
- **Rôle** : Exécute ESLint et Prettier uniquement sur les fichiers staged (modifiés)
- **Avantage** : Rapide, ne vérifie que ce qui a changé

## 📝 Scripts Disponibles

```bash
# Développement
pnpm dev                 # Lance le serveur en mode développement

# Build
pnpm build              # Build complet avec type-check et lint-check
pnpm build-only         # Build sans vérifications

# Qualité de code
pnpm lint               # Lint et corrige automatiquement
pnpm lint:check         # Vérifie le linting (max 0 warnings)
pnpm format             # Formate le code avec Prettier
pnpm type-check         # Vérifie les types TypeScript

# Base de données
pnpm db:generate        # Génère le client Prisma
pnpm db:migrate         # Crée et applique une migration
pnpm db:push            # Pousse le schéma vers la DB (dev)
pnpm db:seed            # Seed la base de données
pnpm db:studio          # Ouvre Prisma Studio
```

## 🔧 Configuration ESLint

Les règles principales :

- ✅ TypeScript strict avec support des types
- ⚠️ Warnings pour `any` et variables non utilisées
- 🚫 Erreurs pour `debugger`, `var`, etc.
- 📦 Ignore automatiquement : `dist/`, `node_modules/`, fichiers `.js`, `prisma/`

## 🎨 Configuration Prettier

- **Semi** : Non (`;` désactivé)
- **Quotes** : Simple (`'`)
- **Print Width** : 100 caractères
- **Tabs** : Oui (avec tabWidth: 2)
- **Trailing Comma** : ES5
- **End of Line** : LF

## 🚀 Workflow de Développement

1. **Développer** : Écrivez votre code
2. **Commit** :
   - Husky exécute automatiquement `lint-staged`
   - Lint et format uniquement les fichiers modifiés
3. **Push** :
   - Husky vérifie le linting et le type-checking
   - Si tout passe, le push est autorisé

## ⚠️ Notes

- Les warnings ESLint sont tolérés en développement mais doivent être corrigés progressivement
- Le build complet (`pnpm build`) échoue si `lint:check` trouve des warnings
- Pour un commit rapide sans vérifications (déconseillé) : `git commit --no-verify`
