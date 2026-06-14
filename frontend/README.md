# Franchise App — Frontend

Cette partie de l'application est une Single Page Application (SPA) développée avec **React 18** et **Vite**.

## Technologies

- **Vite** : Outil de build et serveur de développement.
- **React 18** : Librairie UI.
- **AWS SDK v3** : Pour l'upload direct vers S3 via Cognito Identity Pool.
- **Context API** : Gestion de l'état d'authentification.
- **CSS Vanilla** : Design dynamique et moderne sans librairie externe.

## Installation

```bash
cd frontend
npm install
```

## Développement local

```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.
**Note** : Vous devez avoir configuré le fichier `src/config.js` avec les sorties de Terraform pour que l'authentification et l'API fonctionnent.

## Déploiement

### 1. Build
Génère les fichiers statiques dans le dossier `dist/` :
```bash
npm run build
```

### 2. Upload vers S3
Utilisez le nom du bucket `web-frontend` généré par Terraform :
```bash
aws s3 sync dist/ s3://votre-bucket-web-frontend --delete
```

### 3. Invalidation CloudFront
Pour que les changements soient visibles immédiatement :
```bash
aws cloudfront create-invalidation --distribution-id VOTRE_DIST_ID --paths "/*"
```

## Configuration (src/config.js)

Le fichier de configuration doit être mis à jour après le déploiement de l'infrastructure AWS :

```javascript
const config = {
  region:           "us-west-2",
  userPoolId:       "us-west-2_...",
  userPoolClientId: "...",
  identityPoolId:   "us-west-2:...",
  apiUrl:           "https://....cloudfront.net", // URL CloudFront ou API Gateway
  documentsBucket:  "franchise-app-documents-dev"
};
```
