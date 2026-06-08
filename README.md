# GymFlow

GymFlow est une plateforme SaaS de gestion de salles de sport, pensee pour les petites et moyennes salles en Afrique de l'Ouest.

Le produit remplace la gestion papier par une interface simple pour suivre les membres, les abonnements, les entrees, les paiements et les revenus.

## Version actuelle

La version actuelle permet a un gerant de piloter une salle sans cahier papier, avec des flux prets pour un test terrain.

GymFlow couvre:

- creation de compte et creation d'une salle;
- gestion des membres;
- archivage et restauration des membres;
- creation, desactivation et reactivation des formules d'abonnement;
- attribution et renouvellement d'abonnements;
- pointage rapide des membres, y compris plusieurs passages dans la meme journee;
- decompte automatique des seances;
- alertes visuelles pour abonnements expires ou presque termines;
- caisse, paiements manuels, exports CSV et recus imprimables;
- employes terrain avec PIN;
- roles admin / operateur;
- exports de sauvegarde;
- page vitrine publique par salle.

## Stack cible

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL + Auth + RLS
- Vercel

## Documents

- [Perimetre MVP](docs/mvp.md)
- [Parcours utilisateur](docs/user-flows.md)
- [Schema Supabase initial](supabase/schema.sql)
- [Configuration Supabase](docs/supabase-setup.md)
- [Deploiement Vercel](docs/deploy-vercel.md)
- [Checklist lancement](docs/launch-checklist.md)

## Scripts utiles

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## SQL Supabase a executer

Dans Supabase SQL Editor, executer dans cet ordre:

1. `supabase/schema.sql`
2. `supabase/team-management.sql`
3. `supabase/public-pages.sql`
4. `supabase/walk-in-sessions.sql`
