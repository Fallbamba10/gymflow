# Checklist lancement GymFlow

## Technique

- [ ] Executer `supabase/schema.sql`
- [ ] Executer `supabase/team-management.sql`
- [ ] Executer `supabase/public-pages.sql`
- [ ] Configurer `NEXT_PUBLIC_SUPABASE_URL` dans Vercel
- [ ] Configurer `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel
- [ ] Configurer `NEXT_PUBLIC_SITE_URL` dans Vercel
- [ ] Configurer Supabase Auth Site URL
- [ ] Configurer Supabase Auth Redirect URLs
- [ ] Verifier `npm run typecheck`
- [ ] Verifier `npm run lint`
- [ ] Verifier `npm run build`

## Test terrain

- [ ] Creer une salle
- [ ] Completer telephone et adresse
- [ ] Creer 2 ou 3 formules
- [ ] Creer 5 membres reels ou tests
- [ ] Creer un employe PIN
- [ ] Tester un pointage simple
- [ ] Tester deux pointages le meme jour pour le meme membre
- [ ] Tester un renouvellement
- [ ] Tester un paiement manuel
- [ ] Ouvrir et imprimer un recu
- [ ] Exporter les membres CSV
- [ ] Exporter la caisse CSV
- [ ] Exporter la sauvegarde JSON
- [ ] Ouvrir la vitrine `/g/[id]`

## Roles

- [ ] Le compte admin voit Parametres, Equipe et Abonnements
- [ ] Le compte operateur ne voit pas Parametres, Equipe et Abonnements
- [ ] Le compte operateur peut utiliser Membres, Caisse et Pointage

## Avant client

- [ ] Remplacer l'URL Vercel par le domaine final
- [ ] Verifier favicon et logo
- [ ] Verifier les textes de la page publique
- [ ] Faire une sauvegarde JSON apres configuration
