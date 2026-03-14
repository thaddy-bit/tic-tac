This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## MTN MoMo (sandbox)

Variables d'environnement pour le paiement MTN Money :

- `MTN_COLLECTION_SUBSCRIPTION_KEY` : clé primaire (abonnement Collection) du portail MTN
- `MTN_CALLBACK_HOST` : host du callback uniquement (ex. `webhook.site` ou `ton-app.vercel.app`)
- `MTN_API_USER_REFERENCE` : UUID v4 (optionnel ; généré et renvoyé par la route si absent)
- `MTN_MOMO_BASE_URL` : optionnel, défaut `https://sandbox.momodeveloper.mtn.com`
- `MTN_API_KEY` : clé secrète générée à l’étape 2 (après create-apikey)
- `MTN_CALLBACK_SECRET` : optionnel, pour vérifier la signature des callbacks

**Étape 1 – Créer l’API User** (une fois, réservé admin) :  
`POST /api/paiement/mtn/create-apiuser`. Ajouter le `xReferenceId` reçu dans `.env` comme `MTN_API_USER_REFERENCE`.

**Étape 2 – Générer l’API Key** (une fois, après l’étape 1) :  
`POST /api/paiement/mtn/create-apikey`. Copier l’`apiKey` reçue dans `.env` comme `MTN_API_KEY` (MTN ne la renverra plus).

**Étapes 3 & 4 – Paiement** : à chaque clic « Valider » (mode MTN Money), l’app obtient un token (étape 3) puis envoie un Request to Pay (étape 4). Config requise : `MTN_CALLBACK_URL` (URL complète du callback, ex. `https://ton-app.vercel.app/api/paiement/mtn/callback`). Optionnel : `MTN_CURRENCY` (défaut `XAF`), `MTN_TARGET_ENVIRONMENT` (défaut `sandbox`).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
