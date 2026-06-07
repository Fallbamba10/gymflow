# Deploiement Vercel

## 1. GitHub

1. Creer un nouveau repository GitHub.
2. Pousser ce projet dans le repository.
3. Verifier que `.env.local` n'est pas commite.

## 2. Vercel

1. Aller sur Vercel.
2. Cliquer `Add New Project`.
3. Importer le repository GitHub.
4. Framework: Next.js.
5. Build command: `npm run build`.
6. Install command: `npm install`.

## 3. Variables Vercel

Dans `Project Settings` -> `Environment Variables`, ajouter:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xjlhezsebscrevarxulx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=https://ton-domaine.vercel.app
```

Ne jamais ajouter la cle `sb_secret_...` dans les variables publiques.

## 4. Supabase Auth

Dans Supabase -> Authentication -> URL Configuration:

```text
Site URL:
https://ton-domaine.vercel.app

Redirect URLs:
http://localhost:3000/auth/callback
https://ton-domaine.vercel.app/auth/callback
```

## 5. Verification

Apres deploiement:

1. Ouvrir l'URL Vercel.
2. Se connecter.
3. Verifier le dashboard.
4. Creer une formule.
5. Creer un membre.
6. Tester le pointage.
7. Tester un paiement et ouvrir son recu.
8. Tester `/settings/export`.
9. Ouvrir la vitrine publique depuis `Parametres` -> `Vitrine salle`.

## 6. Domaine final

Quand le domaine est pret:

1. Ajouter le domaine dans Vercel.
2. Mettre a jour `NEXT_PUBLIC_SITE_URL`.
3. Mettre a jour Supabase Auth:
   - Site URL;
   - Redirect URLs.
4. Redeployer.
