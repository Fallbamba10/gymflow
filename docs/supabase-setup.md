# Configuration Supabase

## 1. Creer le projet

1. Creer un nouveau projet Supabase.
2. Recuperer l'URL du projet.
3. Recuperer la cle publique `anon`.

## 2. Variables locales

Creer `.env.local` a la racine:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

Redemarrer ensuite le serveur:

```bash
npm run dev
```

## 3. Schema SQL

Dans Supabase SQL Editor, executer dans cet ordre:

```text
supabase/schema.sql
supabase/team-management.sql
supabase/public-pages.sql
```

Ces scripts creent:

- les tables MVP;
- les roles `admin` et `operator`;
- les policies RLS;
- le bootstrap automatique du proprietaire en `admin`;
- la fonction `perform_checkin`;
- les employes PIN;
- l'attribution employe sur pointages et paiements;
- la fonction publique controlee pour les vitrines `/g/[id]`.

## 4. Auth

Dans Supabase Authentication:

- activer Email/Password;
- autoriser les nouveaux utilisateurs si la creation de compte est utilisee;
- configurer l'URL du site en local: `http://localhost:3000`;
- ajouter l'URL de redirection: `http://localhost:3000/auth/callback`.

En production, ajouter aussi:

```text
https://ton-domaine.com
https://ton-domaine.com/auth/callback
```

## 5. Test attendu

1. Ouvrir `/signup`.
2. Creer un compte.
3. Aller sur `/onboarding`.
4. Creer une salle.
5. Arriver sur le dashboard.
6. Creer une formule.
7. Creer un membre.
8. Tester pointage, paiement, recu et export.
